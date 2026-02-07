// Three Kingdoms game data — provinces, factions, map grid, reward tables

// ─── FACTIONS ────────────────────────────────────────────────────────────────

export const FACTIONS = {
  wei: {
    name: "魏",
    fullName: "曹魏 Cáo Wèi",
    color: "#4A90D9",
    lord: "曹操 Cao Cao",
    motto: "唯才是举 — Merit Above All",
    provinces: ["幽州", "冀州", "青州", "兖州", "徐州", "司隶"],
  },
  shu: {
    name: "蜀",
    fullName: "蜀汉 Shǔ Hàn",
    color: "#D94A4A",
    lord: "刘备 Liu Bei",
    motto: "仁义为本 — Virtue as Foundation",
    provinces: ["益州", "汉中", "凉州"],
  },
  wu: {
    name: "吴",
    fullName: "东吴 Dōng Wú",
    color: "#4AD97A",
    lord: "孙权 Sun Quan",
    motto: "江东基业 — Legacy of the East",
    provinces: ["扬州", "荆州", "交州"],
  },
  neutral: {
    name: "中",
    fullName: "中立 Neutral",
    color: "#B8A080",
    lord: "—",
    motto: "天下未定 — The Realm Undecided",
    provinces: [],
  },
};

// ─── PROVINCES (13 provinces of Han dynasty) ─────────────────────────────────

export const PROVINCES = [
  { id: "youzhou",   name: "幽州", pinyin: "Yōu Zhōu",   faction: "wei",     x: 5, y: 0, desc: "Northern frontier" },
  { id: "jizhou",    name: "冀州", pinyin: "Jì Zhōu",     faction: "wei",     x: 4, y: 1, desc: "Heart of the north" },
  { id: "bingzhou",  name: "并州", pinyin: "Bìng Zhōu",   faction: "wei",     x: 2, y: 1, desc: "Mountain passes" },
  { id: "qingzhou",  name: "青州", pinyin: "Qīng Zhōu",   faction: "wei",     x: 6, y: 1, desc: "Eastern coast" },
  { id: "yanzhou",   name: "兖州", pinyin: "Yǎn Zhōu",    faction: "wei",     x: 5, y: 2, desc: "Central plains" },
  { id: "xuzhou",    name: "徐州", pinyin: "Xú Zhōu",     faction: "wei",     x: 6, y: 2, desc: "Eastern gateway" },
  { id: "sili",      name: "司隶", pinyin: "Sī Lì",       faction: "wei",     x: 3, y: 2, desc: "Imperial capital" },
  { id: "liangzhou", name: "凉州", pinyin: "Liáng Zhōu",  faction: "shu",     x: 0, y: 2, desc: "Western frontier" },
  { id: "yizhou",    name: "益州", pinyin: "Yì Zhōu",     faction: "shu",     x: 1, y: 4, desc: "Shu heartland" },
  { id: "hanzhong",  name: "汉中", pinyin: "Hàn Zhōng",   faction: "shu",     x: 2, y: 3, desc: "Strategic valley" },
  { id: "jingzhou",  name: "荆州", pinyin: "Jīng Zhōu",   faction: "wu",      x: 4, y: 4, desc: "Contested heartland" },
  { id: "yangzhou",  name: "扬州", pinyin: "Yáng Zhōu",   faction: "wu",      x: 6, y: 4, desc: "Jiangnan prosperity" },
  { id: "jiaozhou",  name: "交州", pinyin: "Jiāo Zhōu",   faction: "wu",      x: 3, y: 5, desc: "Southern tropics" },
];

// ─── TERRITORY MAP (8×7 grid) ────────────────────────────────────────────────
// Each cell: { type, province, faction, content }
// Types: mountain, forest, plains, city, castle, river, lake, village, pass, port

export const TERRITORY_MAP = [
  // Row 0 - Northern frontier
  [
    { type: "mountain", faction: "neutral" },
    { type: "forest", faction: "neutral" },
    { type: "pass", faction: "wei", label: "雁门" },
    { type: "forest", faction: "wei" },
    { type: "city", faction: "wei", label: "蓟" },
    { type: "castle", faction: "wei", label: "幽州" },
    { type: "forest", faction: "wei" },
    { type: "mountain", faction: "neutral" },
  ],
  // Row 1
  [
    { type: "mountain", faction: "neutral" },
    { type: "forest", faction: "wei" },
    { type: "city", faction: "wei", label: "晋阳" },
    { type: "plains", faction: "wei" },
    { type: "castle", faction: "wei", label: "冀州" },
    { type: "plains", faction: "wei" },
    { type: "castle", faction: "wei", label: "青州" },
    { type: "port", faction: "wei" },
  ],
  // Row 2
  [
    { type: "pass", faction: "shu", label: "潼关" },
    { type: "plains", faction: "shu" },
    { type: "city", faction: "shu", label: "长安" },
    { type: "castle", faction: "wei", label: "洛阳" },
    { type: "plains", faction: "wei" },
    { type: "castle", faction: "wei", label: "兖州" },
    { type: "castle", faction: "wei", label: "徐州" },
    { type: "port", faction: "wei" },
  ],
  // Row 3
  [
    { type: "mountain", faction: "shu" },
    { type: "mountain", faction: "shu" },
    { type: "castle", faction: "shu", label: "汉中" },
    { type: "river", faction: "neutral" },
    { type: "city", faction: "wu", label: "襄阳" },
    { type: "plains", faction: "wu" },
    { type: "river", faction: "neutral" },
    { type: "lake", faction: "wu" },
  ],
  // Row 4
  [
    { type: "mountain", faction: "shu" },
    { type: "castle", faction: "shu", label: "成都" },
    { type: "city", faction: "shu", label: "白帝" },
    { type: "river", faction: "neutral" },
    { type: "castle", faction: "wu", label: "荆州" },
    { type: "lake", faction: "wu", label: "洞庭" },
    { type: "castle", faction: "wu", label: "建业" },
    { type: "port", faction: "wu" },
  ],
  // Row 5
  [
    { type: "forest", faction: "neutral" },
    { type: "mountain", faction: "neutral" },
    { type: "forest", faction: "wu" },
    { type: "city", faction: "wu", label: "交州" },
    { type: "forest", faction: "wu" },
    { type: "plains", faction: "wu" },
    { type: "forest", faction: "wu" },
    { type: "port", faction: "wu" },
  ],
  // Row 6
  [
    { type: "forest", faction: "neutral" },
    { type: "forest", faction: "neutral" },
    { type: "mountain", faction: "neutral" },
    { type: "forest", faction: "neutral" },
    { type: "forest", faction: "neutral" },
    { type: "forest", faction: "neutral" },
    { type: "forest", faction: "neutral" },
    { type: "mountain", faction: "neutral" },
  ],
];

