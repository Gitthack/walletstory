import { NextResponse } from 'next/server';
import { classifyFromHash, ARCHETYPES, ARCHETYPE_LIST } from '@/lib/archetypes';
import { cacheWallet, getCachedWallet, addToLeaderboard, logSearch } from '@/lib/db';
import { generateStory, buildWalletStats } from '@/lib/stories';
import { generateMockFeatures } from '@/lib/onchain';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address. Provide a valid 0x... Ethereum address.' }, { status: 400 });
  }

  // Check cache
  const cached = getCachedWallet(address);
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true });
  }

  try {
    // Classify wallet
    const archetype = classifyFromHash(address);
    const archetypeKey = Object.keys(ARCHETYPES).find(k => ARCHETYPES[k].id === archetype.id) || 'FreshWallet';

    // Generate story & stats
    const story = generateStory(archetypeKey, address);
    const stats = buildWalletStats(address, archetype);
    const features = generateMockFeatures(address);

    // Deterministic score from address
    const hash = address.toLowerCase().replace('0x', '');
    const score = 20 + (parseInt(hash.slice(0, 4), 16) % 80);

    const result = {
      address,
      archetype: {
        key: archetypeKey,
        ...archetype,
      },
      score,
      story,
      stats,
      features,
      analyzedAt: new Date().toISOString(),
    };

    // Cache & add to leaderboard
    cacheWallet(address, result);
    addToLeaderboard({ address, score, archetype: archetypeKey, label: archetype.label });
    logSearch(address);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Wallet analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
