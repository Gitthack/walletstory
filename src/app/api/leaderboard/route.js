// GET /api/leaderboard?date=YYYY-MM-DD
// Returns daily top wallets and live headlines from actual searches

import { NextResponse } from "next/server";
import { getLeaderboard, getTopSearched } from "@/lib/db";
import { ARCHETYPES } from "@/lib/archetypes";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    const entries = getLeaderboard(date);
    const topSearched = getTopSearched(10);

    // Build live headlines from actual leaderboard entries
    const headlines = entries.slice(0, 10).map((entry) => ({
      title: entry.title,
      type: entry.archetype,
      time: entry.createdAt ? timeAgo(entry.createdAt) : "today",
      score: entry.score,
      address: entry.address,
    }));

    // If no live data, show empty state
    if (entries.length === 0) {
      return NextResponse.json({
        headlines: [{
          title: "No wallet searches yet today — be the first to analyze a wallet!",
          type: "Fresh Wallet",
          time: "now",
          score: 0,
        }],
        wallets: [],
        topSearched: [],
        date: date || new Date().toISOString().split("T")[0],
        source: "empty",
      });
    }

    return NextResponse.json({
      headlines,
      wallets: entries,
      topSearched,
      date: date || new Date().toISOString().split("T")[0],
      source: "live",
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json({
      headlines: [],
      wallets: [],
      topSearched: [],
      date: new Date().toISOString().split("T")[0],
      source: "error",
    });
  }
}
