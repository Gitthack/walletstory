// Enhanced database layer with persistence
// Uses Upstash Redis for production, falls back to memory for local dev

import {
  logSearch as persistLogSearch,
  getMostSearched as persistGetMostSearched,
  addToLeaderboard as persistAddToLeaderboard,
  getLeaderboard as persistGetLeaderboard,
  getGameProfile as persistGetGameProfile,
  upsertGameProfile as persistUpsertGameProfile,
  addReward as persistAddReward,
  getInventory as persistGetInventory,
  getStats as persistGetStats,
  incrementDailySearches as persistIncrementDailySearches,
  getMarketplaceStats as persistGetMarketplaceStats,
  getMarketplaceListings as persistGetMarketplaceListings,
  addMarketplaceItem as persistAddMarketplaceItem,
} from "./persistence";

// In-memory fallback for when persistence fails
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

// Log search with persistence fallback
export function logSearch(userId, address, archetype) {
  try {
    persistLogSearch(userId, address, archetype);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    memoryStore.searchLog.push({
      user_id: userId,
      address: address.toLowerCase(),
      archetype,
      timestamp: new Date().toISOString(),
    });
  }
}

export function getMostSearched(limit = 20) {
  try {
    return persistGetMostSearched(limit);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    
    const counts = {};
    for (const s of memoryStore.searchLog) {
      const key = s.address.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
    
    return Object.entries(counts)
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// Leaderboard functions
export function addToLeaderboard(entry) {
  try {
    persistAddToLeaderboard(entry);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    memoryStore.leaderboard.push(entry);
  }
}

export function getLeaderboard(date, limit = 20) {
  try {
    return persistGetLeaderboard(date, limit);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    
    let entries = date 
      ? memoryStore.leaderboard.filter(e => e.date === date)
      : memoryStore.leaderboard;
    
    return entries
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }
}

// Game profile functions
export function getGameProfile(userId) {
  try {
    return persistGetGameProfile(userId);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    return memoryStore.gameProfiles.get(userId) || null;
  }
}

export function upsertGameProfile(userId, updates) {
  try {
    return persistUpsertGameProfile(userId, updates);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    
    const existing = memoryStore.gameProfiles.get(userId) || {
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
    
    memoryStore.gameProfiles.set(userId, merged);
    return merged;
  }
}

export function addAchievement(userId, achievement) {
  const profile = getGameProfile(userId);
  if (!profile) return null;
  
  if (!profile.achievements) profile.achievements = [];
  
  if (!profile.achievements.some(a => a.id === achievement.id)) {
    profile.achievements.push({
      ...achievement,
      earnedAt: new Date().toISOString(),
    });
  }
  
  return upsertGameProfile(userId, profile);
}

// Inventory functions
export function addReward(userId, reward) {
  try {
    return persistAddReward(userId, reward);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    
    const profile = getGameProfile(userId);
    if (!profile) return null;
    
    if (!profile.inventory) profile.inventory = [];
    
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
    
    return upsertGameProfile(userId, profile);
  }
}

export function getInventory(userId) {
  try {
    return persistGetInventory(userId);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    const profile = memoryStore.gameProfiles.get(userId);
    return profile?.inventory || [];
  }
}

// Marketplace functions
export function getMarketplaceListings(filters = {}) {
  try {
    return persistGetMarketplaceListings(filters);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    
    let listings = memoryStore.marketplace.filter(l => l.status === "active");
    
    if (filters.type) {
      listings = listings.filter(l => l.type === filters.type);
    }
    if (filters.faction) {
      listings = listings.filter(l => l.faction === filters.faction);
    }
    
    return listings.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export function addMarketplaceItem(item) {
  const listing = {
    id: Date.now().toString(),
    ...item,
    createdAt: new Date().toISOString(),
    status: "active",
  };
  
  try {
    persistAddMarketplaceItem(listing);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    memoryStore.marketplace.push(listing);
  }
  
  return listing;
}

export function getMarketplaceStats() {
  try {
    return persistGetMarketplaceStats();
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    
    const active = memoryStore.marketplace.filter(l => l.status === "active").length;
    const sold = memoryStore.marketplace.filter(l => l.status === "sold").length;
    const totalVolume = memoryStore.marketplace
      .filter(l => l.status === "sold")
      .reduce((sum, l) => sum + (l.price || 0), 0);
    
    return {
      activeListings: active,
      totalSold: sold,
      totalVolume,
      averagePrice: sold > 0 ? totalVolume / sold : 0,
    };
  }
}

// Stats functions
export function getStats() {
  try {
    return persistGetStats();
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    
    const totalSearches = memoryStore.stats.totalSearches;
    const totalRewards = memoryStore.stats.totalRewards;
    
    return {
      totalSearches,
      totalRewards,
      activePlayers: memoryStore.gameProfiles.size,
    };
  }
}

export function incrementDailySearches(userId) {
  try {
    return persistIncrementDailySearches(userId);
  } catch (error) {
    console.warn("Persistence failed, using memory:", error);
    
    const today = new Date().toISOString().split("T")[0];
    const profile = memoryStore.gameProfiles.get(userId);
    
    if (!profile) return 0;
    
    if (profile.last_search_date !== today) {
      profile.daily_searches = 0;
      profile.last_search_date = today;
    }
    
    profile.daily_searches = (profile.daily_searches || 0) + 1;
    profile.total_searches = (profile.total_searches || 0) + 1;
    
    memoryStore.gameProfiles.set(userId, profile);
    return profile.daily_searches;
  }
}

// Helper function for compatibility
export function cacheWallet(data) {
  memoryStore.wallets.set(data.address.toLowerCase(), {
    ...data,
    cachedAt: new Date().toISOString(),
  });
}

export function getCachedWallet(address) {
  return memoryStore.wallets.get(address.toLowerCase()) || null;
}

export function getTrendingArchetypes() {
  const archetypeCounts = {};
  const archetypeScores = {};
  
  for (const s of memoryStore.searchLog) {
    if (s.archetype) {
      archetypeCounts[s.archetype] = (archetypeCounts[s.archetype] || 0) + 1;
    }
  }
  
  for (const entry of memoryStore.leaderboard) {
    if (entry.archetype) {
      if (!archetypeScores[entry.archetype]) {
        archetypeScores[entry.archetype] = { totalScore: 0, count: 0 };
      }
      archetypeScores[entry.archetype].totalScore += entry.score || 0;
      archetypeScores[entry.archetype].count++;
    }
  }
  
  return Object.entries(archetypeCounts)
    .map(([archetype, count]) => ({
      archetype,
      searchCount: count,
      avgScore: archetypeScores[archetype] 
        ? Math.round(archetypeScores[archetype].totalScore / archetypeScores[archetype].count) 
        : 0,
    }))
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, 5);
}

// Expose the internal store for debugging
export const store = memoryStore;
