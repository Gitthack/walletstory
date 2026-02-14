export const dynamic = "force-dynamic";
export const revalidate = 0;

// Trending Page - Shows Most Searched wallets and On-chain Moves
// Replaces old Leaderboard page

import { NextResponse } from "next/server";
import { getMostSearched, getLeaderboard } from "@/lib/db";
import { redisGetList, redisGet } from "@/lib/persistence";

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Cache for on-chain moves (5 minutes)
const CACHE_TTL = 300;
let onChainMovesCache = null;
let onChainMovesCacheTime = 0;

// On-chain moves from safe API sources
async function fetchOnChainMoves() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (onChainMovesCache && (now - onChainMovesCacheTime) < CACHE_TTL * 1000) {
    return onChainMovesCache;
  }
  
  try {
    // Fetch from multiple sources with timeout
    const sources = [];
    
    // Source 1: DexScreener trending pairs (public API, no key needed)
    sources.push(
      fetch("https://api.dexscreener.com/latest/dex/pairs?chainId=1&volume=24h", {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }).then(async (res) => {
        if (!res.ok) return [];
        const data = await res.json();
        return (data.pairs || []).slice(0, 5).map(pair => ({
          wallet: pair.quoteToken?.address || pair.baseToken?.address,
          chain: "Ethereum",
          reason: `High volume: $${(pair.volume24h / 1e6).toFixed(1)}M`,
          timestamp: new Date().toISOString(),
          source: "dexscreener",
          url: pair.url,
        }));
      }).catch(() => [])
    );
    
    // Source 2: Arkham intelligence API (requires key, optional)
    const arkhamKey = process.env.ARKHAM_API_KEY;
    if (arkhamKey) {
      sources.push(
        fetch("https://api.arkhamintelligence.com/entities?sort=activity&limit=10", {
          headers: { "API-Key": arkhamKey },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }).then(async (res) => {
          if (!res.ok) return [];
          const data = await res.json();
          return (data.entities || []).slice(0, 5).map(entity => ({
            wallet: entity.address,
            chain: entity.chain || "Ethereum",
            reason: entity.label || "High activity entity",
            timestamp: entity.lastActive || new Date().toISOString(),
            source: "arkham",
          }));
        }).catch(() => [])
      );
    }
    
    // Wait for all sources with timeout
    const results = await Promise.allSettled(sources);
    const moves = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value || []);
    
    // Cache the results
    onChainMovesCache = moves.slice(0, 10);
    onChainMovesCacheTime = now;
    
    return onChainMovesCache;
  } catch (error) {
    console.warn("On-chain moves fetch failed:", error.message);
    
    // Return cached data if available, even if expired
    return onChainMovesCache || [];
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all"; // trending, moves, all
  const limit = parseInt(searchParams.get("limit")) || 20;
  
  try {
    const result = {
      timestamp: new Date().toISOString(),
    };
    
    switch (type) {
      case "most-searched":
        // Get most searched wallets
        const searched = await getMostSearched(limit);
        result.mostSearched = searched;
        break;
        
      case "moves":
        // Get on-chain moves
        const moves = await fetchOnChainMoves();
        result.onChainMoves = moves;
        break;
        
      case "all":
      default:
        // Get most searched wallets
        const searchedAll = await getMostSearched(limit);
        result.mostSearched = searchedAll;
        
        // Get on-chain moves
        const movesAll = await fetchOnChainMoves();
        result.onChainMoves = movesAll;
        break;
    }
    
    return NextResponse.json(result, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending data" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
