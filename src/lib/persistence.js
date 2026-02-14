// Persistent storage layer for Vercel
// Uses Upstash Redis HTTP API for production, falls back to in-memory for local dev

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

// HTTP-based Redis client (no npm dependency needed)
async function redisRequest(command, ...args) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  
  try {
    const response = await fetch(`${REDIS_URL}/${command}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    
    if (!response.ok) {
      throw new Error(`Redis API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn("Redis request failed:", error.message);
    return null;
  }
}

async function redisSet(key, value, ttlSeconds = 300) {
  const result = await redisRequest("set", key, JSON.stringify(value), {
    ex: ttlSeconds,
  });
  return result;
}

async function redisGet(key) {
  const result = await redisRequest("get", key);
  if (result?.result) {
    try {
      return JSON.parse(result.result);
    } catch {
      return result.result;
    }
  }
  return null;
}

async function redisIncr(key) {
  const result = await redisRequest("incr", key);
  return result?.result || 0;
}

async function redisExpire(key, seconds) {
  return await redisRequest("expire", key, seconds);
}

async function redisLPush(key, value) {
  return await redisRequest("lpush", key, JSON.stringify(value));
}

async function redisLTrim(key, start, end) {
  return await redisRequest("ltrim", key, start, end);
}

async function redisLRange(key, start, end) {
  const result = await redisRequest("lrange", key, start, end);
  if (result?.result) {
    return result.result.map(item => {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    });
  }
  return [];
}

// Search functions with persistence
export async function logSearch(userId, address, archetype) {
  const timestamp = new Date().toISOString();
  
  // Log to search history
  await redisLPush("search_log", {
    user_id: userId,
    address: address.toLowerCase(),
    archetype,
    timestamp,
  });
  
  // Increment search count for this address
  await redisIncr(`search_count:${address.toLowerCase()}`);
  
  // Update global stats
  await redisIncr("stats:total_searches");
  
  // Fallback to memory
  memoryStore.searchLog.push({
    user_id: userId,
    address: address.toLowerCase(),
    archetype,
    timestamp,
  });
}

export async function getMostSearched(limit = 20) {
  // For now, get from memory (in production, we'd use Redis SCAN)
  const recentSearches = await redisLRange("search_log", 0, 500);
  
  const counts = {};
  for (const s of recentSearches) {
    const key = s.address?.toLowerCase();
    if (key) {
      counts[key] = (counts[key] || 0) + 1;
    }
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
  
  await redisLPush("leaderboard", record);
  await redisLTrim("leaderboard", 0, 499);
}

export async function getLeaderboard(date, limit = 20) {
  const allEntries = await redisLRange("leaderboard", 0, 500);
  
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
  const existing = await getGameProfile(userId);
  
  const defaultProfile = {
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
    ...existing || defaultProfile, 
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
  
  // Also update memory fallback
  memoryStore.gameProfiles.set(userId, merged);
  
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
  
  // Count game profiles from memory fallback
  const activePlayers = memoryStore.gameProfiles.size;
  
  return {
    totalSearches,
    totalRewards,
    activePlayers,
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
  const listings = await redisLRange("marketplace", 0, -1);
  const active = listings.filter(l => l.status === "active").length;
  const sold = listings.filter(l => l.status === "sold").length;
  const volume = sold.reduce((sum, l) => sum + (l.price || 0), 0);
  
  return {
    activeListings: active,
    totalSold: sold,
    totalVolume: volume,
    averagePrice: sold > 0 ? volume / sold : 0,
    timestamp: new Date().toISOString(),
  };
}

export async function getMarketplaceListings(filters = {}) {
  const listings = await redisLRange("marketplace", 0, -1);
  
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
  
  await redisLPush("marketplace", listing);
  
  return listing;
}

// Health check
export async function checkHealth() {
  // Test Redis connection
  let storage = "memory";
  try {
    const test = await redisGet("health_check");
    if (test === null) {
      // Redis is working (key doesn't exist but no error)
      storage = "redis";
    }
  } catch (e) {
    console.warn("Health check Redis test failed:", e.message);
  }
  
  return {
    status: "ok",
    storage,
    timestamp: new Date().toISOString(),
  };
}
