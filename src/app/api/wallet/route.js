// GET /api/wallet?address=0x...
// Returns wallet analysis: archetype, story, stats, score

import { NextResponse } from "next/server";
import { extractWalletFeatures, generateMockFeatures } from "@/lib/onchain";
import { classifyWallet, classifyFromHash, ARCHETYPES } from "@/lib/archetypes";
import { generateStory, generateHeadline, buildWalletStats } from "@/lib/stories";
import { cacheWallet, getCachedWallet, logSearch, addToLeaderboard, upsertGameProfile, getGameProfile } from "@/lib/db";
import { getRewardForArchetype } from "@/lib/gamedata";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address. Must be 0x followed by 40 hex characters." },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const cached = getCachedWallet(address);
    if (cached) {
      // Still update game profile on cached searches
      updateGameProfile(cached.archetype);
      return NextResponse.json({ ...cached, cached: true });
    }

    // Try real on-chain data, fall back to mock
    let features = await extractWalletFeatures(address);
    let dataSource = "live";

    if (!features) {
      features = generateMockFeatures(address);
      dataSource = "mock";
    }

    // Classify — use feature-based classification for both live and mock data
    // so the archetype matches the actual features used in story generation.
    // Fall back to hash-based classification only if no rules match.
    let classification = classifyWallet(features);
    if (classification.primary === "Fresh Wallet" && classification.confidence === 50 && dataSource === "mock") {
      // No rules matched with mock features — use deterministic hash fallback
      classification = classifyFromHash(address);
    }

    const { primary, secondaryTraits, confidence } = classification;

    // Generate story
    const story = generateStory(address, primary, features);

    // Build stats
    const stats = buildWalletStats(address, features);

    // Score (based on total value, tx count, confidence)
    const score = Math.min(
      99,
      Math.floor(
        (confidence * 0.3) +
        (Math.min(features.totalTx, 10000) / 10000 * 30) +
        (Math.min(features.totalValueETH, 100000) / 100000 * 40)
      )
    );

    const result = {
      address,
      archetype: primary,
      secondaryTraits,
      confidence,
      story,
      stats,
      score,
      dataSource,
    };

    // Cache result
    cacheWallet(result);

    // Log search
    logSearch("anonymous", address, primary);

    // Update game profile (increment search count + auto-earn reward)
    updateGameProfile(primary);

    // Generate live headline and add to leaderboard
    const headline = generateHeadline(address, primary, features, score);
    addToLeaderboard({
      address,
      title: headline,
      archetype: primary,
      score,
      stats,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Wallet analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze wallet. Please try again." },
      { status: 500 }
    );
  }
}

// Update the game profile whenever a wallet is searched
function updateGameProfile(archetype) {
  const userId = "anonymous";
  const today = new Date().toISOString().split("T")[0];
  let profile = getGameProfile(userId);

  if (!profile) {
    profile = upsertGameProfile(userId, {});
  }

  // Reset daily counter if new day
  const dailySearches = profile.last_search_date !== today ? 0 : (profile.daily_searches || 0);

  // Auto-generate a reward for each search
  const reward = getRewardForArchetype(archetype);
  const inventory = [...(profile.inventory || []), { ...reward, claimedAt: new Date().toISOString() }];

  // Update resources
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
