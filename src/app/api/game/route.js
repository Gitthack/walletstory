// POST /api/game
// Body: { action: "claim_reward" | "get_profile", userId, archetype? }

import { NextResponse } from "next/server";
import { getGameProfile, upsertGameProfile, addReward, incrementDailySearches } from "@/lib/db";
import { getRewardForArchetype, getRankTitle } from "@/lib/gamedata";

const DAILY_CAP = parseInt(process.env.DAILY_SEARCH_CAP || "10");

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId = "anonymous", archetype } = body;

    if (action === "get_profile") {
      const profile = await getGameProfile(userId);
      if (!profile) {
        const newProfile = await upsertGameProfile(userId, {});
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

      let profile = await getGameProfile(userId);
      const today = new Date().toISOString().split("T")[0];

      if (!profile) {
        profile = await upsertGameProfile(userId, {});
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
      
      // Add reward to inventory with persistence
      const updatedProfile = await addReward(userId, reward);

      // Increment daily searches
      const newDailyCount = await incrementDailySearches(userId);

      return NextResponse.json({
        reward,
        profile: {
          ...updatedProfile,
          dailySearches: newDailyCount,
          rankTitle: getRankTitle(updatedProfile.total_searches || 0),
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Game API error:", err);
    return NextResponse.json({ error: "Game service error" }, { status: 500 });
  }
}
