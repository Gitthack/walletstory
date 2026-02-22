// GET /api/analyze?address=0x...&mode=snapshot|realtime&network=ethereum&depth=200
// Unified analysis endpoint using the tool orchestrator
// Returns: story, score, archetypeId, signals, rawRefs, toolRunLogId

import { NextResponse } from "next/server";
import { analyzeWallet } from "@/lib/toolOrchestrator";
import { logSearch, addToLeaderboard, upsertGameProfile, getGameProfile } from "@/lib/db";
import { generateHeadline } from "@/lib/stories";
import { getRewardForArchetype } from "@/lib/gamedata";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const mode = searchParams.get("mode") || "snapshot";
  const network = searchParams.get("network") || "ethereum";
  const depth = parseInt(searchParams.get("depth") || "200", 10);
  const toolsParam = searchParams.get("tools"); // comma-separated tool IDs

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address. Must be 0x followed by 40 hex characters." },
      { status: 400 }
    );
  }

  try {
    const tools = toolsParam ? toolsParam.split(",").filter(Boolean) : [];

    const { result, toolRunLog } = await analyzeWallet(address, {
      mode,
      network,
      depth,
      tools,
    });

    // Log search and update game profile
    logSearch("anonymous", address, result.archetype);
    updateGameProfile(result.archetype);

    // Generate headline and add to leaderboard (use features for headline)
    const headline = generateHeadline(address, result.archetype, result.features, result.score);
    addToLeaderboard({
      address,
      title: headline,
      archetype: result.archetype,
      score: result.score,
      stats: result.stats,
    });

    // Strip raw features before sending to client (internal only)
    const { features: _features, ...clientResult } = result;

    return NextResponse.json({
      ...clientResult,
      toolRunLog: {
        id: toolRunLog.id,
        status: toolRunLog.status,
        totalDurationMs: toolRunLog.totalDurationMs,
        stepCount: toolRunLog.steps.length,
        cacheHit: toolRunLog.cacheHit,
      },
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Failed to analyze wallet. Please try again." },
      { status: 500 }
    );
  }
}

function updateGameProfile(archetype) {
  const userId = "anonymous";
  const today = new Date().toISOString().split("T")[0];
  let profile = getGameProfile(userId);
  if (!profile) profile = upsertGameProfile(userId, {});

  const dailySearches = profile.last_search_date !== today ? 0 : (profile.daily_searches || 0);
  const reward = getRewardForArchetype(archetype);
  const inventory = [...(profile.inventory || []), { ...reward, claimedAt: new Date().toISOString() }];

  const resources = profile.resources || { gold: 100, food: 200, wood: 100, iron: 50 };
  resources.gold = (resources.gold || 0) + (reward.power || 10);
  resources.food = (resources.food || 0) + 10;
  resources.wood = (resources.wood || 0) + 5;
  resources.iron = (resources.iron || 0) + 3;

  const totalSearches = (profile.total_searches || 0) + 1;

  upsertGameProfile(userId, {
    total_searches: totalSearches,
    daily_searches: dailySearches + 1,
    last_search_date: today,
    inventory,
    resources,
    rank: Math.max(1, 100 - Math.floor(totalSearches / 2)),
  });
}
