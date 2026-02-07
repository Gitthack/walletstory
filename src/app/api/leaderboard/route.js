import { NextResponse } from 'next/server';
import { getLeaderboard, getTopSearched } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const type = searchParams.get('type') || 'score';

  try {
    if (type === 'searched') {
      const topSearched = getTopSearched(limit);
      return NextResponse.json({ type: 'searched', entries: topSearched });
    }

    const leaderboard = getLeaderboard(limit);
    return NextResponse.json({ type: 'score', entries: leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to load leaderboard.' }, { status: 500 });
  }
}
