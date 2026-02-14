export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function GET() {
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown';
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
  const env = process.env.VERCEL_ENV || 'development';
  
  return NextResponse.json({
    status: 'ok',
    commit: commit.slice(0, 7),
    commitFull: commit,
    buildTime: buildTime,
    now: new Date().toISOString(),
    env: env,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
}
