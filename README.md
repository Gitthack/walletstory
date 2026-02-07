# WalletStory 🔮⛓️

**On-Chain Wallet Intelligence Platform + Three Kingdoms GameFi**

> Every wallet has a story. Results stored permanently on BSC Testnet.

---

## 🏆 Competition Criteria

| Criteria | How We Meet It |
|----------|---------------|
| **On-chain proof** | Smart contract deployed to BSC Testnet. Every wallet analysis + reward claim = on-chain transaction with verifiable tx hash |
| **Reproducible** | Demo link + this repo. `npm install && npm run dev` to run locally |

---

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd walletstory
npm install

# 2. Set up environment
cp .env.example .env.local

# 3. Deploy contract to BSC Testnet
#    First: get tBNB from https://www.bnbchain.org/en/testnet-faucet
#    Add your private key to .env.local → DEPLOYER_PRIVATE_KEY
npm run compile
npm run deploy:testnet
#    Copy the contract address to .env.local → NEXT_PUBLIC_CONTRACT_ADDRESS

# 4. Run the app
npm run dev
# Open http://localhost:3000
```

---

## On-Chain Architecture

### Smart Contract: `WalletStoryRegistry`

**Network:** BSC Testnet (Chain ID 97)

**What goes on-chain:**
- `submitAnalysis()` — stores keccak256 hash of analysis + score + archetype for each wallet
- `claimReward()` — records GameFi reward claims per user
- `totalAnalyses` — global counter of all analyses
- `leaderboardKeys[]` — top 50 wallets by score

**Events emitted (for indexing):**
- `WalletAnalyzed(analyzer, walletKey, score, archetypeId, analysisHash, timestamp)`
- `RewardClaimed(user, rewardName, rarity, power, timestamp)`

### User Flow:
1. User connects MetaMask → auto-switches to BSC Testnet
2. Enters a wallet address → frontend fetches analysis from API
3. Clicks "Store On-Chain" → `submitAnalysis()` tx on BSC Testnet
4. Clicks "Claim Reward" → `claimReward()` tx on BSC Testnet
5. Both produce verifiable tx hashes on BSCScan

---

## Deploy Contract Step-by-Step

### 1. Get BSC Testnet BNB
- Go to https://www.bnbchain.org/en/testnet-faucet
- Enter your wallet address
- Get 0.5 tBNB (enough for ~100 deployments)

### 2. Set up environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### 3. Compile and deploy
```bash
npm run compile
npm run deploy:testnet
```

Output:
```
✅ WalletStoryRegistry deployed to: 0x1234...5678
   BSCScan: https://testnet.bscscan.com/address/0x1234...5678
```

### 4. Add contract address to env
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234...5678
```

### 5. Verify on BSCScan (optional but recommended)
```bash
npx hardhat verify --network bscTestnet <CONTRACT_ADDRESS>
```

---

## Deploy Frontend

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Add environment variables in Vercel dashboard:
# NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract
# NEXT_PUBLIC_BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.bnbchain.org:8545
# NEXT_PUBLIC_CHAIN_ID=97
```

---

## Features

### 🔍 Wallet Story Generator
Input any Ethereum wallet → get narrative analysis, archetype classification, key stats

### 🎯 10 Wallet Archetypes
Smart Money, Early Airdrop Farmer, DeFi Yield Farmer, NFT Flipper, Long-term Holder, Degen Trader, Liquidity Provider, Fresh Wallet, Exit Liquidity, Bot-like Behavior

### 📊 Daily Leaderboard
Top wallet stories, most searched wallets, ranked by activity score

### ⚔️ Three Kingdoms GameFi (三国志)
- Chinese Three Kingdoms themed reward system
- SVG territory map with castles, mountains, forests, rivers
- Rank progression: 布衣 Commoner → 天子 Emperor
- All rewards stored on-chain via `claimReward()`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.24, Hardhat |
| Chain | BSC Testnet (Chain ID 97) |
| Frontend | Next.js 14, Tailwind CSS |
| Web3 | ethers.js v6 |
| Fonts | JetBrains Mono, Outfit, Ma Shan Zheng, Noto Serif SC |

---

## Project Structure

```
walletstory/
├── contracts/
│   └── WalletStoryRegistry.sol   # Solidity contract
├── scripts/
│   └── deploy.js                 # BSC Testnet deployment
├── hardhat.config.js
├── src/
│   ├── app/
│   │   ├── page.js               # Home
│   │   ├── wallet/page.js        # Wallet detail + on-chain submit
│   │   ├── leaderboard/page.js
│   │   ├── gamefi/page.js        # Three Kingdoms
│   │   └── api/                  # API routes
│   ├── components/
│   │   ├── Nav.js                # Nav + wallet connect
│   │   ├── TxStatus.js           # On-chain tx status + BSCScan links
│   │   ├── ThreeKingdomsMap.js   # SVG territory map
│   │   └── ...
│   └── lib/
│       ├── web3.js               # Contract ABI + wallet connect
│       ├── archetypes.js         # Classification logic
│       └── ...
├── .env.example
├── package.json
└── README.md
```

---

## For Competition Judges

1. **Contract Address:** Check `.env.local` or the deployed address on BSCScan
2. **TX Hashes:** Every "Store On-Chain" and "Claim Reward" button produces a BSCScan-verifiable transaction
3. **Demo:** Deploy to Vercel, share URL
4. **Reproduce:** Clone → `npm install` → deploy contract → `npm run dev`

---

## License
MIT
