'use client';

import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function submitAnalysis(bytes32 walletKey, bytes32 analysisHash, uint8 score, uint8 archetypeId) external",
  "function claimReward(string calldata rewardName, uint8 rarity, uint8 power) external",
  "function getAnalysis(bytes32 walletKey) external view returns (bytes32, uint8, uint8, address, uint64, bool)",
  "function getRewards(address user) external view returns (tuple(string rewardName, uint8 rarity, uint8 power, uint64 claimedAt)[])",
  "function getRewardCount(address user) external view returns (uint256)",
  "function getDailySearchCount(address user) external view returns (uint8)",
  "function getLeaderboardLength() external view returns (uint256)",
  "function totalAnalyses() external view returns (uint256)",
  "function totalRewardsClaimed() external view returns (uint256)",
  "event WalletAnalyzed(address indexed analyzer, bytes32 indexed walletKey, uint8 score, uint8 archetypeId, bytes32 analysisHash, uint256 timestamp)",
  "event RewardClaimed(address indexed user, string rewardName, uint8 rarity, uint8 power, uint256 timestamp)"
];

const BSC_TESTNET = {
  chainId: '0x61',
  chainName: 'BSC Testnet',
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: [process.env.NEXT_PUBLIC_BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
};

function getContractAddress() {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
}

async function ensureBscTestnet(provider) {
  try {
    const network = await provider.getNetwork();
    if (network.chainId !== 97n) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET.chainId }],
      });
    }
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BSC_TESTNET],
      });
    } else {
      throw switchError;
    }
  }
}

export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask.');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await ensureBscTestnet(provider);
  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = accounts[0];
  const balance = await provider.getBalance(address);
  return {
    address,
    signer,
    provider,
    balance: ethers.formatEther(balance),
    chainId: 97,
  };
}

export async function submitAnalysisOnChain(signer, targetAddress, score, archetypeId) {
  const contractAddress = getContractAddress();
  if (!contractAddress) throw new Error('Contract not deployed. Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local');
  
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  const walletKey = ethers.keccak256(ethers.toUtf8Bytes(targetAddress.toLowerCase()));
  const analysisHash = ethers.keccak256(
    ethers.toUtf8Bytes(`${targetAddress}-${score}-${archetypeId}-${Date.now()}`)
  );

  const tx = await contract.submitAnalysis(walletKey, analysisHash, score, archetypeId);
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    explorerUrl: `https://testnet.bscscan.com/tx/${tx.hash}`,
  };
}

export async function claimRewardOnChain(signer, rewardName, rarity, power) {
  const contractAddress = getContractAddress();
  if (!contractAddress) throw new Error('Contract not deployed. Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local');
  
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
  const tx = await contract.claimReward(rewardName, rarity, power);
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    explorerUrl: `https://testnet.bscscan.com/tx/${tx.hash}`,
  };
}

export async function getGlobalStats(providerOrSigner) {
  const contractAddress = getContractAddress();
  if (!contractAddress) return { totalAnalyses: 0, totalRewards: 0, leaderboardSize: 0 };
  
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, providerOrSigner);
  const [totalAnalyses, totalRewards, lbLength] = await Promise.all([
    contract.totalAnalyses(),
    contract.totalRewardsClaimed(),
    contract.getLeaderboardLength(),
  ]);
  return {
    totalAnalyses: Number(totalAnalyses),
    totalRewards: Number(totalRewards),
    leaderboardSize: Number(lbLength),
  };
}

export async function getAnalysisFromChain(providerOrSigner, targetAddress) {
  const contractAddress = getContractAddress();
  if (!contractAddress) return null;
  
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, providerOrSigner);
  const walletKey = ethers.keccak256(ethers.toUtf8Bytes(targetAddress.toLowerCase()));
  const result = await contract.getAnalysis(walletKey);
  
  if (!result[5]) return null; // exists = false
  return {
    analysisHash: result[0],
    score: Number(result[1]),
    archetypeId: Number(result[2]),
    analyzer: result[3],
    timestamp: Number(result[4]),
  };
}

export function getContractExplorerUrl() {
  const addr = getContractAddress();
  if (!addr) return null;
  return `https://testnet.bscscan.com/address/${addr}`;
}
