// Trending Page - Shows Most Searched wallets and On-chain Moves
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import BuildStamp from "@/components/BuildStamp";
import { connectWallet } from "@/lib/web3";

export default function TrendingPage() {
  const [mostSearched, setMostSearched] = useState([]);
  const [onChainMoves, setOnChainMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wa, setWa] = useState(null);

  const handleConnect = async () => {
    try { const { address } = await connectWallet(); setWa(address); } catch {}
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum?.selectedAddress) handleConnect();
  }, []);

  useEffect(() => {
    fetchTrendingData();
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

  const rankStyle = (i) => {
    if (i === 0) return { color: "#FFD700", textShadow: "0 0 8px rgba(255,215,0,0.4)" };
    if (i === 1) return { color: "#C0C0C0", textShadow: "0 0 6px rgba(192,192,192,0.3)" };
    if (i === 2) return { color: "#CD7F32", textShadow: "0 0 6px rgba(205,127,50,0.3)" };
    return {};
  };

  return (
    <div className="min-h-screen">
      <Nav walletAddress={wa} onConnect={handleConnect} />

      <main className="max-w-[960px] mx-auto px-5 pb-20">
        {/* Hero */}
        <div className="text-center pt-12 sm:pt-16 pb-8 fade-in">
          <h1 className="text-[32px] sm:text-[42px] font-bold tracking-tight leading-[1.1] mb-3">
            What&apos;s <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-[--accent] bg-clip-text text-transparent">trending</span>
          </h1>
          <p className="text-[--text-secondary] text-sm sm:text-base max-w-[500px] mx-auto leading-relaxed">
            Most searched wallets and real-time on-chain moves
          </p>

          {/* Live stats */}
          <div className="flex justify-center gap-6 mt-5 text-xs font-mono">
            <span className="text-[--text-muted]">
              <span className="text-[--accent] font-bold">{mostSearched.length}</span> wallets tracked
            </span>
            <span className="text-[--text-muted]">
              <span className="text-[--green] font-bold">{onChainMoves.length}</span> on-chain moves
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] rounded-lg text-sm text-[--red] fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Marketplace CTA */}
        <Link
          href="/market"
          className="flex items-center gap-3 px-4 py-3 bg-[--bg-card] rounded-lg transition-all hover:bg-[--bg-elevated] hover:border-[--accent]/20 border border-[--border] mb-8 fade-in-up group"
        >
          <span className="text-lg">⚔️</span>
          <span className="flex-1 text-sm font-medium">三国市 — Archetype Marketplace</span>
          <span className="text-[--text-muted] text-xs">Trade archetypes</span>
          <span className="text-[--accent] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>

        {/* Most Searched */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Most Searched</h2>
          <span className="text-orange-400 text-xs font-medium animate-pulse">● LIVE</span>
        </div>

        {loading && mostSearched.length === 0 ? (
          <div className="text-center py-16 fade-in">
            <div className="inline-block w-8 h-8 border-2 border-[--text-muted] border-t-[--accent] rounded-full animate-spin mb-4" />
            <p className="text-[--text-secondary] text-sm">Loading trending wallets...</p>
          </div>
        ) : mostSearched.length === 0 ? (
          <div className="text-center py-12 bg-[--bg-card] rounded-lg border border-[--border] fade-in">
            <p className="text-[--text-secondary] mb-1">No wallets searched yet</p>
            <p className="text-sm text-[--text-muted]">Search on the home page to see them here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 mb-2">
            {mostSearched.map((item, i) => (
              <Link
                key={item.address}
                href={`/wallet?address=${item.address}`}
                className="flex items-center gap-3 px-4 py-3 bg-[--bg-card] rounded-lg transition-colors hover:bg-[--bg-elevated] fade-in-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                <span
                  className="font-mono font-bold text-[13px] min-w-[28px] text-center"
                  style={rankStyle(i)}
                >
                  #{i + 1}
                </span>
                <span className="font-mono text-sm font-semibold flex-1 min-w-0 truncate">
                  {formatAddress(item.address)}
                </span>
                <span className="bg-[--accent-dim] text-[--accent] px-2.5 py-0.5 rounded-md font-mono text-[13px] font-bold">
                  {item.count || 0}
                </span>
                <span className="text-[--text-muted] text-xs whitespace-nowrap hidden sm:inline">searches</span>
              </Link>
            ))}
          </div>
        )}

        {/* On-chain Moves */}
        <div className="flex items-center justify-between mt-10 mb-4">
          <h2 className="text-xl font-semibold tracking-tight">On-chain Moves</h2>
          <span className="text-[--green] text-xs font-medium animate-pulse">● LIVE</span>
        </div>

        {loading && onChainMoves.length === 0 ? (
          <div className="text-center py-16 fade-in">
            <div className="inline-block w-8 h-8 border-2 border-[--text-muted] border-t-[--green] rounded-full animate-spin mb-4" />
            <p className="text-[--text-secondary] text-sm">Loading on-chain activity...</p>
          </div>
        ) : onChainMoves.length === 0 ? (
          <div className="text-center py-12 bg-[--bg-card] rounded-lg border border-[--border] fade-in">
            <p className="text-[--text-secondary] mb-1">Data temporarily unavailable</p>
            <p className="text-sm text-[--text-muted]">Check back later for on-chain activity insights</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {onChainMoves.map((move, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 bg-[--bg-card] rounded-lg transition-colors hover:bg-[--bg-elevated] fade-in-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                <span className="text-lg shrink-0">🏃</span>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-sm font-semibold text-[--green]">
                    {formatAddress(move.wallet)}
                  </span>
                  <span className="text-[--text-muted] text-xs ml-2 hidden sm:inline">{move.chain} · {move.source}</span>
                </div>
                <span className="text-[--text-muted] text-xs whitespace-nowrap">{formatTime(move.timestamp)}</span>
                {move.url && (
                  <a
                    href={move.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[--accent] text-xs hover:brightness-125 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex justify-center gap-6 text-xs font-mono text-[--text-muted]">
          <span>Auto-refreshes every 30s</span>
          <span>Updated {new Date().toLocaleTimeString()}</span>
        </div>
      </main>
      <BuildStamp />
    </div>
  );
}
