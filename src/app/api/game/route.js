import { NextResponse } from 'next/server';
import { getGameProfile, upsertGameProfile } from '@/lib/db';
import { ARCHETYPES } from '@/lib/archetypes';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, address, data } = body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid address.' }, { status: 400 });
    }

    switch (action) {
      case 'getProfile': {
        const profile = getGameProfile(address);
        return NextResponse.json({ profile: profile || { rewards: [], totalPower: 0, faction: 'Neutral' } });
      }

      case 'claimReward': {
        if (!data?.rewardName || data.rarity === undefined || data.power === undefined) {
          return NextResponse.json({ error: 'Missing reward data.' }, { status: 400 });
        }
        const profile = getGameProfile(address) || { rewards: [], totalPower: 0, faction: 'Neutral' };
        const newReward = {
          name: data.rewardName,
          rarity: data.rarity,
          power: data.power,
          icon: data.icon || '🎁',
          claimedAt: Date.now(),
        };
        profile.rewards.push(newReward);
        profile.totalPower = profile.rewards.reduce((sum, r) => sum + (r.power || 0), 0);
        if (data.faction) profile.faction = data.faction;
        const updated = upsertGameProfile(address, profile);
        return NextResponse.json({ profile: updated, newReward });
      }

      case 'setFaction': {
        if (!data?.faction) {
          return NextResponse.json({ error: 'Missing faction.' }, { status: 400 });
        }
        const updated = upsertGameProfile(address, { faction: data.faction });
        return NextResponse.json({ profile: updated });
      }

      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Game API error:', error);
    return NextResponse.json({ error: 'Game action failed.' }, { status: 500 });
  }
}
