// GET /api/wallet?address=0x...
// Returns wallet analysis: archetype, story, stats, score

import { NextResponse } from "next/server";
import { extractWalletFeatures, generateMockFeatures } from "@/lib/onchain";
import { classifyWallet, classifyFromHash, ARCHETYPES } from "@/lib/archetypes";
import { generateStory, buildWalletStats } from "@/lib/stories";
import { cacheWallet, getCachedWallet, logSearch, addToLeaderboard } from "@/lib/db";

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
      return NextResponse.json({ ...cached, cached: true });
    }

    // Try real on-chain data, fall back to mock
    let features = await extractWalletFeatures(address);
    let dataSource = "live";

    if (!features) {
      features = generateMockFeatures(address);
      dataSource = "mock";
    }

    // Classify
    const { primary, secondaryTraits, confidence } =
      dataSource === "live" ? classifyWallet(features) : classifyFromHash(address);

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

    // Add to leaderboard if score > 70
    if (score > 70) {
      addToLeaderboard({
        address,
        title: `${ARCHETYPES[primary]?.chineseName || primary} wallet with score ${score}`,
        archetype: primary,
        score,
        stats,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Wallet analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze wallet. Please try again." },
      { status: 500 }
    );
  }
}
