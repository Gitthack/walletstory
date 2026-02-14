// Enhanced leaderboard API with daily rankings and hot wallets

import { NextResponse } from "next/server";
import { 
  getLeaderboard, 
  getMostSearched,
  getTrendingArchetypes,
} from "@/lib/db";
import { ARCHETYPES } from "@/lib/gamedata";

function generateHotWalletInsights(wallets) {
  if (!wallets || wallets.length === 0) {
    return {
      summary: "No wallet data available yet. Start searching wallets to generate insights!",
      trends: [],
    };
  }

  const archetypeCounts = {};
  wallets.forEach(w => {
    if (w.archetype) {
      archetypeCounts[w.archetype] = (archetypeCounts[w.archetype] || 0) + 1;
    }
  });

  const topArchetype = Object.entries(archetypeCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    summary: topArchetype 
      ? `Dominant archetype: ${topArchetype[0]} (${topArchetype[1]} searches)`
      : "Search activity is distributed across archetypes",
    trends: Object.entries(archetypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([arch, count]) => ({
        archetype: arch,
        count,
        percentage: Math.round((count / wallets.length) * 100),
      })),
  };
}

function getRecentSearches(limit = 100) {
  // Return empty array - actual implementation would come from persistence
  return [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "daily"; // daily, weekly, all-time, hot
  const limit = parseInt(searchParams.get("limit")) || 20;

  try {
    let leaderboard = [];
    let hotInsights = null;
    let metadata = {};

    switch (type) {
      case "hot":
        // Hot wallets based on recent searches and high activity
        const recentSearches = getRecentSearches(100);
        const hotWallets = recentSearches
          .filter(s => s.archetype)
          .reduce((acc, s) => {
            if (!acc[s.address]) {
              acc[s.address] = { ...s, count: 0 };
            }
            acc[s.address].count++;
            return acc;
          }, {});
        
        const hotList = Object.values(hotWallets)
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)
          .map((item, idx) => ({
            rank: idx + 1,
            address: item.address,
            archetype: item.archetype,
            searchCount: item.count,
            lastSearched: item.created_at,
          }));
        
        leaderboard = hotList;
        metadata = {
          type: "hot",
          description: "Most searched wallets in the last 24 hours",
          refreshInterval: "Every 15 minutes",
        };
        break;

      case "daily":
        leaderboard = await getLeaderboard(null);
        leaderboard = leaderboard.slice(0, limit);
        metadata = {
          type: "daily",
          date: new Date().toISOString().split("T")[0],
          description: "Today's top wallet stories",
        };
        break;

      case "weekly":
        // Aggregate last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentLeaderboard = await getLeaderboard();
        const weeklyEntries = recentLeaderboard
          .filter(e => new Date(e.date || e.timestamp) >= weekAgo);
        
        leaderboard = weeklyEntries
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, limit)
          .map((entry, idx) => ({
            rank: idx + 1,
            ...entry,
          }));
        
        metadata = {
          type: "weekly",
          period: "Last 7 days",
          description: "Top wallets of the week",
        };
        break;

      case "all-time":
        const allTime = await getLeaderboard();
        leaderboard = allTime
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, limit)
          .map((entry, idx) => ({
            rank: idx + 1,
            ...entry,
          }));
        metadata = {
          type: "all-time",
          description: "All-time top wallet stories",
          totalEntries: allTime.length,
        };
        break;

      case "insights":
        // Generate narrative insights from leaderboard
        const allWallets = await getLeaderboard();
        hotInsights = generateHotWalletInsights(allWallets.slice(0, 50));
        leaderboard = [];
        metadata = {
          type: "insights",
          description: "AI-generated market insights from wallet activity",
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type. Use: daily, weekly, all-time, hot, or insights" },
          { status: 400 }
        );
    }

    // Add trending archetype data
    const trendingArchetypes = getTrendingArchetypes();
    
    return NextResponse.json({
      leaderboard,
      metadata,
      trendingArchetypes,
      hotInsights,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
