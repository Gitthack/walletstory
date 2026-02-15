// Trending Page - Shows Most Searched wallets and On-chain Moves
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import BuildStamp from "@/components/BuildStamp";

export default function TrendingPage() {
  const [mostSearched, setMostSearched] = useState([]);
  const [onChainMoves, setOnChainMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wa, setWa] = useState(null);

  useEffect(() => {
    fetchTrendingData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTrendingData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrendingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/trending?type=all&limit=20");
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMostSearched(data.mostSearched || []);
        setOnChainMoves(data.onChainMoves || []);
      }
    } catch (err) {
      setError("Failed to load trending data");
      console.error("Trending fetch error:", err);
    }
    
    setLoading(false);
  };

  const formatAddress = (addr) => {
    if (!addr) return "Unknown";
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Recently";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[--bg-primary] text-[--text-primary]">
      <Nav walletAddress={wa} onConnect={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">🔥 Trending</h1>
          <p className="text-[--text-secondary] text-sm sm:text-base">Discover the most searched wallets and on-chain activity</p>
        </div>

        {/* Navigation to 三国市 */}
        <div className="mb-6 sm:mb-8 bg-[rgba(245,158,11,0.06)] rounded-xl p-4 border border-[rgba(245,158,11,0.15)]">
          <Link
            href="/market"
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <div className="font-semibold group-hover:text-[--accent] transition-colors text-sm sm:text-base">
                  三国市 - Archetype Marketplace
                </div>
                <div className="text-xs sm:text-sm text-[--text-muted]">
                  Trade wallets, artifacts, and faction bonds
                </div>
              </div>
            </div>
            <span className="text-[--accent]">→</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg p-4">
            <p className="text-[--red]">⚠️ {error}</p>
          </div>
        )}

        {/* Most Searched Section */}
        <section className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🔍</span> Most Searched
          </h2>

          {loading && mostSearched.length === 0 ? (
            <div className="text-center py-12 bg-[--bg-card] border border-[--border] rounded-xl">
              <div className="animate-spin w-8 h-8 border-2 border-[--border] border-t-[--accent] rounded-full mx-auto mb-4"></div>
              <p className="text-[--text-muted]">Loading trending wallets...</p>
            </div>
          ) : mostSearched.length === 0 ? (
            <div className="text-center py-12 bg-[--bg-card] border border-[--border] rounded-xl">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-[--text-secondary] mb-2">No wallets searched yet</p>
              <p className="text-sm text-[--text-muted]">
                Search for a wallet on the home page to see it appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mostSearched.map((item, i) => (
                <Link
                  key={item.address}
                  href={`/wallet?address=${item.address}`}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[--bg-card] border border-[--border] rounded-xl hover:border-[--accent]/30 transition-all"
                >
                  <span className={`font-bold text-base sm:text-lg min-w-[32px] text-center ${
                    i === 0 ? "text-[--amber]" :
                    i === 1 ? "text-[--text-secondary]" :
                    i === 2 ? "text-amber-700" : "text-[--text-muted]"
                  }`}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm hover:text-[--accent] transition-colors block truncate">
                      {formatAddress(item.address)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-[--accent] font-semibold font-mono text-sm">
                      {item.count || 0} <span className="text-[--text-muted] text-xs hidden sm:inline">searches</span>
                    </span>
                    <span className="text-[--accent] text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* On-chain Moves Section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <span>⛓️</span> On-chain Moves
          </h2>

          {loading && onChainMoves.length === 0 ? (
            <div className="text-center py-12 bg-[--bg-card] border border-[--border] rounded-xl">
              <div className="animate-spin w-8 h-8 border-2 border-[--border] border-t-[--green] rounded-full mx-auto mb-4"></div>
              <p className="text-[--text-muted]">Loading on-chain activity...</p>
            </div>
          ) : onChainMoves.length === 0 ? (
            <div className="text-center py-12 bg-[--bg-card] border border-[--border] rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-[--text-secondary] mb-2">Data temporarily unavailable</p>
              <p className="text-sm text-[--text-muted]">
                Check back later for on-chain activity insights
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {onChainMoves.map((move, i) => (
                <div
                  key={i}
                  className="bg-[--bg-card] rounded-xl p-4 border border-[--border] hover:border-[rgba(16,185,129,0.3)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl sm:text-2xl shrink-0">🏃</span>
                      <div className="min-w-0">
                        <div className="font-mono text-sm text-[--green] truncate">
                          {formatAddress(move.wallet)}
                        </div>
                        <div className="text-xs text-[--text-muted] mt-1">
                          {move.chain} • {move.source}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-[--text-muted]">{formatTime(move.timestamp)}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-[--text-secondary]">
                    {move.reason}
                  </div>
                  {move.url && (
                    <a
                      href={move.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-[--accent] hover:brightness-125"
                    >
                      View on {move.source} →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer Note */}
        <div className="mt-10 text-center text-sm text-[--text-muted]">
          <p>Data refreshes automatically every 30 seconds</p>
          <p className="mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </main>
      <BuildStamp />
    </div>
  );
}
