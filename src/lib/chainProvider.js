// Chain data provider abstraction
// Priority: Etherscan V2 (if key set) > RPC direct
// Supports HTTP RPC polling; no WebSocket (unstable on BSC Testnet)

const NETWORKS = {
  "bsc-testnet": {
    chainId: 97,
    name: "BSC Testnet",
    rpc: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    explorer: "https://testnet.bscscan.com",
    etherscanApi: "https://api.etherscan.io/v2/api",
    etherscanChainId: "97",
  },
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    rpc: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
    etherscanApi: "https://api.etherscan.io/v2/api",
    etherscanChainId: "1",
  },
};

const DEFAULT_NETWORK = "ethereum"; // analysis on mainnet for real data

// ─── ETHERSCAN PROVIDER ─────────────────────────────────────────────────────

async function etherscanFetch(network, params) {
  const net = NETWORKS[network] || NETWORKS[DEFAULT_NETWORK];
  const key = process.env.ETHERSCAN_API_KEY;
  if (!key || key === "your_etherscan_api_key_here") return null;

  const url = new URL(net.etherscanApi);
  url.searchParams.set("chainid", net.etherscanChainId);
  url.searchParams.set("apikey", key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  const data = await res.json();
  if (data.status === "1" || data.result) return data.result;
  return null;
}

// ─── RPC PROVIDER (no key needed) ───────────────────────────────────────────

async function rpcFetch(network, method, params) {
  const net = NETWORKS[network] || NETWORKS[DEFAULT_NETWORK];
  const res = await fetch(net.rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

export async function getBalance(address, network = DEFAULT_NETWORK) {
  // Try Etherscan first
  const ethResult = await etherscanFetch(network, {
    module: "account", action: "balance", address, tag: "latest",
  }).catch(() => null);
  if (ethResult) return { value: parseFloat(ethResult) / 1e18, source: "etherscan" };

  // Fallback to RPC
  const hex = await rpcFetch(network, "eth_getBalance", [address, "latest"]).catch(() => null);
  if (hex) return { value: parseInt(hex, 16) / 1e18, source: "rpc" };

  return null;
}

export async function getTransactions(address, network = DEFAULT_NETWORK, offset = 200) {
  const result = await etherscanFetch(network, {
    module: "account", action: "txlist", address,
    startblock: 0, endblock: 99999999, page: 1, offset, sort: "desc",
  }).catch(() => null);
  if (result && Array.isArray(result)) return { txs: result, source: "etherscan" };
  return { txs: [], source: "none" };
}

export async function getTokenTransfers(address, network = DEFAULT_NETWORK, offset = 100) {
  const result = await etherscanFetch(network, {
    module: "account", action: "tokentx", address, page: 1, offset, sort: "desc",
  }).catch(() => null);
  if (result && Array.isArray(result)) return { transfers: result, source: "etherscan" };
  return { transfers: [], source: "none" };
}

export async function getERC721Transfers(address, network = DEFAULT_NETWORK, offset = 50) {
  const result = await etherscanFetch(network, {
    module: "account", action: "tokennfttx", address, page: 1, offset, sort: "desc",
  }).catch(() => null);
  if (result && Array.isArray(result)) return { nfts: result, source: "etherscan" };
  return { nfts: [], source: "none" };
}

export async function getTransactionCount(address, network = DEFAULT_NETWORK) {
  const hex = await rpcFetch(network, "eth_getTransactionCount", [address, "latest"]).catch(() => null);
  if (hex) return { count: parseInt(hex, 16), source: "rpc" };
  return null;
}

export function getNetworkInfo(network = DEFAULT_NETWORK) {
  return NETWORKS[network] || NETWORKS[DEFAULT_NETWORK];
}

export function listNetworks() {
  return Object.entries(NETWORKS).map(([id, net]) => ({ id, ...net }));
}
