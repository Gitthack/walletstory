// Story generation — turns wallet features + archetype into a narrative

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

const STORY_TEMPLATES = {
  "Smart Money": (addr, f) =>
    `Strategic accumulator ${truncAddr(addr)} has moved ${fmt(f.totalValueETH)} ETH across ${f.totalTx.toLocaleString()} transactions since ${f.firstSeenDate}. The wallet shows disciplined position management across ${f.uniqueProtocols} protocols, with a clear pattern of buying weakness and selling strength. Current balance sits at ${fmt(f.balance)} ETH after ${f.walletAgeDays} days of activity.`,

  "Early Airdrop Farmer": (addr, f) =>
    `Systematic airdrop farmer ${truncAddr(addr)} has interacted with ${f.uniqueProtocols} protocols across ${f.chainCount} chain${f.chainCount > 1 ? "s" : ""}, with ${f.bridgeTxCount} bridge transactions detected. The wallet maintains qualifying positions with calculated precision — ${f.defiInteractions} DeFi interactions spread across ${f.walletAgeDays} days suggest a well-planned farming strategy.`,

  "DeFi Yield Farmer": (addr, f) =>
    `Yield optimizer ${truncAddr(addr)} actively rotates capital across ${f.uniqueProtocols} DeFi protocols with ${f.lpPositions} LP position changes detected. The wallet has executed ${f.defiInteractions} DeFi interactions over ${f.walletAgeDays} days, maintaining ${fmt(f.balance)} ETH in active deployment. Transaction frequency of ${fmt(f.txFrequency)}/day suggests active rebalancing.`,

  "NFT Flipper": (addr, f) =>
    `NFT specialist ${truncAddr(addr)} has executed ${f.nftTxCount} NFT transactions with a trading pattern focused on quick flips. Average hold time suggests a ${f.avgNftHoldDays}-day turnaround strategy. The wallet has interacted with ${f.uniqueProtocols} marketplaces and protocols since ${f.firstSeenDate}.`,

  "Long-term Holder": (addr, f) =>
    `Diamond hands ${truncAddr(addr)} has maintained positions for an average of ${f.holdingDaysAvg} days without significant selling — only ${f.sellCount} outgoing vs ${f.receiveCount} incoming transactions. Active since ${f.firstSeenDate}, the wallet holds ${fmt(f.balance)} ETH with a buy-and-hold conviction approach across ${f.walletAgeDays} days.`,

  "Degen Trader": (addr, f) =>
    `High-frequency trader ${truncAddr(addr)} has executed ${f.totalTx.toLocaleString()} transactions at a rate of ${fmt(f.txFrequency)} per day, touching ${f.uniqueTokens} different tokens. Average position duration is just ${fmt(f.avgHoldHours)} hours. The wallet shows classic degen behavior — rapid entries and exits across ${f.uniqueProtocols} protocols since ${f.firstSeenDate}.`,

  "Liquidity Provider": (addr, f) =>
    `LP specialist ${truncAddr(addr)} has ${f.lpPositions} detected liquidity position changes across ${f.uniqueProtocols} protocols. The wallet maintains ${fmt(f.balance)} ETH with ${f.defiInteractions} DeFi interactions over ${f.walletAgeDays} days, suggesting active pool management and yield optimization.`,

  "Fresh Wallet": (addr, f) =>
    `Newly active wallet ${truncAddr(addr)} was created ${f.walletAgeDays} days ago and has already executed ${f.totalTx} transactions. Current balance of ${fmt(f.balance)} ETH with ${f.uniqueTokens} unique token interactions. Early activity patterns are still forming — watch this space.`,

  "Exit Liquidity": (addr, f) =>
    `Late entrant ${truncAddr(addr)} shows a pattern of adverse timing across ${f.uniqueTokens} tokens. With ${f.totalTx} transactions over ${f.walletAgeDays} days, the wallet's entry points have consistently been above subsequent price action. Current balance: ${fmt(f.balance)} ETH.`,

  "Bot-like Behavior": (addr, f) =>
    `Automated wallet ${truncAddr(addr)} shows machine-like precision with ${f.totalTx.toLocaleString()} transactions at ${fmt(f.txFrequency)}/day frequency. The transaction timing and gas patterns suggest sophisticated bot operation across ${f.uniqueProtocols} protocols. Active for ${f.walletAgeDays} days with ${fmt(f.balance)} ETH balance.`,
};

export function generateStory(address, archetype, features) {
  const template = STORY_TEMPLATES[archetype];
  if (!template) return `Wallet ${truncAddr(address)} has ${features.totalTx} transactions and ${fmt(features.balance)} ETH.`;
  return template(address, features);
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
