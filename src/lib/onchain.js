// On-chain data service
// Fetches real data from Etherscan & Alchemy with graceful fallback to mock

const ETHERSCAN_API = "https://api.etherscan.io/v2/api";
const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY;
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_URL = ALCHEMY_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
  : null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── ETHERSCAN CALLS ─────────────────────────────────────────────────────────

async function etherscanFetch(params) {
  if (!ETHERSCAN_KEY || ETHERSCAN_KEY === "your_etherscan_api_key_here") return null;
  const url = new URL(ETHERSCAN_API);
  url.searchParams.set("chainid", "1"); // Ethereum mainnet
  url.searchParams.set("apikey", ETHERSCAN_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    const data = await res.json();
    if (data.status === "1" || data.result) return data.result;
    return null;
  } catch (e) {
    console.error("Etherscan fetch error:", e.message);
    return null;
  }
}

export async function getEthBalance(address) {
  const result = await etherscanFetch({
    module: "account",
    action: "balance",
    address,
    tag: "latest",
  });
  if (!result) return null;
  return parseFloat(result) / 1e18;
}

export async function getNormalTransactions(address, page = 1, offset = 100) {
  return etherscanFetch({
    module: "account",
    action: "txlist",
    address,
    startblock: 0,
    endblock: 99999999,
    page: String(page),
    offset: String(offset),
    sort: "desc",
  });
}

export async function getTokenTransfers(address, page = 1, offset = 50) {
  return etherscanFetch({
    module: "account",
    action: "tokentx",
    address,
    page: String(page),
    offset: String(offset),
    sort: "desc",
  });
}

export async function getERC721Transfers(address, page = 1, offset = 50) {
  return etherscanFetch({
    module: "account",
    action: "tokennfttx",
    address,
    page: String(page),
    offset: String(offset),
    sort: "desc",
  });
}

// ─── ALCHEMY CALLS ───────────────────────────────────────────────────────────

