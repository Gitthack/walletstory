// Sample wallet data for demonstration and initial content

export const SAMPLE_STORIES = [
  {
    address: "0xDE8f6b2D7C56E04c6a0A1bE3E4Ab9E2f3C1D8A7B",
    archetype: "Smart Money",
    secondaryTraits: ["Long-term Holder", "DeFi Yield Farmer"],
    confidence: 94,
    story: "Strategic accumulator 0xDE8f…8A7B accumulated 32,416 ETH at an average of $1,865 during the 2023 cycle. Between March 2024 and September 2025, it offloaded most of the position near $2,944, realizing over $33M in profit. Four months ago, it returned near the top at $4,388, suggesting a late-cycle reentry.",
    stats: { totalTx: 1847, totalValue: "$89.2M", firstSeen: "2021-03-14", chains: ["Ethereum", "Arbitrum"], topProtocols: ["Uniswap", "Aave", "Lido"], pnl: "+$33.4M", holdingPeriod: "8.2 months avg", balance: "12,480 ETH", txFrequency: "1.2/day", defiInteractions: 340, nftTxCount: 12, uniqueTokens: 8 },
    score: 98,
  },
  {
    address: "0x7a3Bf29D4C8E156A2b3F4D5e6C7A8B9f42D1E3C5",
    archetype: "Degen Trader",
    secondaryTraits: ["NFT Flipper"],
    confidence: 87,
    story: "High-frequency trader 0x7a3B…E3C5 executed 4,200+ swaps in the last 90 days across 12 DEXes. Its win rate sits at 61%, with an average hold time of just 3.2 hours. The wallet has been particularly active in meme tokens, turning $48K into $312K since November.",
    stats: { totalTx: 12430, totalValue: "$4.8M", firstSeen: "2023-07-22", chains: ["Ethereum", "Base", "Solana"], topProtocols: ["Jupiter", "1inch", "Uniswap"], pnl: "+$264K", holdingPeriod: "3.2 hours avg", balance: "42.5 ETH", txFrequency: "45/day", defiInteractions: 890, nftTxCount: 145, uniqueTokens: 89 },
    score: 91,
  },
  {
    address: "0xC91eA4B7D8F9231E5A6b7C8D9E0F1A2b8bA03456",
    archetype: "Early Airdrop Farmer",
    secondaryTraits: ["DeFi Yield Farmer", "Liquidity Provider"],
    confidence: 91,
    story: "Systematic airdrop farmer 0xC91e…3456 interacted with 14 pre-token protocols in the past 60 days. The wallet has bridge activity across 7 chains and maintains minimum qualifying positions in each. Historical airdrop claims total $890K across 8 distributions.",
    stats: { totalTx: 3290, totalValue: "$1.2M", firstSeen: "2022-01-05", chains: ["Ethereum", "zkSync", "Scroll", "Linea", "Base", "Arbitrum", "Optimism"], topProtocols: ["LayerZero", "zkSync", "EigenLayer"], pnl: "+$890K", holdingPeriod: "varies", balance: "8.2 ETH", txFrequency: "5/day", defiInteractions: 420, nftTxCount: 30, uniqueTokens: 45 },
    score: 88,
  },
  {
    address: "0x45Fc9D8E7B6A5C4D3E2F1A0B9C8D7E6d1E77F890",
    archetype: "NFT Flipper",
    secondaryTraits: ["Degen Trader"],
    confidence: 82,
    story: "NFT specialist 0x45Fc…F890 flipped 340 NFTs in Q4 2025 with a 72% profit rate. The wallet targets undervalued blue-chip derivatives and emerging PFP collections, with an average flip time of 4.1 days and a total realized gain of $178K.",
    stats: { totalTx: 2100, totalValue: "$2.1M", firstSeen: "2022-09-18", chains: ["Ethereum", "Base"], topProtocols: ["OpenSea", "Blur", "Reservoir"], pnl: "+$178K", holdingPeriod: "4.1 days avg", balance: "28.7 ETH", txFrequency: "3/day", defiInteractions: 50, nftTxCount: 890, uniqueTokens: 12 },
    score: 85,
  },
  {
    address: "0xBb21C3F9A8D7E6B5C4D3E2F1A0B9C8D73cF90123",
    archetype: "Long-term Holder",
    secondaryTraits: ["Smart Money"],
    confidence: 96,
    story: "Diamond hands wallet 0xBb21…0123 has held 1,200 ETH since March 2020 without a single sell transaction. The position, originally worth $180K, now sits at $5.3M. The wallet also stakes 100% of holdings via Lido, earning an additional $420K in staking rewards.",
    stats: { totalTx: 47, totalValue: "$5.7M", firstSeen: "2020-03-12", chains: ["Ethereum"], topProtocols: ["Lido"], pnl: "+$5.5M", holdingPeriod: "5.9 years", balance: "1,200 ETH", txFrequency: "0.02/day", defiInteractions: 12, nftTxCount: 0, uniqueTokens: 2 },
    score: 82,
  },
  {
    address: "0x19AeF4D8C7B6A5E3D2C1B0A9F8E7D6C57dB44ABC",
    archetype: "DeFi Yield Farmer",
    secondaryTraits: ["Liquidity Provider"],
    confidence: 89,
    story: "Yield optimizer 0x19Ae…4ABC rotates capital across 8 DeFi protocols weekly, chasing the highest APY. Current positions span Aave, Compound, and Morpho with $2.4M deployed. The wallet consistently earns 12-18% annualized through strategic rebalancing.",
    stats: { totalTx: 5600, totalValue: "$12.8M", firstSeen: "2021-11-02", chains: ["Ethereum", "Arbitrum", "Optimism"], topProtocols: ["Aave", "Compound", "Morpho", "Pendle"], pnl: "+$1.9M", holdingPeriod: "7 days avg", balance: "856 ETH", txFrequency: "4/day", defiInteractions: 2200, nftTxCount: 5, uniqueTokens: 28 },
    score: 79,
  },
];

export const DAILY_HEADLINES = [
  { title: "鲸鱼 Whale bought $12M ETH at local bottom", type: "Smart Money", time: "2h ago", score: 98 },
  { title: "新钱包 Fresh wallet turned $5K into $480K", type: "Degen Trader", time: "4h ago", score: 95 },
  { title: "空投猎手 hit 6 protocols in 2 days", type: "Early Airdrop Farmer", time: "5h ago", score: 88 },
  { title: "NFT翻转 scored 340% on blue-chip derivative", type: "NFT Flipper", time: "7h ago", score: 85 },
  { title: "神秘巨鲸 accumulated 8,000 ETH silently", type: "Smart Money", time: "9h ago", score: 82 },
  { title: "DeFi农夫 earned $420K in yield this month", type: "DeFi Yield Farmer", time: "11h ago", score: 79 },
];
