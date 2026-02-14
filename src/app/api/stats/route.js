import { NextResponse } from "next/server";
import {
  getLeaderboard,
  getTopSearched,
  getTrendingArchetypes,
  getMarketplaceStats,
  store
} from "@/lib/db";

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
          hotWallets: getTopSearched(10),
        };
        break;

      case "leaderboard":
        const limit = parseInt(searchParams.get("limit")) || 20;
        stats.leaderboard = {
          daily: getLeaderboard().slice(0, limit),
          totalEntries: store.leaderboard?.length || 0,
        };
        break;

      case "marketplace":
        const activeListings = store.marketplace?.filter(l => l.status === "active") || [];
        const soldListings = store.marketplace?.filter(l => l.status === "sold") || [];
        
        stats.marketplace = {
          activeCount: activeListings.length,
          soldCount: soldListings.length,
          totalVolume: soldListings.reduce((sum, l) => sum + (l.price || 0), 0),
        };
        break;

      case "all":
      default:
        stats.leaderboard = {
          daily: getLeaderboard().slice(0, 10),
          totalEntries: store.leaderboard?.length || 0,
        };
        stats.trending = {
          archetypes: getTrendingArchetypes(),
          hotWallets: getTopSearched(10),
        };
        stats.marketplace = {
          activeCount: store.marketplace?.filter(l => l.status === "active").length || 0,
          soldCount: store.marketplace?.filter(l => l.status === "sold").length || 0,
        };
        stats.game = {
          totalPlayers: store.gameProfiles?.size || 0,
        };
        break;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
