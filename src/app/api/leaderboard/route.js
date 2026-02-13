// Enhanced leaderboard API with daily rankings and hot wallets

import { NextResponse } from "next/server";
import { 
  getLeaderboard, 
  getTopSearched, 
  getRecentSearches,
  getWalletMetrics,
  getTrendingArchetypes
} from "@/lib/db";
import { generateHotWalletInsights } from "@/lib/stories";

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
        leaderboard = getLeaderboard(null).slice(0, limit);
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
        const recentLeaderboard = getLeaderboard()
          .filter(e => new Date(e.date) >= weekAgo);
        
        leaderboard = recentLeaderboard
          .sort((a, b) => b.score - a.score)
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
        const allTime = getLeaderboard()
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((entry, idx) => ({
            rank: idx + 1,
            ...entry,
          }));
        leaderboard = allTime;
        metadata = {
          type: "all-time",
          description: "All-time top wallet stories",
          totalEntries: getLeaderboard().length,
        };
        break;

      case "insights":
        // Generate narrative insights from leaderboard
        const allWallets = getLeaderboard().slice(0, 50);
        hotInsights = generateHotWalletInsights(allWallets);
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
