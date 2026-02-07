"use client";

import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import { connectWallet } from "@/lib/web3";
import WalletCard from "@/components/WalletCard";
import { ArchetypeBadge } from "@/components/WalletCard";
import { SAMPLE_STORIES, DAILY_HEADLINES } from "@/data/samples";

export default function LeaderboardPage() {
  const [headlines, setHeadlines] = useState(DAILY_HEADLINES);
  const [wallets, setWallets] = useState(SAMPLE_STORIES);
  const [tab, setTab] = useState("stories");
  const [wa, setWa] = useState(null);
  const handleConnect = useCallback(async () => { try { const { address } = await connectWallet(); setWa(address); } catch {} }, []);
  useEffect(() => { if (typeof window !== "undefined" && window.ethereum?.selectedAddress) handleConnect(); }, [handleConnect]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.headlines) setHeadlines(data.headlines);
        if (data.wallets?.length > 0) setWallets(data.wallets);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Nav walletAddress={wa} onConnect={handleConnect} />
      <main className="max-w-[960px] mx-auto px-5 pb-20 fade-in">
        <div className="flex items-center justify-between mt-8 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Daily Leaderboard</h2>
          <span className="text-[--green] text-xs font-medium animate-pulse">● LIVE</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[--bg-card] p-1 rounded-lg inline-flex">
          {[
            { id: "stories", label: "Top Stories" },
            { id: "wallets", label: "Top Wallets" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-[--accent-dim] text-[--accent]"
                  : "text-[--text-secondary] hover:text-[--text-primary]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Top Stories */}
        {tab === "stories" && (
          <div className="flex flex-col gap-0.5">
            {headlines.map((h, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-4 bg-[--bg-card] rounded-lg transition-colors hover:bg-[--bg-elevated] fade-in-up stagger-${Math.min(i + 1, 6)}`}
              >
                <span className="font-mono text-[--accent] font-bold text-lg min-w-[32px]">
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">{h.title}</div>
                  <div className="flex items-center gap-3">
                    <ArchetypeBadge archetype={h.type} size="sm" />
                    <span className="text-[--text-muted] text-xs">{h.time}</span>
                  </div>
                </div>
                <span className="font-mono text-[--accent-dim] bg-[--accent-dim] px-3 py-1 rounded-md font-bold text-sm text-[--accent]">
                  {h.score}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Top Wallets */}
        {tab === "wallets" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {wallets.map((w, i) => (
              <div key={i} className={`fade-in-up stagger-${Math.min((i % 6) + 1, 6)}`}>
                <WalletCard data={w} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