async function alchemyFetch(method, params) {
  if (!ALCHEMY_URL) return null;
  try {
    const res = await fetch(ALCHEMY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const data = await res.json();
    return data.result || null;
  } catch (e) {
    console.error("Alchemy fetch error:", e.message);
    return null;
  }
}

export async function getTokenBalances(address) {
  return alchemyFetch("alchemy_getTokenBalances", [address, "DEFAULT_TOKENS"]);
}

// ─── FEATURE EXTRACTION ──────────────────────────────────────────────────────

export async function extractWalletFeatures(address) {
  const [balance, txList, tokenTxs, nftTxs] = await Promise.all([
    getEthBalance(address),
    getNormalTransactions(address, 1, 200),
    getTokenTransfers(address, 1, 100),
    getERC721Transfers(address, 1, 50),
  ]);

  // If we got no data at all, return null so caller uses fallback
  if (balance === null && !txList) return null;

  const txs = Array.isArray(txList) ? txList : [];
  const tokens = Array.isArray(tokenTxs) ? tokenTxs : [];
  const nfts = Array.isArray(nftTxs) ? nftTxs : [];

  const now = Math.floor(Date.now() / 1000);
  const firstTx = txs.length > 0 ? txs[txs.length - 1] : null;
  const walletAgeDays = firstTx
    ? Math.floor((now - parseInt(firstTx.timeStamp)) / 86400)
    : 0;

  // Classify sends vs receives
  const addrLower = address.toLowerCase();
  const sends = txs.filter((t) => t.from?.toLowerCase() === addrLower);
  const receives = txs.filter((t) => t.to?.toLowerCase() === addrLower);

  // Unique protocols interacted with (approximate via 'to' contracts)
  const uniqueContracts = new Set(
    txs.filter((t) => t.to && t.input !== "0x").map((t) => t.to.toLowerCase())
  );

  // Token diversity
  const uniqueTokens = new Set(tokens.map((t) => t.contractAddress?.toLowerCase()));

  // NFT stats
  const nftSends = nfts.filter((n) => n.from?.toLowerCase() === addrLower);
  const nftReceives = nfts.filter((n) => n.to?.toLowerCase() === addrLower);

  // Calculate average tx value in ETH
  const txValues = txs
    .map((t) => parseFloat(t.value) / 1e18)
    .filter((v) => v > 0);
  const avgTxValue = txValues.length > 0
    ? txValues.reduce((a, b) => a + b, 0) / txValues.length
    : 0;

  // Total value moved
  const totalValueETH = txValues.reduce((a, b) => a + b, 0);

  // Transaction frequency (txs per day)
  const txFrequency = walletAgeDays > 0 ? txs.length / walletAgeDays : txs.length;

  // Bridge detection (common bridge contracts)
  const bridgePatterns = ["bridge", "hop", "across", "stargate", "layerzero"];
  const bridgeTxCount = txs.filter((t) => {
    const input = (t.functionName || "").toLowerCase();
    return bridgePatterns.some((p) => input.includes(p));
  }).length;

  // DeFi interaction detection
  const defiPatterns = ["swap", "addliquidity", "removeliquidity", "deposit", "withdraw", "stake", "unstake", "claim", "harvest", "supply", "borrow", "repay"];
  const defiInteractions = txs.filter((t) => {
    const fn = (t.functionName || "").toLowerCase();
    return defiPatterns.some((p) => fn.includes(p));
  }).length;

  // LP detection
  const lpPatterns = ["addliquidity", "removeliquidity", "mint", "burn"];
  const lpPositions = txs.filter((t) => {
    const fn = (t.functionName || "").toLowerCase();
    return lpPatterns.some((p) => fn.includes(p));
  }).length;

  return {
    balance: balance || 0,
    totalTx: txs.length,
    totalTokenTx: tokens.length,
    totalNftTx: nfts.length,
    walletAgeDays,
    firstSeenDate: firstTx ? new Date(parseInt(firstTx.timeStamp) * 1000).toISOString().split("T")[0] : "Unknown",
    sendCount: sends.length,
    receiveCount: receives.length,
    buyCount: receives.length,
    sellCount: sends.length,
    avgTxValue,
    totalValueETH,
    txFrequency,
    uniqueProtocols: uniqueContracts.size,
    uniqueTokens: uniqueTokens.size,
    chainCount: 1, // Ethereum mainnet only for now
    bridgeTxCount,
    defiInteractions,
    lpPositions,
    lpValueETH: 0, // Would need deeper analysis
    nftTxCount: nfts.length,
    nftProfitRatio: nftSends.length > 0 ? 0.5 : 0, // Simplified
    avgNftHoldDays: 7, // Would need deeper analysis
    holdingDaysAvg: walletAgeDays > 0 ? walletAgeDays * 0.4 : 0,
    avgHoldHours: walletAgeDays > 0 ? walletAgeDays * 24 * 0.3 : 48,
    profitRatio: 0.5, // Would need price data for accurate calc
    avgEntryVsMarket: 0, // Would need price data
    txTimingStdDev: 100, // Would need deeper analysis
    gasOptimizationScore: 0.3,
    // Raw data for story generation
    recentTxs: txs.slice(0, 10),
    topTokens: [...uniqueTokens].slice(0, 5),
    topContracts: [...uniqueContracts].slice(0, 5),
  };
}

// ─── MOCK DATA FALLBACK ──────────────────────────────────────────────────────

export function generateMockFeatures(address) {
  // Use two different hash seeds for more varied distributions
  const hash = Array.from(address).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hash2 = Array.from(address).reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);

  return {
    balance: (hash % 1000) + 0.5,
    totalTx: (hash % 10000) + 5,            // range 5-10004: allows Fresh Wallet (<50)
    totalTokenTx: 50 + (hash % 500),
    totalNftTx: hash % 200,
    walletAgeDays: (hash2 % 1530),           // range 0-1529: allows Fresh Wallet (<30)
    firstSeenDate: `20${20 + (hash % 6)}-${String((hash % 12) + 1).padStart(2, "0")}-${String((hash % 28) + 1).padStart(2, "0")}`,
    sendCount: 50 + (hash % 2000),
    receiveCount: 50 + (hash % 2000),
    buyCount: 50 + (hash % 2000),
    sellCount: 10 + (hash % 500),
    avgTxValue: (hash % 100) * 0.5,
    totalValueETH: (hash % 50000) + 100,
    txFrequency: (hash2 % 80) + 1,          // range 1-80: allows Bot-like (>50) and Degen (>10)
    uniqueProtocols: (hash % 15) + 1,
    uniqueTokens: (hash % 40) + 1,
    chainCount: (hash % 5) + 1,
    bridgeTxCount: hash % 20,
    defiInteractions: hash % 200,
    lpPositions: hash % 10,
    lpValueETH: (hash % 100) + 1,
    nftTxCount: hash % 100,
    nftProfitRatio: (hash % 80) / 100,
    avgNftHoldDays: (hash % 30) + 1,
    holdingDaysAvg: (hash % 365) + 1,
    avgHoldHours: (hash % 720) + 1,
    profitRatio: (hash % 90) / 100,
    avgEntryVsMarket: ((hash % 40) - 20) / 100,
    txTimingStdDev: hash2 % 300,             // uses hash2 for independent distribution
    gasOptimizationScore: (hash2 % 100) / 100,
    recentTxs: [],
    topTokens: [],
    topContracts: [],
  };
}
