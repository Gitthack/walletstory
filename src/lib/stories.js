import { ARCHETYPE_LIST } from './archetypes';

const STORY_TEMPLATES = {
  SmartMoney: [
    "This wallet moves with precision — entering positions days before the crowd arrives. A pattern of early accumulation followed by strategic exits suggests deep market intelligence.",
    "Consistently profitable across multiple market cycles. This address has a knack for timing that borders on prescient. The on-chain footprint reads like a masterclass in patient capital.",
  ],
  EarlyAirdropFarmer: [
    "A protocol explorer at heart. This wallet interacts with new contracts within hours of deployment, methodically building eligibility for future airdrops.",
    "The transaction history reveals a systematic approach to protocol farming — small interactions across dozens of new dApps, each one a calculated bet on future token distributions.",
  ],
  DeFiYieldFarmer: [
    "Capital flows like water between yield pools. This wallet chases APY with mechanical precision, migrating funds as incentives shift across the DeFi landscape.",
    "A sophisticated yield optimizer. Liquidity moves between Uniswap, Curve, and emerging protocols in a choreographed dance of capital efficiency.",
  ],
  NFTFlipper: [
    "Quick trades in trending collections. This wallet rarely holds NFTs for long — it's a marketplace predator with a keen eye for floor price momentum.",
    "Buy low on mint, sell high on hype. The NFT trading pattern shows consistent profit-taking across multiple collections and marketplaces.",
  ],
  LongTermHolder: [
    "Diamond hands incarnate. Tokens enter this wallet and rarely leave. Through crashes and pumps alike, the conviction remains unshaken.",
    "A holder of conviction. While others panic sell, this wallet accumulates. The portfolio tells a story of unwavering long-term belief.",
  ],
  DegenTrader: [
    "High leverage, high frequency, high risk. This wallet lives on the edge — leveraged longs into pumps and shorts into dumps. Not for the faint-hearted.",
    "A trader that thrives on volatility. Rapid entries and exits, often with significant size. The PnL swings are dramatic but the aggregate tells the true story.",
  ],
  LiquidityProvider: [
    "A silent backbone of DeFi. This wallet provides deep liquidity across multiple AMM pools, earning steady fees while enabling decentralized trading.",
    "Concentrated liquidity positions managed with care. This LP optimizes range orders and rebalances with the precision of a market maker.",
  ],
  FreshWallet: [
    "A new address with minimal history. Every great journey begins with a single transaction. The story of this wallet is yet to be written.",
    "Recently created and still finding its footing. The first few transactions will set the trajectory for this wallet's on-chain narrative.",
  ],
  ExitLiquidity: [
    "A pattern of buying at local tops and selling at local bottoms. This wallet often serves as the counterparty for smarter traders exiting positions.",
    "The timing suggests reactive rather than strategic trading. Entries cluster around peak hype, and exits follow capitulation patterns.",
  ],
  BotLikeBehavior: [
    "Algorithmic precision. Transactions fire at exact intervals with calculated gas parameters. This is likely a MEV bot or automated trading system.",
    "The regularity of transactions and gas optimization patterns point to automated execution. A mechanical trader in a world of emotional markets.",
  ],
};

export function generateStory(archetypeKey, address) {
  const templates = STORY_TEMPLATES[archetypeKey] || STORY_TEMPLATES.FreshWallet;
  // Deterministic selection based on address
  const seed = address ? parseInt(address.slice(2, 6), 16) : 0;
  const template = templates[seed % templates.length];
  return template;
}

export function buildWalletStats(address, archetype) {
  const hash = address ? address.toLowerCase().replace('0x', '') : '0000';
  const b = (i) => parseInt(hash.slice(i * 2, i * 2 + 2) || '50', 16);

  return {
    txCount: 10 + (b(0) * 20),
    totalVolume: `${(b(1) * 100 + b(2) * 10).toLocaleString()} USD`,
    firstSeen: `${2020 + (b(3) % 5)}-${String((b(4) % 12) + 1).padStart(2, '0')}-${String((b(5) % 28) + 1).padStart(2, '0')}`,
    activeChains: Math.max(1, b(6) % 8),
    riskLevel: b(7) > 180 ? 'High' : b(7) > 100 ? 'Medium' : 'Low',
    profitability: `${((b(8) - 128) / 128 * 100).toFixed(1)}%`,
    holdingPeriod: `${Math.max(1, b(9) % 365)} days avg`,
    uniqueTokens: 5 + (b(10) % 50),
    dexSwaps: b(11) * 3,
    nftTrades: b(12) * 2,
    lendingOps: b(13),
    bridgeOps: b(14) % 30,
  };
}
