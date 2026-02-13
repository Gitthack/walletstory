// Pure in-memory storage — no native dependencies needed

let store = {
  wallets: new Map(),
  leaderboard: [],
  gameProfiles: new Map(),
  searchLog: [],
  marketplace: [],
  rewards: new Map(),
};

export function cacheWallet(data) {
  store.wallets.set(data.address.toLowerCase(), {
    ...data,
    cachedAt: new Date().toISOString(),
  });
}

export function getCachedWallet(address) {
  return store.wallets.get(address.toLowerCase()) || null;
}

export function getWalletMetrics(address) {
  const wallet = store.wallets.get(address.toLowerCase());
  if (!wallet) return null;
  return {
    address: wallet.address,
    archetype: wallet.archetype,
    score: wallet.score,
    stats: wallet.stats,
    story: wallet.story,
    lastAnalyzed: wallet.cachedAt,
  };
}

export function addToLeaderboard(entry) {
  const today = new Date().toISOString().split("T")[0];
  store.leaderboard.push({ ...entry, date: today });
  // Keep only last 500 entries
  if (store.leaderboard.length > 500) store.leaderboard = store.leaderboard.slice(-500);
}

export function getLeaderboard(date) {
  const d = date || new Date().toISOString().split("T")[0];
  return store.leaderboard.filter((e) => e.date === d).sort((a, b) => b.score - a.score).slice(0, 20);
}

export function getRecentSearches(limit = 50) {
  return store.searchLog.slice(-limit);
}

export function getTopSearched(limit = 10) {
  const counts = {};
  for (const s of store.searchLog) counts[s.address] = (counts[s.address] || 0) + 1;
  return Object.entries(counts).map(([address, count]) => ({ address, search_count: count })).sort((a, b) => b.search_count - a.search_count).slice(0, limit);
}

export function getTrendingArchetypes() {
  const archetypeCounts = {};
  const archetypeScores = {};
  
  for (const s of store.searchLog) {
    if (s.archetype) {
      archetypeCounts[s.archetype] = (archetypeCounts[s.archetype] || 0) + 1;
    }
  }
  
  for (const entry of store.leaderboard) {
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

// Three Kingdoms Marketplace
export function addMarketplaceItem(item) {
  const listing = {
    id: Date.now().toString(),
    ...item,
    createdAt: new Date().toISOString(),
    status: "active",
  };
  store.marketplace.push(listing);
  return listing;
}

export function getMarketplaceListings(filters = {}) {
  let listings = store.marketplace.filter(l => l.status === "active");
  
  if (filters.type) {
    listings = listings.filter(l => l.type === filters.type);
  }
  if (filters.faction) {
    listings = listings.filter(l => l.faction === filters.faction);
  }
  if (filters.minPrice !== undefined) {
    listings = listings.filter(l => l.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    listings = listings.filter(l => l.price <= filters.maxPrice);
  }
  
  return listings.sort((a, b) => b.createdAt - a.createdAt);
}

export function purchaseListing(listingId, buyerAddress) {
  const listing = store.marketplace.find(l => l.id === listingId && l.status === "active");
  if (!listing) return null;
  
  listing.status = "sold";
  listing.soldTo = buyerAddress;
  listing.soldAt = new Date().toISOString();
  
  // Record reward
  store.rewards.set(listing.id, {
    listingId,
    buyer: buyerAddress,
    seller: listing.seller,
    price: listing.price,
    item: listing.item,
    timestamp: new Date().toISOString(),
  });
  
  return listing;
}

export function getMarketplaceStats() {
  const active = store.marketplace.filter(l => l.status === "active").length;
  const sold = store.marketplace.filter(l => l.status === "sold").length;
  const totalVolume = store.marketplace
    .filter(l => l.status === "sold")
    .reduce((sum, l) => sum + (l.price || 0), 0);
  
  return {
    activeListings: active,
    totalSold: sold,
    totalVolume,
    averagePrice: sold > 0 ? totalVolume / sold : 0,
  };
}

// Enhanced Game Profiles with achievements
export function getGameProfile(userId) {
  return store.gameProfiles.get(userId) || null;
}

export function upsertGameProfile(userId, updates) {
  const existing = store.gameProfiles.get(userId) || {
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
  
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  
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
  
  store.gameProfiles.set(userId, merged);
  return merged;
}

export function addAchievement(userId, achievement) {
  const profile = store.gameProfiles.get(userId);
  if (!profile) return null;
  
  if (!profile.achievements) profile.achievements = [];
  
  // Check if already earned
  if (profile.achievements.some(a => a.id === achievement.id)) {
    return profile;
  }
  
  profile.achievements.push({
    ...achievement,
    earnedAt: new Date().toISOString(),
  });
  
  // Bonus resources for achievements
  if (achievement.bonus) {
    profile.resources.gold += achievement.bonus.gold || 0;
    profile.resources.food += achievement.bonus.food || 0;
  }
  
  store.gameProfiles.set(userId, profile);
  return profile;
}

export function logSearch(userId, address, archetype) {
  store.searchLog.push({ user_id: userId, address, archetype, created_at: new Date().toISOString() });
  if (store.searchLog.length > 5000) store.searchLog = store.searchLog.slice(-5000);
}
