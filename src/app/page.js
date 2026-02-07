'use client';

import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import SearchBar from '@/components/SearchBar';
import { WalletCard } from '@/components/WalletCard';
import { ContractLink } from '@/components/TxStatus';
import { SAMPLE_STORIES, DAILY_HEADLINES } from '@/data/samples';
import { ARCHETYPES } from '@/lib/archetypes';

export default function HomePage() {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((i) => (i + 1) % DAILY_HEADLINES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const headline = DAILY_HEADLINES[headlineIndex];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Nav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Every Wallet Has a <span style={{ color: 'var(--accent-gold)' }}>Story</span>
          </h1>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Analyze any blockchain wallet. Discover archetypes, on-chain scores, and AI-generated narratives.
            Powered by BSC smart contracts.
          </p>
          <SearchBar />
          <div className="mt-4">
            <ContractLink />
          </div>
        </div>
      </section>

      {/* Headline Ticker */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div
          className="rounded-xl px-6 py-3 flex items-center gap-3 animate-fade-in"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          key={headlineIndex}
        >
          <span className="text-2xl">{headline.icon}</span>
          <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{headline.text}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,192,64,0.15)', color: 'var(--accent-gold)' }}>
            {headline.tag}
          </span>
        </div>
      </section>

      {/* Featured Wallets */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          🔥 Featured Wallets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_STORIES.slice(0, 6).map((sample) => {
            const archetype = ARCHETYPES[sample.archetype] || ARCHETYPES.FreshWallet;
            return (
              <WalletCard
                key={sample.address}
                address={sample.address}
                archetype={archetype}
                score={sample.score}
                story={sample.story}
                label={sample.label}
              />
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          WalletStory v2.0 — On-Chain Intelligence on BSC Testnet
        </p>
      </footer>
    </div>
  );
}
