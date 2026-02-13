// Story generation — data-driven narrative engine
// Analyzes wallet features and recent transactions to compose unique stories

import { ARCHETYPES } from "./archetypes";

function truncAddr(addr) {
  if (!addr || addr.length < 10) return addr;
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function fmt(n) {
  if (typeof n !== "number") return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(n < 10 ? 1 : 0);
}

function usd(eth) {
  return "$" + fmt(eth * 2800);
}

function pickRandom(arr, seed) {
  return arr[seed % arr.length];
}

// ─── PATTERN DETECTORS ─────────────────────────────────────────────────────

function detectPatterns(features) {
  const patterns = [];

  if (features.balance > 100) {
    patterns.push({ type: "whale", text: `holds ${fmt(features.balance)} ETH (${usd(features.balance)}) — whale-tier balance`, weight: 10 });
  }
  if (features.totalValueETH > 10000) {
    patterns.push({ type: "volume", text: `moved ${usd(features.totalValueETH)} in total volume across its lifetime`, weight: 8 });
  }
  if (features.uniqueProtocols > 8) {
    patterns.push({ type: "explorer", text: `interacted with ${features.uniqueProtocols} different protocols`, weight: 6 });
  }
  if (features.defiInteractions > 100) {
    patterns.push({ type: "defi_heavy", text: `racked up ${features.defiInteractions} DeFi interactions — swaps, deposits, stakes, and yield claims`, weight: 7 });
  }
  if (features.nftTxCount > 30) {
    patterns.push({ type: "nft_active", text: `traded ${features.nftTxCount} NFTs across marketplaces`, weight: 5 });
  }
  if (features.holdingDaysAvg > 180 && features.sellCount < features.buyCount * 0.3) {
    patterns.push({ type: "diamond_hands", text: `holds positions for an average of ${Math.round(features.holdingDaysAvg)} days with minimal selling (${features.sellCount} sells vs ${features.receiveCount} buys)`, weight: 7 });
  }
  if (features.txFrequency > 20) {
    patterns.push({ type: "speed", text: `averages ${fmt(features.txFrequency)} transactions per day`, weight: 6 });
  }
  if (features.bridgeTxCount > 5 && features.chainCount > 2) {
    patterns.push({ type: "bridge", text: `executed ${features.bridgeTxCount} bridge transactions across ${features.chainCount} chains`, weight: 5 });
  }
  if (features.lpPositions > 3) {
    patterns.push({ type: "lp", text: `made ${features.lpPositions} liquidity position changes — actively managing pool exposure`, weight: 5 });
  }
  if (features.uniqueTokens > 25) {
    patterns.push({ type: "diverse_tokens", text: `touched ${features.uniqueTokens} different tokens`, weight: 4 });
  }
  if (features.walletAgeDays < 30 && features.totalTx > 20) {
    patterns.push({ type: "fast_start", text: `is only ${features.walletAgeDays} days old but already has ${features.totalTx} transactions`, weight: 6 });
  }
  if (features.walletAgeDays > 1000) {
    patterns.push({ type: "veteran", text: `has been active for over ${Math.round(features.walletAgeDays / 365)} years on-chain`, weight: 4 });
  }
  if (features.profitRatio > 0.65) {
    patterns.push({ type: "profitable", text: `shows above-average timing on entries and exits`, weight: 5 });
  }
  if (features.profitRatio < 0.3) {
    patterns.push({ type: "losing", text: `consistently enters positions after price peaks`, weight: 4 });
  }

  return patterns.sort((a, b) => b.weight - a.weight);
}

// ─── RECENT TX SUMMARIZER ───────────────────────────────────────────────────

function summarizeRecentTxs(address, features) {
  const txs = features.recentTxs || [];
  if (txs.length === 0) return null;

  const highlights = [];
  const addrLower = address?.toLowerCase();

  for (const tx of txs.slice(0, 5)) {
    const valETH = parseFloat(tx.value || 0) / 1e18;
    const fn = tx.functionName || "";
    const fnName = fn.split("(")[0];

    if (valETH > 10) {
      const direction = tx.from?.toLowerCase() === addrLower ? "sent" : "received";
      highlights.push(`${direction} ${fmt(valETH)} ETH in a single transaction`);
    } else if (fnName && fnName !== "0x" && fnName.length > 1) {
      const readable = fnName.replace(/([A-Z])/g, " $1").trim().toLowerCase();
      highlights.push(`called ${readable}`);
    }
  }

  return highlights.length > 0 ? highlights.slice(0, 2) : null;
}

// ─── ARCHETYPE-SPECIFIC INSIGHTS ────────────────────────────────────────────

const ARCHETYPE_INSIGHTS = {
  "Smart Money": (f) => {
    const insights = [];
    if (f.avgTxValue > 10) insights.push(`Average transaction size of ${fmt(f.avgTxValue)} ETH signals institutional-grade positioning.`);
    if (f.profitRatio > 0.6) insights.push(`Entry and exit timing consistently outperforms the market.`);
    if (f.uniqueProtocols > 4) insights.push(`Capital distributed across ${f.uniqueProtocols} protocols, reducing concentration risk.`);
    if (f.holdingDaysAvg > 30) insights.push(`Positions held an average of ${Math.round(f.holdingDaysAvg)} days before any exit — patience is the edge.`);
    return insights;
  },
  "Early Airdrop Farmer": (f) => {
    const insights = [];
    insights.push(`Systematically touching ${f.uniqueProtocols} protocols — the signature move of a calculated airdrop strategy.`);
    if (f.bridgeTxCount > 0) insights.push(`${f.bridgeTxCount} bridge transactions suggest multi-chain positioning for maximum snapshot exposure.`);
    if (f.avgTxValue < 5) insights.push(`Keeping transaction values low (avg ${fmt(f.avgTxValue)} ETH) to hit qualifying thresholds without overexposure.`);
    if (f.defiInteractions > 50) insights.push(`${f.defiInteractions} DeFi interactions build the protocol touchpoints that airdrop snapshots reward.`);
    return insights;
  },
  "DeFi Yield Farmer": (f) => {
    const insights = [];
    insights.push(`Actively rotating ${fmt(f.balance)} ETH across ${f.uniqueProtocols} DeFi protocols in pursuit of optimal yield.`);
    if (f.lpPositions > 0) insights.push(`${f.lpPositions} LP position changes indicate aggressive rebalancing between pools.`);
    if (f.txFrequency > 3) insights.push(`Transaction frequency of ${fmt(f.txFrequency)}/day suggests daily yield harvesting and redeployment.`);
    if (f.defiInteractions > 50) insights.push(`With ${f.defiInteractions} DeFi interactions, deeply embedded in the yield ecosystem.`);
    return insights;
  },
  "NFT Flipper": (f) => {
    const insights = [];
    insights.push(`${f.nftTxCount} NFT transactions with an average hold of ${f.avgNftHoldDays} days — clearly optimized for quick flips.`);
    if (f.nftProfitRatio > 0.4) insights.push(`The NFT trades show a positive profit pattern, suggesting sharp collection selection.`);
    if (f.uniqueProtocols > 3) insights.push(`Active across ${f.uniqueProtocols} marketplaces, shopping for the best floor prices.`);
    return insights;
  },
  "Long-term Holder": (f) => {
    const insights = [];
    insights.push(`Conviction play: positions held an average of ${Math.round(f.holdingDaysAvg)} days without significant selling.`);
    if (f.sellCount < f.buyCount * 0.2) insights.push(`Only ${f.sellCount} outgoing vs ${f.receiveCount} incoming transactions — textbook accumulation.`);
    if (f.balance > 10) insights.push(`${fmt(f.balance)} ETH balance represents a significant long-term commitment.`);
    if (f.walletAgeDays > 365) insights.push(`Active since ${f.firstSeenDate}, weathering every crash and rally without flinching.`);
    return insights;
  },
  "Degen Trader": (f) => {
    const insights = [];
    insights.push(`${f.totalTx.toLocaleString()} transactions at ${fmt(f.txFrequency)}/day across ${f.uniqueTokens} tokens — pure degen energy.`);
    if (f.avgHoldHours < 48) insights.push(`Average position duration of just ${fmt(f.avgHoldHours)} hours. In and out before the candle closes.`);
    if (f.uniqueTokens > 20) insights.push(`Touching ${f.uniqueTokens} different tokens shows a spray-and-pray approach to alpha.`);
    if (f.totalValueETH > 100) insights.push(`Despite the chaos, ${usd(f.totalValueETH)} in total volume — serious capital behind the degen plays.`);
    return insights;
  },
  "Liquidity Provider": (f) => {
    const insights = [];
    insights.push(`${f.lpPositions} LP position changes across ${f.uniqueProtocols} protocols — dedicated pool manager.`);
    if (f.defiInteractions > 20) insights.push(`${f.defiInteractions} DeFi interactions suggest constant fee optimization and rebalancing.`);
    if (f.balance > 10) insights.push(`${fmt(f.balance)} ETH deployed as the backbone of decentralized trading markets.`);
    return insights;
  },
  "Fresh Wallet": (f) => {
    const insights = [];
    insights.push(`Created ${f.walletAgeDays} days ago with ${f.totalTx} transactions — early patterns are still forming.`);
    if (f.balance > 1) insights.push(`Funded with ${fmt(f.balance)} ETH — watching closely to see how this capital gets deployed.`);
    if (f.uniqueTokens > 3) insights.push(`Already interacting with ${f.uniqueTokens} tokens. The early moves hint this may not be a newcomer.`);
    return insights;
  },
  "Exit Liquidity": (f) => {
    const insights = [];
    insights.push(`Entry timing across ${f.uniqueTokens} tokens consistently aligns with local price peaks.`);
    if (f.profitRatio < 0.3) insights.push(`On-chain signals indicate below-average returns — buying into hype cycles late.`);
    if (f.totalTx > 50) insights.push(`${f.totalTx} transactions over ${f.walletAgeDays} days, but volume hasn't translated to profit.`);
    return insights;
  },
  "Bot-like Behavior": (f) => {
    const insights = [];
    insights.push(`${f.totalTx.toLocaleString()} transactions at ${fmt(f.txFrequency)}/day with machine-like precision in timing and gas.`);
    if (f.uniqueProtocols > 3) insights.push(`Operating across ${f.uniqueProtocols} protocols, likely running MEV extraction or arbitrage.`);
    if (f.gasOptimizationScore > 0.7) insights.push(`Gas optimization score suggests sophisticated automated execution.`);
    return insights;
  },
};

// ─── OPENING LINES ──────────────────────────────────────────────────────────

const OPENERS = {
  "Smart Money": [
    "This wallet reads the market before the market reads itself.",
    "Disciplined capital allocation with conviction-level sizing.",
    "A pattern of buying blood and selling euphoria.",
  ],
  "Early Airdrop Farmer": [
    "This wallet is everywhere a snapshot might happen.",
    "Methodically positioning across every pre-token protocol.",
    "The airdrop playbook, executed with surgical precision.",
  ],
  "DeFi Yield Farmer": [
    "Capital never sleeps in this wallet — it farms.",
    "Yield optimization at its most relentless.",
    "Every idle ETH is a missed opportunity for this wallet.",
  ],
  "NFT Flipper": [
    "Buy floor, sell ceiling — that mantra lives here.",
    "Quick hands and a sharp eye for undervalued JPEGs.",
    "This wallet turns digital art into digital profit.",
  ],
  "Long-term Holder": [
    "While others panic sold, this wallet held through the storm.",
    "Conviction measured not in days, but in years.",
    "The definition of diamond hands, backed by on-chain data.",
  ],
  "Degen Trader": [
    "Speed is the strategy. Volume is the game.",
    "This wallet moves fast and touches everything.",
    "Pure alpha hunting across the entire token universe.",
  ],
  "Liquidity Provider": [
    "The backbone of decentralized markets — a dedicated LP.",
    "Providing the depth that makes DeFi actually work.",
    "This wallet earns while everyone else trades.",
  ],
  "Fresh Wallet": [
    "A new player enters the on-chain arena.",
    "Early days, but the first moves tell a story.",
    "The journey of a thousand transactions begins with one.",
  ],
  "Exit Liquidity": [
    "The market needed a buyer at the top — this wallet answered.",
    "A cautionary tale of chasing momentum.",
    "Timing is everything, and this wallet keeps missing it.",
  ],
  "Bot-like Behavior": [
    "Precision that no human hand could achieve.",
    "When the algorithm is the trader.",
    "Machine-grade execution running 24/7.",
  ],
};

// ─── MAIN STORY GENERATOR ───────────────────────────────────────────────────

export function generateStory(address, archetype, features) {
  const addr = truncAddr(address);
  const hash = Array.from(address).reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // 1. Opening — archetype-flavored, deterministic per address
  const openers = OPENERS[archetype] || OPENERS["Fresh Wallet"];
  const opener = pickRandom(openers, hash);

  // 2. Core data summary
  const agePart = features.walletAgeDays > 365
    ? `${(features.walletAgeDays / 365).toFixed(1)} years`
    : `${features.walletAgeDays} days`;
  const core = `Wallet ${addr} has been active for ${agePart}, executing ${features.totalTx.toLocaleString()} transactions with ${fmt(features.balance)} ETH currently on hand.`;

  // 3. Archetype-specific insights (pick best 2)
  const insightFn = ARCHETYPE_INSIGHTS[archetype];
  const insights = insightFn ? insightFn(features) : [];
  const insightText = insights.slice(0, 2).join(" ");

  // 4. Notable pattern (pick the top one not already covered)
  const patterns = detectPatterns(features);
  const extraPattern = patterns.length > 0
    ? `Notably, the wallet ${patterns[0].text}.`
    : "";

  // 5. Recent tx highlights
  const recentHighlights = summarizeRecentTxs(address, features);
  const recentPart = recentHighlights
    ? `Most recently: ${recentHighlights.join("; ")}.`
    : "";

  // Compose — each section adds a unique layer
  const parts = [opener, core, insightText, extraPattern, recentPart].filter(Boolean);
  return parts.join(" ");
}

// ─── HEADLINE GENERATOR (for leaderboard) ───────────────────────────────────

export function generateHeadline(address, archetype, features, score) {
  const addr = truncAddr(address);
  const info = ARCHETYPES[archetype];
  const icon = info?.icon || "📊";
  const cn = info?.chineseName || "";

  if (features.balance > 500) {
    return `${icon} ${cn} Whale ${addr} holds ${fmt(features.balance)} ETH — Score ${score}`;
  }
  if (features.totalValueETH > 5000) {
    return `${icon} ${cn} ${addr} moved ${usd(features.totalValueETH)} total volume — Score ${score}`;
  }
  if (features.txFrequency > 30) {
    return `${icon} ${cn} ${addr} averaging ${fmt(features.txFrequency)} tx/day — Score ${score}`;
  }
  if (features.defiInteractions > 100) {
    return `${icon} ${cn} ${addr} racked up ${features.defiInteractions} DeFi interactions — Score ${score}`;
  }
  if (features.nftTxCount > 50) {
    return `${icon} ${cn} ${addr} traded ${features.nftTxCount} NFTs — Score ${score}`;
  }
  return `${icon} ${cn} ${addr} classified as ${archetype} — Score ${score}`;
}

export function buildWalletStats(address, features) {
  const hash = Array.from(address).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pnlSign = features.profitRatio > 0.5 ? "+" : "-";
  const pnlVal = Math.abs(features.totalValueETH * (features.profitRatio - 0.5) * 0.3);

  const chainNames = ["Ethereum"];
  if (features.chainCount > 1) chainNames.push("Arbitrum");
  if (features.chainCount > 2) chainNames.push("Base");
  if (features.chainCount > 3) chainNames.push("Optimism");
  if (features.chainCount > 4) chainNames.push("zkSync");

  const protocolPool = [
    "Uniswap", "Aave", "Lido", "Compound", "Curve", "MakerDAO",
    "1inch", "OpenSea", "Blur", "EigenLayer", "Pendle", "Morpho",
    "Jupiter", "Stargate", "LayerZero", "Balancer"
  ];
  const topProtocols = protocolPool
    .sort(() => (hash % 3) - 1)
    .slice(0, Math.min(features.uniqueProtocols, 5));

  return {
    totalTx: features.totalTx,
    totalValue: "$" + fmt(features.totalValueETH * 2800),
    firstSeen: features.firstSeenDate,
    chains: chainNames,
    topProtocols,
    pnl: `${pnlSign}$${fmt(pnlVal * 2800)}`,
    holdingPeriod: `${features.holdingDaysAvg} days avg`,
    balance: `${fmt(features.balance)} ETH`,
    txFrequency: `${fmt(features.txFrequency)}/day`,
    defiInteractions: features.defiInteractions,
    nftTxCount: features.nftTxCount,
    uniqueTokens: features.uniqueTokens,
  };
}
