// GET /api/leaderboard?date=YYYY-MM-DD
// Returns daily top wallets

import { NextResponse } from "next/server";
import { getLeaderboard, getTopSearched } from "@/lib/db";
import { SAMPLE_STORIES, DAILY_HEADLINES } from "@/data/samples";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    const entries = getLeaderboard(date);
    const topSearched = getTopSearched(10);

    // If no real data, return samples
    if (entries.length === 0) {
      return NextResponse.json({
        headlines: DAILY_HEADLINES,
        wallets: SAMPLE_STORIES,
        topSearched: [],
        date: date || new Date().toISOString().split("T")[0],
        source: "sample",
      });
    }

    return NextResponse.json({
      headlines: DAILY_HEADLINES,
      wallets: entries,
      topSearched,
      date: date || new Date().toISOString().split("T")[0],
      source: "live",
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json({
      headlines: DAILY_HEADLINES,
      wallets: SAMPLE_STORIES,
      topSearched: [],
      date: new Date().toISOString().split("T")[0],
      source: "fallback",
    });
  }
}
