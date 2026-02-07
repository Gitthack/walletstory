'use client';

import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Link from 'next/link';
import { ARCHETYPES } from '@/lib/archetypes';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('score');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?type=${tab}&limit=20`)
      .then((res) => res.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Nav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>🏆 Leaderboard</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Top analyzed wallets ranked by score.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'score', label: '🏅 By Score' },
            { key: 'searched', label: '🔍 Most Searched' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">🏆</div>
            <div style={{ color: 'var(--text-secondary)' }}>Loading leaderboard...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📭</div>
            <div style={{ color: 'var(--text-secondary)' }}>No entries yet. Analyze some wallets to populate the leaderboard!</div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const archetype = ARCHETYPES[entry.archetype] || ARCHETYPES.FreshWallet;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <Link href={`/wallet?address=${entry.address}`} key={entry.address || i}>
                  <div className="card flex items-center gap-4 cursor-pointer">
                    <div className="text-2xl w-10 text-center">
                      {i < 3 ? medals[i] : <span className="text-sm mono" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mono text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {entry.address}
                      </div>
                      {entry.label && (
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.label}</div>
                      )}
                    </div>
                    {tab === 'score' && archetype && (
                      <span className="text-lg">{archetype.icon}</span>
                    )}
                    <div className="text-right">
                      <div className="text-lg font-bold mono" style={{ color: 'var(--accent-gold)' }}>
                        {tab === 'score' ? entry.score : entry.count}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {tab === 'score' ? 'score' : 'searches'}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
