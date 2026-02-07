// Wallet archetype definitions, classification logic, and GameFi reward mappings

export const ARCHETYPES = {
  "Smart Money": {
    icon: "🎖️",
    color: "#F59E0B",
    chineseName: "智将",
    pinyinName: "Zhì Jiàng",
    desc: "Strategic accumulator with high conviction plays",
    gameReward: { name: "虎将 Tiger General", icon: "⚔️", type: "general", rarity: "legendary" },
    faction: "wei",
  },
  "Early Airdrop Farmer": {
    icon: "🌾",
    color: "#10B981",
    chineseName: "先锋",
    pinyinName: "Xiān Fēng",
    desc: "Multi-protocol airdrop hunter",
    gameReward: { name: "斥候 Scout", icon: "🗺️", type: "troop", rarity: "rare" },
    faction: "shu",
  },
  "DeFi Yield Farmer": {
    icon: "🌱",
    color: "#22D3EE",
    chineseName: "农耕",
    pinyinName: "Nóng Gēng",
    desc: "Yield optimizer across DeFi protocols",
    gameReward: { name: "良田 Fertile Land", icon: "🏞️", type: "land", rarity: "epic" },
    faction: "wu",
  },
  "NFT Flipper": {
    icon: "🎨",
    color: "#A78BFA",
    chineseName: "商贾",
    pinyinName: "Shāng Gǔ",
    desc: "Quick-turn NFT trader",
    gameReward: { name: "古玩 Ancient Artifact", icon: "🏺", type: "artifact", rarity: "epic" },
    faction: "neutral",
  },
  "Long-term Holder": {
    icon: "💎",
    color: "#6366F1",
    chineseName: "守城",
    pinyinName: "Shǒu Chéng",
    desc: "Diamond hands with conviction",
    gameReward: { name: "城池 Fortress", icon: "🏯", type: "land", rarity: "legendary" },
    faction: "wei",
  },
  "Degen Trader": {
    icon: "🎲",
    color: "#F43F5E",
    chineseName: "赌侠",
    pinyinName: "Dǔ Xiá",
    desc: "High-frequency speculator",
    gameReward: { name: "骑兵 Cavalry", icon: "🐎", type: "troop", rarity: "rare" },
    faction: "shu",
  },
  "Liquidity Provider": {
    icon: "💧",
    color: "#0EA5E9",
    chineseName: "水利",
    pinyinName: "Shuǐ Lì",
    desc: "Stable yield through LP positions",
    gameReward: { name: "河流 River Territory", icon: "🌊", type: "land", rarity: "rare" },
    faction: "wu",
  },
  "Fresh Wallet": {
    icon: "✨",
    color: "#D4D4D8",
    chineseName: "新兵",
    pinyinName: "Xīn Bīng",
    desc: "Newly active on-chain",
    gameReward: { name: "步兵 Infantry", icon: "🛡️", type: "troop", rarity: "common" },
    faction: "neutral",
  },
  "Exit Liquidity": {
    icon: "🚪",
    color: "#EF4444",
    chineseName: "败走",
    pinyinName: "Bài Zǒu",
    desc: "Late entry, unfavorable exits",
    gameReward: { name: "粮草 Provisions", icon: "🍚", type: "resource", rarity: "common" },
    faction: "neutral",
  },
  "Bot-like Behavior": {
    icon: "🤖",
    color: "#71717A",
    chineseName: "机关",
    pinyinName: "Jī Guān",
    desc: "Automated transaction patterns",
    gameReward: { name: "攻城器 Siege Engine", icon: "⚙️", type: "artifact", rarity: "epic" },
    faction: "wei",
  },
};

// Classification rules — applied to on-chain data features
const CLASSIFICATION_RULES = [
  {
    archetype: "Smart Money",
    check: (f) =>
      f.avgTxValue > 10 &&
      f.profitRatio > 0.6 &&
      f.holdingDaysAvg > 30 &&
      f.uniqueTokens < 20,
    weight: 10,
  },
  {
    archetype: "Early Airdrop Farmer",
    check: (f) =>
      f.uniqueProtocols > 8 &&
      f.chainCount > 3 &&
      f.bridgeTxCount > 5 &&
      f.avgTxValue < 5,
    weight: 9,
  },
  {
    archetype: "DeFi Yield Farmer",
    check: (f) =>
      f.defiInteractions > 50 &&
      f.lpPositions > 2 &&
      f.uniqueProtocols > 4,
    weight: 8,
  },
  {
    archetype: "NFT Flipper",
    check: (f) =>
      f.nftTxCount > 20 &&
      f.nftProfitRatio > 0.5 &&
      f.avgNftHoldDays < 14,
    weight: 7,
  },
  {
    archetype: "Long-term Holder",
    check: (f) =>
      f.holdingDaysAvg > 180 &&
      f.sellCount < f.buyCount * 0.2 &&
      f.totalValueETH > 10,
    weight: 8,
  },
  {
    archetype: "Degen Trader",
    check: (f) =>
      f.txFrequency > 10 &&
      f.uniqueTokens > 30 &&
      f.avgHoldHours < 48,
    weight: 7,
  },
  {
    archetype: "Liquidity Provider",
    check: (f) =>
      f.lpPositions > 3 &&
      f.lpValueETH > 5 &&
      f.defiInteractions > 20,
    weight: 6,
  },
  {
    archetype: "Fresh Wallet",
    check: (f) => f.walletAgeDays < 30 && f.totalTx < 50,
    weight: 3,
  },
  {
    archetype: "Exit Liquidity",
    check: (f) =>
      f.profitRatio < 0.3 &&
      f.avgEntryVsMarket > 0.1 &&
      f.totalTx > 10,
    weight: 5,
  },
  {
    archetype: "Bot-like Behavior",
    check: (f) =>
      f.txTimingStdDev < 30 &&
      f.txFrequency > 50 &&
      f.gasOptimizationScore > 0.8,
    weight: 6,
  },
];

/**
 * Classify wallet based on extracted features
 * Returns { primary, secondaryTraits, confidence }
 */
export function classifyWallet(features) {
  const scores = [];

  for (const rule of CLASSIFICATION_RULES) {
    try {
      if (rule.check(features)) {
        scores.push({ archetype: rule.archetype, weight: rule.weight });
      }
    } catch {
      // Feature might be missing, skip
    }
  }

  if (scores.length === 0) {
    return {
      primary: "Fresh Wallet",
      secondaryTraits: [],
      confidence: 50,
    };
  }

  scores.sort((a, b) => b.weight - a.weight);
  const primary = scores[0].archetype;
  const secondaryTraits = scores
    .slice(1, 3)
    .map((s) => s.archetype);
  const confidence = Math.min(98, 60 + scores[0].weight * 4);

  return { primary, secondaryTraits, confidence };
}

/**
 * Deterministic fallback classification from address hash
 * Used when on-chain data is unavailable
 */
export function classifyFromHash(address) {
  const hash = Array.from(address).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const keys = Object.keys(ARCHETYPES);
  const primaryIdx = hash % keys.length;
  const secondaryIdx = (hash * 7 + 3) % keys.length;
  const primary = keys[primaryIdx];
  const secondary =
    keys[secondaryIdx !== primaryIdx ? secondaryIdx : (secondaryIdx + 1) % keys.length];
  const confidence = 70 + (hash % 28);

  return { primary, secondaryTraits: [secondary], confidence };
}
