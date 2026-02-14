export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import {
  getLeaderboard,
  getMostSearched,
  getTrendingArchetypes,
  getMarketplaceStats,
  getStats,
} from "@/lib/db";

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  try {
    const stats = {
      timestamp: new Date().toISOString(),
    };

    switch (type) {
      case "trending":
        stats.trending = {
          archetypes: getTrendingArchetypes(),
          hotWallets: await getMostSearched(10),
        };
        break;

      case "leaderboard":
        const limit = parseInt(searchParams.get("limit")) || 20;
        const dailyLeaderboard = await getLeaderboard(null);
        stats.leaderboard = {
          daily: dailyLeaderboard.slice(0, limit),
          totalEntries: dailyLeaderboard.length,
        };
        break;

      case "marketplace":
        const marketStats = await getMarketplaceStats();
        stats.marketplace = {
          activeCount: marketStats.activeListings,
          soldCount: marketStats.totalSold,
          totalVolume: marketStats.totalVolume,
          averagePrice: marketStats.averagePrice,
        };
        break;

      case "all":
      default:
        const [dailyLeaderboardAll, marketStatsAll, globalStats] = await Promise.all([
          getLeaderboard(null),
          getMarketplaceStats(),
          getStats(),
        ]);

        stats.leaderboard = {
          daily: dailyLeaderboardAll.slice(0, 10),
          totalEntries: dailyLeaderboardAll.length,
        };
        stats.trending = {
          archetypes: getTrendingArchetypes(),
          hotWallets: await getMostSearched(10),
        };
        stats.marketplace = {
          activeCount: marketStatsAll.activeListings,
          soldCount: marketStatsAll.totalSold,
          totalVolume: marketStatsAll.totalVolume,
        };
        stats.game = {
          totalPlayers: globalStats.activePlayers,
        };
        stats.global = {
          totalSearches: globalStats.totalSearches,
          totalRewards: globalStats.totalRewards,
        };
        break;
    }

    return NextResponse.json(stats, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
