// Tool Orchestrator — step-by-step wallet analysis with full logging
// Each step is a "tool" that fetches, parses, classifies, or generates

import * as provider from "./chainProvider.js";
import { classifyWallet, classifyFromHash } from "./archetypes.js";
import { generateStory, generateHeadline, buildWalletStats } from "./stories.js";
import { generateMockFeatures, extractFeaturesFromRaw } from "./onchain.js";
import { analysisCache } from "./cache.js";
import {
  createToolRun, addStep, completeStep, failStep, skipStep,
  completeRun, markCacheHit,
} from "./toolRunLog.js";

// Default tools that are always available (free)
const DEFAULT_TOOLS = [
  { id: "balance-fetcher", name: "Balance Fetcher", category: "data" },
  { id: "tx-fetcher", name: "Transaction Fetcher", category: "data" },
  { id: "token-fetcher", name: "ERC20 Transfer Parser", category: "data" },
  { id: "nft-fetcher", name: "NFT Transfer Fetcher", category: "data" },
  { id: "feature-extractor", name: "Feature Extractor", category: "analysis" },
  { id: "classifier", name: "Protocol Classifier", category: "analysis" },
  { id: "story-generator", name: "Story Generator", category: "generation" },
  { id: "scorer", name: "Score Calculator", category: "analysis" },
];

/**
 * Run a full wallet analysis with tool logging
 * @param {string} address - Wallet address
 * @param {object} options - { mode, network, depth, tools }
 * @returns {{ result, toolRunLog }}
 */
export async function analyzeWallet(address, options = {}) {
  const {
    mode = "snapshot",      // "realtime" | "snapshot"
    network = "ethereum",
    depth = 200,            // tx fetch depth
    tools = [],             // additional tool IDs from marketplace
  } = options;

  const run = createToolRun(address, mode, network);
  run.toolsUsed = [...DEFAULT_TOOLS.map((t) => t.id), ...tools];

  // ─── Step 0: Cache Check ────────────────────────────────────────────────
  const cacheKey = `${address.toLowerCase()}:${network}:${mode}`;
  const cached = analysisCache.get(cacheKey);
  if (cached.hit) {
    markCacheHit(run);
    completeRun(run, "completed");
    return {
      result: { ...cached.value, cached: true, cacheAge: cached.age },
      toolRunLog: run,
    };
  }

  // ─── Step 1: Fetch Balance ──────────────────────────────────────────────
  let balance = 0;
  let balanceSource = "none";
  {
    const step = addStep(run, "fetch-balance", { address, network });
    try {
      const res = await provider.getBalance(address, network);
      if (res) {
        balance = res.value;
        balanceSource = res.source;
        completeStep(step, { balance, source: res.source }, res.source);
      } else {
        completeStep(step, { balance: 0 }, "none");
      }
    } catch (e) {
      failStep(step, e);
    }
  }

  // ─── Step 2: Fetch Transactions ─────────────────────────────────────────
  let txs = [];
  let txSource = "none";
  {
    const step = addStep(run, "fetch-transactions", { address, network, depth });
    try {
      const res = await provider.getTransactions(address, network, depth);
      txs = res.txs;
      txSource = res.source;
      completeStep(step, { count: txs.length, source: res.source }, res.source);
    } catch (e) {
      failStep(step, e);
    }
  }

  // ─── Step 3: Fetch Token Transfers ──────────────────────────────────────
  let tokenTxs = [];
  let tokenSource = "none";
  {
    const step = addStep(run, "fetch-token-transfers", { address, network });
    try {
      const res = await provider.getTokenTransfers(address, network, 100);
      tokenTxs = res.transfers;
      tokenSource = res.source;
      completeStep(step, { count: tokenTxs.length, source: res.source }, res.source);
    } catch (e) {
      failStep(step, e);
    }
  }

  // ─── Step 4: Fetch NFT Transfers ────────────────────────────────────────
  let nftTxs = [];
  let nftSource = "none";
  {
    const step = addStep(run, "fetch-nft-transfers", { address, network });
    try {
      const res = await provider.getERC721Transfers(address, network, 50);
      nftTxs = res.nfts;
      nftSource = res.source;
      completeStep(step, { count: nftTxs.length, source: res.source }, res.source);
    } catch (e) {
      failStep(step, e);
    }
  }

  // ─── Step 5: Extract Features ───────────────────────────────────────────
  let features = null;
  let dataSource = "live";
  {
    const step = addStep(run, "extract-features", {
      balanceAvailable: balance > 0 || balanceSource !== "none",
      txCount: txs.length,
      tokenTxCount: tokenTxs.length,
      nftTxCount: nftTxs.length,
    });
    try {
      if (balance === 0 && txs.length === 0 && balanceSource === "none") {
        // No data at all — use mock
        features = generateMockFeatures(address);
        dataSource = "mock";
        completeStep(step, { featureCount: Object.keys(features).length, source: "mock" }, "mock");
      } else {
        features = extractFeaturesFromRaw(address, balance, txs, tokenTxs, nftTxs);
        completeStep(step, { featureCount: Object.keys(features).length, source: "computed" }, "computed");
      }
    } catch (e) {
      // Fallback to mock on error
      features = generateMockFeatures(address);
      dataSource = "mock";
      failStep(step, e);
    }
  }

  // ─── Step 6: Classify Wallet ────────────────────────────────────────────
  let classification;
  {
    const step = addStep(run, "classify-wallet", { dataSource });
    try {
      classification = classifyWallet(features);
      if (classification.primary === "Fresh Wallet" && classification.confidence === 50 && dataSource === "mock") {
        classification = classifyFromHash(address);
      }
      completeStep(step, {
        primary: classification.primary,
        secondary: classification.secondaryTraits,
        confidence: classification.confidence,
      }, "computed");
    } catch (e) {
      classification = classifyFromHash(address);
      failStep(step, e);
    }
  }

  const { primary, secondaryTraits, confidence } = classification;

  // ─── Step 7: Generate Story ─────────────────────────────────────────────
  let story;
  {
    const step = addStep(run, "generate-story", { archetype: primary });
    try {
      story = generateStory(address, primary, features);
      completeStep(step, { length: story.length, preview: story.slice(0, 100) }, "computed");
    } catch (e) {
      story = `Analysis of wallet ${address.slice(0, 10)}... completed.`;
      failStep(step, e);
    }
  }

  // ─── Step 8: Calculate Score ────────────────────────────────────────────
  let score;
  {
    const step = addStep(run, "calculate-score", { confidence, totalTx: features.totalTx });
    score = Math.min(
      99,
      Math.floor(
        (confidence * 0.3) +
        (Math.min(features.totalTx, 10000) / 10000 * 30) +
        (Math.min(features.totalValueETH, 100000) / 100000 * 40)
      )
    );
    completeStep(step, { score }, "computed");
  }

  // ─── Build Result ───────────────────────────────────────────────────────
  const stats = buildWalletStats(address, features);

  // Structured signals for transparency
  const signals = buildSignals(features, primary, txs);

  // Raw references (key tx hashes)
  const rawRefs = txs.slice(0, 5).map((tx) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: (parseFloat(tx.value || 0) / 1e18).toFixed(4) + " ETH",
    method: (tx.functionName || "").split("(")[0] || "transfer",
  }));

  const result = {
    address,
    archetype: primary,
    secondaryTraits,
    confidence,
    story,
    stats,
    score,
    dataSource,
    signals,
    rawRefs,
    toolRunLogId: run.id,
    network,
    mode,
    features, // raw features for headline generation and further analysis
  };

  // Cache result
  analysisCache.set(cacheKey, result);

  // Complete run
  completeRun(run, "completed");

  return { result, toolRunLog: run };
}