// Visual representation for each tile type
export const TILE_VISUALS = {
  mountain: { emoji: "⛰️", css: "tile-mountain" },
  forest:   { emoji: "🌲", css: "tile-forest" },
  plains:   { emoji: "🌾", css: "tile-plains" },
  city:     { emoji: "🏘️", css: "tile-city" },
  castle:   { emoji: "🏯", css: "tile-castle" },
  river:    { emoji: "🌊", css: "tile-river" },
  lake:     { emoji: "💧", css: "tile-lake" },
  village:  { emoji: "🏠", css: "tile-village" },
  pass:     { emoji: "⛩️", css: "tile-pass" },
  port:     { emoji: "⚓", css: "tile-port" },
};

// ─── REWARD TABLE ────────────────────────────────────────────────────────────

export const REWARD_TABLE = {
  "Smart Money": [
    { name: "虎将 Tiger General", icon: "⚔️", type: "general", rarity: "legendary", power: 95 },
    { name: "神算 Divine Strategist", icon: "📜", type: "advisor", rarity: "epic", power: 85 },
  ],
  "Early Airdrop Farmer": [
    { name: "斥候 Scout", icon: "🗺️", type: "troop", rarity: "rare", power: 45 },
    { name: "暗探 Spy", icon: "🕵️", type: "troop", rarity: "epic", power: 60 },
  ],
  "DeFi Yield Farmer": [
    { name: "良田 Fertile Land", icon: "🏞️", type: "land", rarity: "epic", power: 70 },
    { name: "水车 Watermill", icon: "⚙️", type: "building", rarity: "rare", power: 40 },
  ],
  "NFT Flipper": [
    { name: "古玩 Ancient Artifact", icon: "🏺", type: "artifact", rarity: "epic", power: 65 },
    { name: "玉玺 Imperial Seal", icon: "🔮", type: "artifact", rarity: "legendary", power: 100 },
  ],
  "Long-term Holder": [
    { name: "城池 Fortress", icon: "🏯", type: "land", rarity: "legendary", power: 90 },
    { name: "高墙 Great Wall", icon: "🧱", type: "building", rarity: "epic", power: 75 },
  ],
  "Degen Trader": [
    { name: "骑兵 Cavalry", icon: "🐎", type: "troop", rarity: "rare", power: 55 },
    { name: "连弩 Repeating Crossbow", icon: "🏹", type: "weapon", rarity: "epic", power: 70 },
  ],
  "Liquidity Provider": [
    { name: "河流 River Territory", icon: "🌊", type: "land", rarity: "rare", power: 50 },
    { name: "商船 Trade Ship", icon: "⛵", type: "artifact", rarity: "rare", power: 45 },
  ],
  "Fresh Wallet": [
    { name: "步兵 Infantry", icon: "🛡️", type: "troop", rarity: "common", power: 25 },
    { name: "粮仓 Granary", icon: "🏠", type: "building", rarity: "common", power: 20 },
  ],
  "Exit Liquidity": [
    { name: "粮草 Provisions", icon: "🍚", type: "resource", rarity: "common", power: 15 },
    { name: "铁矿 Iron Mine", icon: "⛏️", type: "resource", rarity: "common", power: 20 },
  ],
  "Bot-like Behavior": [
    { name: "攻城器 Siege Engine", icon: "⚙️", type: "artifact", rarity: "epic", power: 80 },
    { name: "木牛 Wooden Ox", icon: "🐂", type: "artifact", rarity: "rare", power: 50 },
  ],
};

export const RARITY_COLORS = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};

// ─── RANK TITLES ─────────────────────────────────────────────────────────────

export const RANK_TITLES = [
  { min: 0, title: "布衣 Commoner" },
  { min: 5, title: "里正 Village Head" },
  { min: 15, title: "县令 County Magistrate" },
  { min: 30, title: "太守 Prefect" },
  { min: 50, title: "刺史 Governor" },
  { min: 80, title: "将军 General" },
  { min: 120, title: "丞相 Chancellor" },
  { min: 200, title: "天子 Emperor" },
];

export function getRankTitle(totalSearches) {
  let title = RANK_TITLES[0].title;
  for (const r of RANK_TITLES) {
    if (totalSearches >= r.min) title = r.title;
  }
  return title;
}

export function getRewardForArchetype(archetype) {
  const pool = REWARD_TABLE[archetype] || REWARD_TABLE["Fresh Wallet"];
  // Random selection from pool
  return pool[Math.floor(Math.random() * pool.length)];
}
