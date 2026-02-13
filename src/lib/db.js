// Pure in-memory storage — no native dependencies needed

let store = {
  wallets: new Map(),
  leaderboard: [],
  gameProfiles: new Map(),
  searchLog: [],
};

export function cacheWallet(data) {
  store.wallets.set(data.address.toLowerCase(), data);
}

export function getCachedWallet(address) {
  return store.wallets.get(address.toLowerCase()) || null;
}

export function addToLeaderboard(entry) {
  const today = new Date().toISOString().split("T")[0];
  store.leaderboard.push({ ...entry, date: today, createdAt: new Date().toISOString() });
  if (store.leaderboard.length > 100) store.leaderboard = store.leaderboard.slice(-100);
}

export function getLeaderboard(date) {
  const d = date || new Date().toISOString().split("T")[0];
  return store.leaderboard.filter((e) => e.date === d).sort((a, b) => b.score - a.score).slice(0, 20);
}

export function getGameProfile(userId) {
  return store.gameProfiles.get(userId) || null;
}

export function upsertGameProfile(userId, updates) {
  const existing = store.gameProfiles.get(userId) || {
    user_id: userId, faction: "neutral", rank: 100, total_searches: 0,
    daily_searches: 0, last_search_date: null, inventory: [], territory: [],
    resources: { gold: 100, food: 200, wood: 100, iron: 50 },
  };
  const merged = { ...existing, ...updates };
  store.gameProfiles.set(userId, merged);
  return merged;
}

export function logSearch(userId, address, archetype) {
  store.searchLog.push({ user_id: userId, address, archetype, created_at: new Date().toISOString() });
  if (store.searchLog.length > 1000) store.searchLog = store.searchLog.slice(-1000);
}

export function getTopSearched(limit = 10) {
  const counts = {};
  for (const s of store.searchLog) counts[s.address] = (counts[s.address] || 0) + 1;
  return Object.entries(counts).map(([address, count]) => ({ address, search_count: count })).sort((a, b) => b.search_count - a.search_count).slice(0, limit);
}
