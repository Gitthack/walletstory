export const ARCHETYPES = {
  SmartMoney: {
    id: 0,
    icon: '🧠',
    color: '#f0c040',
    label: 'Smart Money',
    cn: '智者',
    description: 'Consistently profitable trades with excellent timing. This wallet moves before the crowd.',
    gameReward: { name: 'Scroll of Zhuge Liang', icon: '📜', rarity: 3, power: 95 },
    faction: 'Shu Han'
  },
  EarlyAirdropFarmer: {
    id: 1,
    icon: '🌾',
    color: '#40d080',
    label: 'Early Airdrop Farmer',
    cn: '先驱农夫',
    description: 'First to interact with new protocols. Farms airdrops before announcements.',
    gameReward: { name: 'Seeds of Fortune', icon: '🌱', rarity: 2, power: 72 },
    faction: 'Wei'
  },
  DeFiYieldFarmer: {
    id: 2,
    icon: '🌻',
    color: '#80d040',
    label: 'DeFi Yield Farmer',
    cn: '收益农夫',
    description: 'Moves liquidity to the highest-yielding pools. Optimizes returns across protocols.',
    gameReward: { name: 'Golden Harvest Blade', icon: '⚔️', rarity: 2, power: 68 },
    faction: 'Shu Han'
  },
  NFTFlipper: {
    id: 3,
    icon: '🎨',
    color: '#f080c0',
    label: 'NFT Flipper',
    cn: '画商',
    description: 'Buys low, sells high in NFT markets. Keen eye for trending collections.',
    gameReward: { name: 'Brush of Lu Ban', icon: '🖌️', rarity: 1, power: 55 },
    faction: 'Wu'
  },
  LongTermHolder: {
    id: 4,
    icon: '💎',
    color: '#4080f0',
    label: 'Long-Term Holder',
    cn: '守城者',
    description: 'Diamond hands. Holds through bear markets with conviction.',
    gameReward: { name: 'Shield of Guan Yu', icon: '🛡️', rarity: 2, power: 78 },
    faction: 'Shu Han'
  },
  DegenTrader: {
    id: 5,
    icon: '🎲',
    color: '#e05050',
    label: 'Degen Trader',
    cn: '赌徒',
    description: 'High frequency, high risk trades. Lives on the edge of liquidation.',
    gameReward: { name: 'Dice of Cao Cao', icon: '🎲', rarity: 1, power: 60 },
    faction: 'Wei'
  },
  LiquidityProvider: {
    id: 6,
    icon: '💧',
    color: '#40c0f0',
    label: 'Liquidity Provider',
    cn: '水利师',
    description: 'Provides deep liquidity to DEX pools. Earns steady fees over time.',
    gameReward: { name: 'Trident of Zhou Yu', icon: '🔱', rarity: 2, power: 70 },
    faction: 'Wu'
  },
  FreshWallet: {
    id: 7,
    icon: '🌟',
    color: '#c0c0c0',
    label: 'Fresh Wallet',
    cn: '新手',
    description: 'Newly created wallet with minimal history. The journey begins here.',
    gameReward: { name: 'Wooden Sword', icon: '🗡️', rarity: 0, power: 20 },
    faction: 'Neutral'
  },
  ExitLiquidity: {
    id: 8,
    icon: '🚪',
    color: '#f08040',
    label: 'Exit Liquidity',
    cn: '接盘侠',
    description: 'Consistently buys at peaks. Often provides exit for smarter wallets.',
    gameReward: { name: 'Broken Shield', icon: '🪓', rarity: 0, power: 15 },
    faction: 'Yellow Turbans'
  },
  BotLikeBehavior: {
    id: 9,
    icon: '🤖',
    color: '#8040f0',
    label: 'Bot-Like Behavior',
    cn: '机关术',
    description: 'Algorithmic patterns. Precise timing and repetitive transaction structures.',
    gameReward: { name: 'Automaton Core', icon: '⚙️', rarity: 3, power: 88 },
    faction: 'Wei'
  }
};

export const ARCHETYPE_LIST = Object.values(ARCHETYPES);
export const ARCHETYPE_KEYS = Object.keys(ARCHETYPES);

export function classifyFromHash(addressHash) {
  if (!addressHash || addressHash.length < 4) return ARCHETYPES.FreshWallet;
  const hex = addressHash.replace('0x', '').toLowerCase();
  const firstByte = parseInt(hex.slice(0, 2), 16);
  const index = firstByte % 10;
  return ARCHETYPE_LIST[index];
}