// ─── SIGNAL BUILDER ─────────────────────────────────────────────────────────

function buildSignals(features, archetype, txs) {
  const signals = [];

  signals.push({
    name: "Activity Level",
    value: features.totalTx > 1000 ? "Very High" : features.totalTx > 100 ? "High" : features.totalTx > 20 ? "Moderate" : "Low",
    detail: `${features.totalTx} transactions over ${features.walletAgeDays} days`,
    category: "activity",
  });

  signals.push({
    name: "Transaction Rhythm",
    value: `${features.txFrequency?.toFixed(1) || 0}/day`,
    detail: features.txFrequency > 10 ? "High-frequency trader pattern" : features.txFrequency > 1 ? "Regular user" : "Infrequent",
    category: "activity",
  });

  signals.push({
    name: "DeFi Engagement",
    value: features.defiInteractions > 50 ? "Deep" : features.defiInteractions > 10 ? "Active" : features.defiInteractions > 0 ? "Light" : "None",
    detail: `${features.defiInteractions} interactions (swaps, deposits, stakes, claims)`,
    category: "protocol",
  });

  signals.push({
    name: "Protocol Diversity",
    value: `${features.uniqueProtocols} protocols`,
    detail: features.uniqueProtocols > 8 ? "Multi-protocol power user" : "Focused user",
    category: "protocol",
  });

  if (features.nftTxCount > 0) {
    signals.push({
      name: "NFT Activity",
      value: `${features.nftTxCount} trades`,
      detail: `Avg hold: ${features.avgNftHoldDays} days`,
      category: "nft",
    });
  }

  if (features.bridgeTxCount > 0) {
    signals.push({
      name: "Cross-chain Activity",
      value: `${features.bridgeTxCount} bridges`,
      detail: `Active on ${features.chainCount} chains`,
      category: "bridge",
    });
  }

  signals.push({
    name: "Holding Behavior",
    value: features.holdingDaysAvg > 180 ? "Long-term" : features.holdingDaysAvg > 30 ? "Medium-term" : "Short-term",
    detail: `Avg hold: ${Math.round(features.holdingDaysAvg)} days, sell ratio: ${features.sellCount}/${features.buyCount}`,
    category: "behavior",
  });

  signals.push({
    name: "Value Profile",
    value: features.balance > 100 ? "Whale" : features.balance > 10 ? "Large" : features.balance > 1 ? "Medium" : "Small",
    detail: `Balance: ${features.balance?.toFixed(2)} ETH, Total moved: ${features.totalValueETH?.toFixed(0)} ETH`,
    category: "value",
  });

  return signals;
}

export { DEFAULT_TOOLS };
