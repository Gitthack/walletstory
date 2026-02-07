'use client';

import { useState } from 'react';
import Link from 'next/link';
import { connectWallet } from '@/lib/web3';

export default function Nav() {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    try {
      const w = await connectWallet();
      setWallet(w);
    } catch (err) {
      alert(err.message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--accent-gold)' }}>
            <span className="text-2xl">📖</span>
            <span>WalletStory</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-white" style={{ color: 'var(--text-secondary)' }}>Home</Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-white" style={{ color: 'var(--text-secondary)' }}>Leaderboard</Link>
            <Link href="/gamefi" className="text-sm font-medium hover:text-white" style={{ color: 'var(--text-secondary)' }}>⚔️ GameFi</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {wallet ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span className="mono text-sm" style={{ color: 'var(--accent-gold)' }}>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {parseFloat(wallet.balance).toFixed(3)} tBNB
              </span>
            </div>
          ) : (
            <button onClick={handleConnect} disabled={connecting} className="btn-primary text-sm">
              {connecting ? '⏳ Connecting...' : '🦊 Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
