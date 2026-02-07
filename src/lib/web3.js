// Web3 integration layer — connects frontend to WalletStoryRegistry on BSC Testnet
import { ethers } from "ethers";

// Contract ABI (only the functions we use)
const CONTRACT_ABI = [
  "function submitAnalysis(bytes32 walletKey, bytes32 analysisHash, uint8 score, uint8 archetypeId) external",
  "function claimReward(string calldata rewardName, uint8 rarity, uint8 power) external",
  "function getAnalysis(bytes32 walletKey) external view returns (bytes32 analysisHash, uint8 score, uint8 archetypeId, address analyzer, uint64 timestamp, bool exists)",
  "function getRewards(address user) external view returns (tuple(string rewardName, uint8 rarity, uint8 power, uint64 claimedAt)[])",
  "function getRewardCount(address user) external view returns (uint256)",
  "function getDailySearchCount(address user) external view returns (uint8)",
  "function totalAnalyses() external view returns (uint256)",
  "function totalRewardsClaimed() external view returns (uint256)",
  "function getLeaderboardLength() external view returns (uint256)",
  "function getLeaderboardEntry(uint256 index) external view returns (bytes32 walletKey, uint8 score, uint8 archetypeId, address analyzer, uint64 timestamp)",
  "event WalletAnalyzed(address indexed analyzer, bytes32 indexed walletKey, uint8 score, uint8 archetypeId, bytes32 analysisHash, uint256 timestamp)",
  "event RewardClaimed(address indexed user, string rewardName, uint8 rarity, uint8 power, uint256 timestamp)",
];

const BSC_TESTNET_CHAIN_ID = 97;
const BSC_TESTNET_RPC = "https://data-seed-prebsc-1-s1.bnbchain.org:8545";
const BSC_TESTNET_PARAMS = {
  chainId: "0x61",
  chainName: "BSC Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: ["https://data-seed-prebsc-1-s1.bnbchain.org:8545"],
  blockExplorerUrls: ["https://testnet.bscscan.com"],
};

const ARCHETYPE_TO_ID = {
  "Smart Money": 0,
  "Early Airdrop Farmer": 1,
  "DeFi Yield Farmer": 2,
  "NFT Flipper": 3,
  "Long-term Holder": 4,
  "Degen Trader": 5,
  "Liquidity Provider": 6,
  "Fresh Wallet": 7,
  "Exit Liquidity": 8,
  "Bot-like Behavior": 9,
};

const ID_TO_ARCHETYPE = Object.fromEntries(
  Object.entries(ARCHETYPE_TO_ID).map(([k, v]) => [v, k])
);

const RARITY_MAP = { common: 0, rare: 1, epic: 2, legendary: 3 };
const RARITY_REVERSE = { 0: "common", 1: "rare", 2: "epic", 3: "legendary" };

function getContractAddress() {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
}

// ─── WALLET CONNECTION ───────────────────────────────────────

export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask to use on-chain features.");
  }

  // Request account access
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  // Check/switch to BSC Testnet
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (parseInt(chainId, 16) !== BSC_TESTNET_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x61" }],
      });
    } catch (switchError) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BSC_TESTNET_PARAMS],
        });
      } else {
        throw switchError;
      }
    }
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = accounts[0];

  return { provider, signer, address };
}

export function getReadOnlyProvider() {
  return new ethers.JsonRpcProvider(BSC_TESTNET_RPC);
}

export function getContract(signerOrProvider) {
  const addr = getContractAddress();
  if (!addr) return null;
  return new ethers.Contract(addr, CONTRACT_ABI, signerOrProvider);
}

// ─── WRITE FUNCTIONS (require wallet) ────────────────────────

export async function submitAnalysisOnChain(signer, walletAddress, analysisJson, score, archetype) {
  const contract = getContract(signer);
  if (!contract) throw new Error("Contract not configured");

  const walletKey = ethers.keccak256(ethers.toUtf8Bytes(walletAddress.toLowerCase()));
  const analysisHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(analysisJson)));
  const archetypeId = ARCHETYPE_TO_ID[archetype] ?? 7;

  const tx = await contract.submitAnalysis(walletKey, analysisHash, score, archetypeId);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    explorerUrl: `https://testnet.bscscan.com/tx/${receipt.hash}`,
  };
}

