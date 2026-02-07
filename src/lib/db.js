// In-memory store (resets on server restart — suitable for demo / MVP)

const store = {
  wallets: new Map(),
  leaderboard: [],
  gameProfiles: new Map(),
  searchLog: [],
};

// --- Wallet cache ---
export function cacheWallet(address, data) {
  const key = address.toLowerCase();
  store.wallets.set(key, { ...data, cachedAt: Date.now() });
}

export function getCachedWallet(address) {
  const key = address.toLowerCase();
  const entry = store.wallets.get(key);
  if (!entry) return null;
  // Cache for 5 minutes
  if (Date.now() - entry.cachedAt > 5 * 60 * 1000) {
    store.wallets.delete(key);
    return null;
  }
  return entry;
}

// --- Leaderboard ---
export function addToLeaderboard(entry) {
  const existing = store.leaderboard.findIndex(
    (e) => e.address.toLowerCase() === entry.address.toLowerCase()
  );
  if (existing >= 0) {
    store.leaderboard[existing] = { ...store.leaderboard[existing], ...entry, updatedAt: Date.now() };
  } else {
    store.leaderboard.push({ ...entry, createdAt: Date.now() });
  }
  store.leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
  if (store.leaderboard.length > 100) store.leaderboard = store.leaderboard.slice(0, 100);
}

export function getLeaderboard(limit = 20) {
  return store.leaderboard.slice(0, limit);
}

// --- Game Profiles ---
export function getGameProfile(address) {
  return store.gameProfiles.get(address.toLowerCase()) || null;
}

export function upsertGameProfile(address, data) {
  const key = address.toLowerCase();
  const existing = store.gameProfiles.get(key) || { rewards: [], totalPower: 0, faction: 'Neutral' };
  const updated = { ...existing, ...data };
  store.gameProfiles.set(key, updated);
  return updated;
}

// --- Search log ---
export function logSearch(address, searcher) {
  store.searchLog.push({
    address: address.toLowerCase(),
    searcher: searcher || 'anonymous',
    at: Date.now(),
  });
  if (store.searchLog.length > 1000) store.searchLog = store.searchLog.slice(-500);
}

export function getTopSearched(limit = 10) {
  const counts = {};
  for (const entry of store.searchLog) {
    counts[entry.address] = (counts[entry.address] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([address, count]) => ({ address, count }));
}
