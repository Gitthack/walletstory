// POST /api/game
// Body: { action: "claim_reward" | "get_profile", userId, archetype? }

import { NextResponse } from "next/server";
import { getGameProfile, upsertGameProfile } from "@/lib/db";
import { getRewardForArchetype, getRankTitle } from "@/lib/gamedata";

const DAILY_CAP = parseInt(process.env.DAILY_SEARCH_CAP || "10");

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId = "anonymous", archetype } = body;

    if (action === "get_profile") {
      const profile = getGameProfile(userId);
      if (!profile) {
        const newProfile = upsertGameProfile(userId, {});
        return NextResponse.json({
          ...newProfile,
          rankTitle: getRankTitle(0),
        });
      }
      return NextResponse.json({
        ...profile,
        rankTitle: getRankTitle(profile.total_searches),
      });
    }

    if (action === "claim_reward") {
      if (!archetype) {
        return NextResponse.json({ error: "archetype required" }, { status: 400 });
      }

      let profile = getGameProfile(userId);
      const today = new Date().toISOString().split("T")[0];

      if (!profile) {
        profile = upsertGameProfile(userId, {});
      }

      // Reset daily counter if new day
      if (profile.last_search_date !== today) {
        profile.daily_searches = 0;
      }

      // Check daily cap
      if (profile.daily_searches >= DAILY_CAP) {
        return NextResponse.json({
          error: "Daily search cap reached",
          dailyCap: DAILY_CAP,
          dailySearches: profile.daily_searches,
        }, { status: 429 });
      }

      // Generate reward
      const reward = getRewardForArchetype(archetype);
      const inventory = [...(profile.inventory || []), { ...reward, claimedAt: new Date().toISOString() }];

      // Update resources
      const resources = profile.resources || { gold: 100, food: 200, wood: 100, iron: 50 };
      resources.gold = (resources.gold || 0) + (reward.power || 10);
      resources.food = (resources.food || 0) + 10;

      const updated = upsertGameProfile(userId, {
        total_searches: (profile.total_searches || 0) + 1,
        daily_searches: (profile.daily_searches || 0) + 1,
        last_search_date: today,
        inventory,
        resources,
        rank: Math.max(1, 100 - Math.floor((profile.total_searches || 0) / 2)),
      });

      return NextResponse.json({
        reward,
        profile: {
          ...updated,
          rankTitle: getRankTitle(updated.total_searches),
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Game API error:", err);
    return NextResponse.json({ error: "Game service error" }, { status: 500 });
  }
}