export async function claimRewardOnChain(signer, rewardName, rarity, power) {
  const contract = getContract(signer);
  if (!contract) throw new Error("Contract not configured");

  const rarityId = RARITY_MAP[rarity] ?? 0;
  const tx = await contract.claimReward(rewardName, rarityId, power);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    explorerUrl: `https://testnet.bscscan.com/tx/${receipt.hash}`,
  };
}

// ─── READ FUNCTIONS (no wallet needed) ───────────────────────

export async function getAnalysisFromChain(walletAddress) {
  const provider = getReadOnlyProvider();
  const contract = getContract(provider);
  if (!contract) return null;

  const walletKey = ethers.keccak256(ethers.toUtf8Bytes(walletAddress.toLowerCase()));

  try {
    const result = await contract.getAnalysis(walletKey);
    if (!result.exists) return null;

    return {
      analysisHash: result.analysisHash,
      score: Number(result.score),
      archetype: ID_TO_ARCHETYPE[Number(result.archetypeId)] || "Fresh Wallet",
      analyzer: result.analyzer,
      timestamp: Number(result.timestamp),
      exists: result.exists,
    };
  } catch {
    return null;
  }
}

export async function getOnChainRewards(userAddress) {
  const provider = getReadOnlyProvider();
  const contract = getContract(provider);
  if (!contract) return [];

  try {
    const rewards = await contract.getRewards(userAddress);
    return rewards.map((r) => ({
      rewardName: r.rewardName,
      rarity: RARITY_REVERSE[Number(r.rarity)] || "common",
      power: Number(r.power),
      claimedAt: Number(r.claimedAt),
    }));
  } catch {
    return [];
  }
}

export async function getDailySearchCount(userAddress) {
  const provider = getReadOnlyProvider();
  const contract = getContract(provider);
  if (!contract) return 0;

  try {
    return Number(await contract.getDailySearchCount(userAddress));
  } catch {
    return 0;
  }
}

export async function getGlobalStats() {
  const provider = getReadOnlyProvider();
  const contract = getContract(provider);
  if (!contract) return { totalAnalyses: 0, totalRewards: 0 };

  try {
    const [totalAnalyses, totalRewards] = await Promise.all([
      contract.totalAnalyses(),
      contract.totalRewardsClaimed(),
    ]);
    return {
      totalAnalyses: Number(totalAnalyses),
      totalRewards: Number(totalRewards),
    };
  } catch {
    return { totalAnalyses: 0, totalRewards: 0 };
  }
}

export async function getOnChainLeaderboard() {
  const provider = getReadOnlyProvider();
  const contract = getContract(provider);
  if (!contract) return [];

  try {
    const len = Number(await contract.getLeaderboardLength());
    const entries = [];
    for (let i = 0; i < Math.min(len, 20); i++) {
      const entry = await contract.getLeaderboardEntry(i);
      entries.push({
        walletKey: entry.walletKey,
        score: Number(entry.score),
        archetype: ID_TO_ARCHETYPE[Number(entry.archetypeId)] || "Fresh Wallet",
        analyzer: entry.analyzer,
        timestamp: Number(entry.timestamp),
      });
    }
    return entries.sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

// ─── HELPERS ─────────────────────────────────────────────────

export function isWalletConnected() {
  return typeof window !== "undefined" && window.ethereum?.selectedAddress;
}

export function getExplorerUrl(txHash) {
  return `https://testnet.bscscan.com/tx/${txHash}`;
}

export function getContractExplorerUrl() {
  const addr = getContractAddress();
  return addr ? `https://testnet.bscscan.com/address/${addr}` : "";
}

export { ARCHETYPE_TO_ID, ID_TO_ARCHETYPE, RARITY_MAP, BSC_TESTNET_CHAIN_ID };
