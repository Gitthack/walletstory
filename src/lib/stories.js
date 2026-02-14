// Story generation — Enhanced narrative storytelling with personality

import { ARCHETYPES } from "./archetypes";

function truncAddr(addr) {
  if (!addr || addr.length < 10) return addr;
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function fmt(n) {
  if (typeof n !== "number") return "0";
	if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(n < 10 ? 1 : 0);
}

function formatDate(dateStr) {
  if (!dateStr) return "recently";
  const date = new Date(dateStr);
  const now = new Date();
  const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (daysDiff === 0) return "today";
  if (daysDiff === 1) return "yesterday";
  if (daysDiff < 30) return `${daysDiff} days ago`;
  if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} months ago`;
  return `${Math.floor(daysDiff / 365)} years ago`;
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return "the quiet pre-dawn hours";
  if (hour < 12) return "morning activity";
  if (hour < 18) return "afternoon sessions";
  return "late-night trading";
}

function getActivityLevel(txFreq) {
  if (txFreq < 1) return "leisurely";
  if (txFreq < 5) return "moderate";
  if (txFreq < 20) return "feverish";
  return "absolutely manic";
}

function getRiskProfile(features) {
  const { totalValueETH, uniqueProtocols, defiInteractions } = features;
  if (totalValueETH > 1000 && uniqueProtocols > 10) return "sophisticated high-roller";
  if (totalValueETH > 100 && uniqueProtocols > 5) return "experienced DeFi navigator";
  if (totalValueETH > 10 && uniqueProtocols > 3) return "confident crypto enthusiast";
  if (totalValueETH < 1) return "cautious explorer";
  return "steady accumulator";
}

// Narrative story generators with personality
const STORY_GENERATORS = {
  "Smart Money": (addr, f) => {
    const timeRef = getTimeOfDay();
    const risk = getRiskProfile(f);
    const strategies = f.uniqueProtocols > 8 
      ? "a diversified portfolio spanning multiple blue-chip protocols"
      : f.uniqueProtocols > 4 
        ? "select positions across established DeFi venues"
        : "focused positions in trusted protocols";
    
    return `🔮 **The Strategic Architect**\n\n` +
      `In ${timeRef}, wallet ${truncAddr(addr)} emerged as a disciplined capital deployer. ` +
      `This ${risk} has systematically moved **${fmt(f.totalValueETH)} ETH** through **${f.totalTx.toLocaleString()}** transactions since ${formatDate(f.firstSeenDate)}.\n\n` +
      `What sets this wallet apart is the surgical precision in ${strategies}. ` +
      `The transaction history reveals a clear methodology: accumulate during market fear, distribute into strength. ` +
      `With **${f.uniqueProtocols} protocols** in the portfolio and **${f.defiInteractions} DeFi interactions** under the belt, ` +
      `this is the kind of address that makes other wallets wonder what they missed.\n\n` +
      `💰 **Current Position**: ${fmt(f.balance)} ETH | 📊 **Portfolio Age**: ${f.walletAgeDays} days | ⚡ **Activity**: ${getActivityLevel(f.txFrequency)}`;
  },

  "Early Airdrop Farmer": (addr, f) => {
    const chains = f.chainCount > 1 ? `${f.chainCount} chains` : "Ethereum";
    const bridging = f.bridgeTxCount > 10 ? "frequent bridge operations" : f.bridgeTxCount > 0 ? "occasional cross-chain ventures" : "focused single-chain strategy";
    
    return `🌾 **The Airdrop Hunter**\n\n` +
      `Wallet ${truncAddr(addr)} is the quintessential airdrop archaeologist — systematically digging through **${chains}** searching for protocol gospel. ` +
      `With **${f.uniqueProtocols} protocols** engaged and **${f.bridgeTxCount} bridge transactions** executed, ` +
      `this hunter has perfected the art of "interact everywhere, hope everywhere."\n\n` +
      `The activity pattern reveals calculated multi-chain deployments: ${bridging}. ` +
      `Over **${f.walletAgeDays} days** of methodical qualifying transactions, ` +
      `this wallet has built a reputation as a serious contender in the airdrop lottery. ${f.bridgeTxCount > 20 ? "Every major testnet and mainnet interaction has been catalogued." : ""}\n\n` +
      `🎯 **Qualification Score**: ${f.defiInteractions} interactions | 🔗 **Chains Explored**: ${chains} | 📅 **Hunting Since**: ${formatDate(f.firstSeenDate)}`;
  },

  "DeFi Yield Farmer": (addr, f) => {
    const rotation = f.lpPositions > 5 ? "constant capital rotation between yield opportunities" : f.lpPositions > 2 ? "strategic LP position adjustments" : "steady yield accumulation";
    const intensity = f.txFrequency > 10 ? "non-stop rebalancing" : f.txFrequency > 3 ? "periodic optimization" : "set-and-forget approach";
    
    return `🌾 **The Yield Optimizer**\n\n` +
      `Deep in the DeFi trenches, wallet ${truncAddr(addr)} has been executing **${rotation}** across **${f.uniqueProtocols}** yield-bearing protocols. ` +
      `That's **${f.lpPositions} LP position changes** and **${f.defiInteractions} DeFi interactions** spanning **${f.walletAgeDays}** calculated days.\n\n` +
      `The transaction signature reads like a yield farmer's diary: ${intensity}. ` +
      `Currently deployed with **${fmt(f.balance)} ETH** in active strategies, ` +
      `this farmer knows that in DeFi, the only free lunch is the one you farm for.\n\n` +
      `💼 **Active Positions**: ${f.lpPositions} LP entries | 📈 **Strategy Intensity**: ${intensity} | ⏱️ **Farming Duration**: ${f.walletAgeDays} days`;
  },

  "NFT Flipper": (addr, f) => {
    const style = f.avgNftHoldDays < 2 ? "rapid-fire flipping" : f.avgNftHoldDays < 7 ? "week-turnaround trading" : "strategic collection building";
    const venues = f.nftTxCount > 50 ? "every major marketplace" : f.nftTxCount > 20 ? "select blue-chip venues" : "focused marketplace activity";
    
    return `🖼️ **The Digital Art Dealer**\n\n` +
      `In the neon-lit corridors of NFT markets, wallet ${truncAddr(addr)} has carved out a reputation as a serious player. ` +
      `**${f.nftTxCount} NFT transactions** executed with ${style}, trading through **${venues}** since ${formatDate(f.firstSeenDate)}.\n\n` +
      `This dealer knows the rhythm of the market — when to pounce on floor drops, when to let winners ride. ` +
      `Average holding period of just **${f.avgNftHoldDays} days** suggests a trader who believes profits are made through turnover, not patience.\n\n` +
      `🎨 **Trading Volume**: ${f.nftTxCount} txs | ⏳ **Avg Hold**: ${f.avgNftHoldDays} days | 🏛️ **Marketplaces**: ${f.uniqueProtocols}`;
  },

  "Long-term Holder": (addr, f) => {
    const conviction = f.holdingDaysAvg > 365 ? "diamond-level conviction" : f.holdingDaysAvg > 180 ? "serious hodler vibes" : "maturing accumulator";
    const ratio = f.receiveCount > f.sellCount * 2 ? "aggressive accumulation" : "balanced approach";
    
    return `💎 **The Diamond Hands**\n\n` +
      `While others panic-sell at every red candle, wallet ${truncAddr(addr)} simply... holds. ` +
      `With an average holding period of **${f.holdingDaysAvg} days** and only **${f.sellCount} outgoing** vs **${f.receiveCount} incoming** transactions, ` +
      `this is ${conviction} personified.\n\n` +
      `Active since ${formatDate(f.firstSeenDate)}, this wallet has weathered multiple cycles, accumulating **${fmt(f.balance)} ETH** along the way. ` +
      `The transaction history reads like a meditation on patience: ${ratio}. In a world of paper-handed traders, this one writes in stone.\n\n` +
      `🏰 **Portfolio Value**: ${fmt(f.balance)} ETH | 📅 **HODL Duration**: ${f.holdingDaysAvg} avg days | 🔄 **Buy/Sell Ratio**: ${(f.receiveCount / Math.max(1, f.sellCount)).toFixed(1)}x`;
  },

  "Degen Trader": (addr, f) => {
    const chaos = f.uniqueTokens > 50 ? "absolute chaos" : f.uniqueTokens > 20 ? "controlled chaos" : "focused degen energy";
    const speed = f.avgHoldHours < 4 ? "lightning-fast entries and exits" : f.avgHoldHours < 24 ? "day-trader cadence" : "swing-trading territory";
    
    return `🚀 **The Degen Commander**\n\n` +
      `Buckle up. Wallet ${truncAddr(addr)} has executed **${f.totalTx.toLocaleString()} transactions** at a mind-bending **${fmt(f.txFrequency)} per day**, ` +
      `touching **${f.uniqueTokens} different tokens** across **${f.uniqueProtocols} protocols** since ${formatDate(f.firstSeenDate)}.\n\n` +
      `This is ${chaos} — ${speed}. ` +
      `Average position duration of just **${fmt(f.avgHoldHours)} hours** suggests a trader who treats the market like a video game on hard mode. ` +
      `Every transaction a story, every token a possibility, every candle a new adventure.\n\n` +
      `⚡ **Speed Rating**: ${f.txFrequency}/day | 🎮 **Tokens Traded**: ${f.uniqueTokens} | 🎯 **Avg Hold**: ${fmt(f.avgHoldHours)} hours`;
  },

  "Liquidity Provider": (addr, f) => {
    const pools = f.lpPositions > 5 ? "multiple yield-generating pools" : f.lpPositions > 2 ? "select liquidity positions" : "foundational LP presence";
    const management = f.defiInteractions > 20 ? "active pool management" : f.defiInteractions > 5 ? "periodic rebalancing" : "set-and-forget approach";
    
    return `🌊 **The Pool Guardian**\n\n` +
      `Behind every successful DeFi protocol stands liquidity — and wallet ${truncAddr(addr)} has been providing it. ` +
      `With **${f.lpPositions} detected liquidity positions** across **${f.uniqueProtocols} protocols**, ` +
      `this guardian has committed **${fmt(f.balance)} ETH** to the cause.\n\n` +
      `The proof is in the **${f.defiInteractions} DeFi interactions** over **${f.walletAgeDays} days** — ${management}. ` +
      `While traders chase pumps and dumps, this wallet quietly earns fees and provides the foundation for everyone else's gambling.\n\n` +
      `💧 **LP Positions**: ${f.lpPositions} | 🛡️ **Capital Deployed**: ${fmt(f.balance)} ETH | 📊 **Protocols**: ${f.uniqueProtocols}`;
  },

  "Fresh Wallet": (addr, f) => {
    const potential = f.totalTx > 20 ? "already showing busy patterns" : f.totalTx > 5 ? "finding its footing" : "just getting started";
    const early = f.balance > 5 ? "with meaningful capital" : f.balance > 1 ? "with cautious exploring steps" : "taking small first steps";
    const watching = f.uniqueTokens > 3 ? "sampling different tokens" : "still discovering the landscape";
    
    return `🌱 **The New Journey**\n\n` +
      `Wallet ${truncAddr(addr)} was born just **${f.walletAgeDays} days ago**, and oh, what a journey it's already on. ` +
      `Already showing ${potential}, this newcomer is ${early} and ${watching}.\n\n` +
      `The blockchain is their textbook, every transaction a lesson learned. ` +
      `With **${f.totalTx} transactions** under the belt and **${f.uniqueTokens} tokens** sampled, ` +
      `this wallet's story is still being written. Will it become a legend or fade into obscurity? Only time and transactions will tell.\n\n` +
      `📖 **Story Just Started**: ${f.walletAgeDays} days young | 💰 **Current Balance**: ${fmt(f.balance)} ETH | 🎯 **Tokens Explored**: ${f.uniqueTokens}`;
  },

  "Exit Liquidity": (addr, f) => {
    const timing = f.sellCount > f.receiveCount * 1.5 ? "consistently buying tops" : "challenging entry timing";
    const resilience = f.totalTx > 50 ? "still trading through it" : f.totalTx > 10 ? "active but struggling" : "taking a break from the market";
    
    return `📉 **The Late Arrival**\n\n` +
      `Wallet ${truncAddr(addr)} has a story many know too well — ${timing}. ` +
      `Over **${f.totalTx} transactions** across **${f.walletAgeDays} days**, ` +
      `this trader has touched **${f.uniqueTokens} tokens**, each hopefully eventually printing green.\n\n` +
      `Currently sitting at **${fmt(f.balance)} ETH**, the journey continues — ${resilience}. ` +
      `In crypto, every cycle offers redemption. Maybe the next entry is the one.\n\n` +
      `⏰ **Market Timing**: Challenged | 💪 **Still Here**: ${f.totalTx} txs | 📊 **Tokens Tried**: ${f.uniqueTokens}`;
  },

  "Bot-like Behavior": (addr, f) => {
    const sophistication = f.txFrequency > 100 ? "military-grade precision" : f.txFrequency > 50 ? "algorithmic consistency" : "automated patterns";
    const purpose = f.uniqueProtocols > 5 ? "multi-protocol operations" : f.uniqueProtocols > 2 ? "focused automation" : "single-purpose bot";
    
    return `🤖 **The Machine**\n\n` +
      `This isn't a person — it's pure execution. Wallet ${truncAddr(addr)} operates with ${sophistication}, ` +
      `executing **${f.totalTx.toLocaleString()} transactions** at **${fmt(f.txFrequency)}/day** across **${f.uniqueProtocols} protocols**.\n\n` +
      `Gas patterns suggest code, not emotion. Timing suggests algorithms, not intuition. ` +
      `Whether it's arbitrage, MEV, or sophisticated yield farming, this ${purpose}. ` +
      `Active for **${f.walletAgeDays} days** with **${fmt(f.balance)} ETH** in the war chest.\n\n` +
      `⚙️ **Bot Grade**: ${sophistication} | 🎯 **Daily Operations**: ${f.txFrequency} txs | 🔧 **Protocols**: ${f.uniqueProtocols}`;
  },
};

