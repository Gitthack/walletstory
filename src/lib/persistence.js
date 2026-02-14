// Persistent storage layer for Vercel
// Uses Upstash Redis for production, falls back to in-memory for local dev

const isServer = typeof window === "undefined";

// Environment variables
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback for local development
let memoryStore = {
  wallets: new Map(),
  leaderboard: [],
  gameProfiles: new Map(),
  searchLog: [],
  marketplace: [],
  rewards: new Map(),
  stats: {
    totalSearches: 0,
    totalRewards: 0,
  },
};

// Redis client (lazy initialization)
let redisClient = null;

async function getRedisClient() {
  if (!isServer || !REDIS_URL || !REDIS_TOKEN) return null;
  
  if (!redisClient) {
    try {
      const Redis = await import("@upstash/redis").then(m => m.default || m);
      redisClient = new Redis({
        url: REDIS_URL,
        token: REDIS_TOKEN,
      });
    } catch (e) {
      console.warn("Redis init failed, using memory fallback:", e.message);
      return null;
    }
  }
  return redisClient;
}

async function redisSet(key, value, ttlSeconds = 300) {
  const client = await getRedisClient();
  if (!client) {
    memoryStore[key] = value;
    return;
  }
  try {
    await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (e) {
    console.warn("Redis set failed, using memory fallback:", e.message);
    memoryStore[key] = value;
  }
}

async function redisGet(key) {
  const client = await getRedisClient();
  if (!client) {
    return memoryStore[key] || null;
  }
  try {
    const result = await client.get(key);
    return result ? JSON.parse(result) : null;
  } catch (e) {
    console.warn("Redis get failed, using memory fallback:", e.message);
    return memoryStore[key] || null;
  }
}

async function redisIncr(key, ttlSeconds = 86400) {
  const client = await getRedisClient();
  if (!client) {
    const val = (memoryStore[key] || 0) + 1;
    memoryStore[key] = val;
    return val;
  }
  try {
    const result = await client.incr(key);
    await client.expire(key, ttlSeconds);
    return result;
  } catch (e) {
    console.warn("Redis incr failed, using memory fallback:", e.message);
    const val = (memoryStore[key] || 0) + 1;
    memoryStore[key] = val;
    return val;
  }
}

async function redisPush(key, value, maxLength = 1000) {
  const client = await getRedisClient();
  if (!client) {
    if (!memoryStore[key]) memoryStore[key] = [];
    memoryStore[key].push(value);
    if (memoryStore[key].length > maxLength) {
      memoryStore[key] = memoryStore[key].slice(-maxLength);
    }
    return;
  }
  try {
    await client.lpush(key, JSON.stringify(value));
    await client.ltrim(key, 0, maxLength - 1);
  } catch (e) {
    console.warn("Redis push failed, using memory fallback:", e.message);
    if (!memoryStore[key]) memoryStore[key] = [];
    memoryStore[key].push(value);
  }
}

async function redisGetList(key, start = 0, end = -1) {
  const client = await getRedisClient();
  if (!client) {
    const list = memoryStore[key] || [];
    return end === -1 ? list.slice(start) : list.slice(start, end + 1);
  }
  try {
    const result = await client.lrange(key, start, end);
    return result.map(item => typeof item === "string" ? JSON.parse(item) : item);
  } catch (e) {
    console.warn("Redis list get failed, using memory fallback:", e.message);
    const list = memoryStore[key] || [];
    return end === -1 ? list.slice(start) : list.slice(start, end + 1);
  }
}

// Search functions with persistence
export async function logSearch(userId, address, archetype) {
  const timestamp = new Date().toISOString();
  
  // Log to search history
  await redisPush("search_log", {
    user_id: userId,
    address: address.toLowerCase(),
    archetype,
    timestamp,
  });
  
  // Increment search count for this address
  await redisIncr(`search_count:${address.toLowerCase()}`);
  
  // Update global stats
  await redisIncr("stats:total_searches");
}

export async function getMostSearched(limit = 20, timeWindow = "all") {
  // For now, get from memory (in production, we'd scan Redis keys)
  const recentSearches = await redisGetList("search_log", 0, 500);
  
  const counts = {};
  for (const s of recentSearches) {
    const key = s.address.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  }
  
  return Object.entries(counts)
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Leaderboard functions
export async function addToLeaderboard(entry) {
  const today = new Date().toISOString().split("T")[0];
  const record = {
    ...entry,
    date: today,
    timestamp: new Date().toISOString(),
  };
  
  await redisPush("leaderboard", record, 500);
}

export async function getLeaderboard(date, limit = 20) {
  const allEntries = await redisGetList("leaderboard", 0, 500);
  
  let entries = date 
    ? allEntries.filter(e => e.date === date)
    : allEntries;
  
  return entries
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}

// Game profile functions
export async function getGameProfile(userId) {
  return await redisGet(`profile:${userId}`);
}

export async function upsertGameProfile(userId, updates) {
  const existing = await getGameProfile(userId) || {
    user_id: userId,
    faction: "neutral",
    rank: 100,
    rankName: "布衣 Commoner",
    total_searches: 0,
    daily_searches: 0,
    last_search_date: null,
    inventory: [],
    territory: [],
    resources: { gold: 100, food: 200, wood: 100, iron: 50 },
    achievements: [],
    winStreak: 0,
    totalTrades: 0,
    marketplaceTransactions: 0,
    createdAt: new Date().toISOString(),
  };
  
  const merged = { 
    ...existing, 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  
  // Update rank name based on rank
  const rankNames = {
    1: "天子 Emperor",
    2: "霸王 Warlord",
    3: "都督 Commander",
    10: "将军 General",
    25: "校尉 Captain",
    50: "军司马 Sergeant",
    75: "屯长 Squad Leader",
    100: "伍长 Team Leader",
  };
  
  const rankKey = Object.keys(rankNames).reverse().find(r => merged.rank <= r) || 100;
  merged.rankName = rankNames[rankKey] || "布衣 Commoner";
  
  await redisSet(`profile:${userId}`, merged, 86400 * 7); // 7 days TTL
  return merged;
}

// Reward/Inventory functions
export async function addReward(userId, reward) {
  const profile = await getGameProfile(userId);
  if (!profile) return null;
  
  if (!profile.inventory) profile.inventory = [];
  
  // Check if item already exists
  const existing = profile.inventory.find(
    item => item.type === reward.type && item.name === reward.name
  );
  
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    existing.lastEarned = new Date().toISOString();
  } else {
    profile.inventory.push({
      ...reward,
      quantity: 1,
      earnedAt: new Date().toISOString(),
    });
  }
  
  // Update stats
  profile.totalRewards = (profile.totalRewards || 0) + 1;
  
  // Persist
  await redisSet(`profile:${userId}`, profile, 86400 * 7);
  
  return profile;
}

export async function getInventory(userId) {
  const profile = await getGameProfile(userId);
  return profile?.inventory || [];
}

// Stats functions
export async function getStats() {
  const totalSearches = await redisGet("stats:total_searches") || 0;
  const totalRewards = await redisGet("stats:total_rewards") || 0;
  const activeProfiles = await redisGetList("active_profiles", 0, -1);
  
  return {
    totalSearches,
    totalRewards,
    activePlayers: activeProfiles.length,
    timestamp: new Date().toISOString(),
  };
}

export async function incrementDailySearches(userId) {
  const today = new Date().toISOString().split("T")[0];
  const profile = await getGameProfile(userId);
  
  if (!profile) return 0;
  
  // Reset daily count if new day
  if (profile.last_search_date !== today) {
    profile.daily_searches = 0;
    profile.last_search_date = today;
  }
  
  profile.daily_searches = (profile.daily_searches || 0) + 1;
  profile.total_searches = (profile.total_searches || 0) + 1;
  
  await redisSet(`profile:${userId}`, profile, 86400 * 7);
  
  return profile.daily_searches;
}

// Marketplace functions
export async function getMarketplaceStats() {
  const listings = await redisGetList("marketplace", 0, -1);
  const active = listings.filter(l => l.status === "active").length;
  const sold = listings.filter(l => l.status === "sold").length;
  const volume = sold.reduce((sum, l) => sum + (l.price || 0), 0);
  
  return {
    activeListings: active,
    totalSold: sold,
    totalVolume: volume,
    timestamp: new Date().toISOString(),
  };
}

export async function getMarketplaceListings(filters = {}) {
  const listings = await redisGetList("marketplace", 0, -1);
  
  let filtered = listings.filter(l => l.status === "active");
  
  if (filters.type) {
    filtered = filtered.filter(l => l.type === filters.type);
  }
  if (filters.faction) {
    filtered = filtered.filter(l => l.faction === filters.faction);
  }
  
  return filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function addMarketplaceItem(item) {
  const listing = {
    id: Date.now().toString(),
    ...item,
    createdAt: new Date().toISOString(),
    status: "active",
  };
  
  await redisPush("marketplace", listing, 1000);
  
  return listing;
}

// Health check
export async function checkHealth() {
  const redis = await getRedisClient();
  
  return {
    status: "ok",
    storage: redis ? "redis" : "memory",
    timestamp: new Date().toISOString(),
  };
}