export function generateStory(address, archetype, features) {
  const generator = STORY_GENERATORS[archetype];
  if (!generator) {
    return `📊 **Wallet Profile: ${truncAddr(address)}**\n\n` +
      `This wallet has executed **${features.totalTx.toLocaleString()} transactions** with **${fmt(features.totalValueETH)} ETH** in volume ` +
      `across **${features.walletAgeDays} days** of activity.\n\n` +
      `📍 **Balance**: ${fmt(features.balance)} ETH | 🔗 **Protocols**: ${features.uniqueProtocols} | 💱 **Tokens**: ${features.uniqueTokens}`;
  }
  return generator(address, features);
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
    "Jupiter", "Stargate", "LayerZero", "Balancer", "GMX", "SNX",
    "Yearn", "Convex", "Frax", "Rocket Pool", "Gearbox", "Morpho Blue"
  ];
  const topProtocols = protocolPool
    .sort(() => (hash % 5) - 2)
    .slice(0, Math.min(features.uniqueProtocols, 6));

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
    walletAge: `${features.walletAgeDays} days`,
  };
}

// Generate "hot" interesting wallets based on activity patterns
export function generateHotWalletInsights(wallets) {
  if (!wallets || wallets.length === 0) return null;
  
  const sorted = [...wallets].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  
  return {
    hotWallet: top.address,
    hotStory: generateStory(top.address, top.archetype, top.stats),
    trend: sorted.slice(0, 3).map((w, i) => ({
      rank: i + 1,
      address: w.address.slice(0, 8) + "...",
      archetype: w.archetype,
      score: w.score
    })),
    insights: [
      `${sorted.filter(w => w.archetype === "Degen Trader").length} degen traders active`,
      `${sorted.filter(w => w.archetype === "Long-term Holder").length} diamond hands detected`,
      `${sorted.filter(w => w.score > 80).length} high-conviction wallets`,
    ]
  };
}
