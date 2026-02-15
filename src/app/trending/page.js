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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Nav walletAddress={wa} onConnect={() => {}} />

      <main className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔥 Trending</h1>
          <p className="text-gray-400">Discover the most searched wallets and on-chain activity</p>
        </div>

        {/* Navigation to 三国市 */}
        <div className="mb-8 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-4 border border-yellow-500/20">
          <Link 
            href="/market"
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <div className="font-semibold group-hover:text-yellow-400 transition-colors">
                  三国市 - Archetype Marketplace
                </div>
                <div className="text-sm text-gray-400">
                  Trade wallets, artifacts, and faction bonds
                </div>
              </div>
            </div>
            <span className="text-yellow-400">→</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* Most Searched Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🔍</span> Most Searched
          </h2>
          
          {loading && mostSearched.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl">
              <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-400 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading trending wallets...</p>
            </div>
          ) : mostSearched.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-400 mb-2">No wallets searched yet</p>
              <p className="text-sm text-gray-500">
                Search for a wallet on the home page to see it appear here
              </p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="p-4 text-left text-sm text-gray-400 font-medium">Rank</th>
                    <th className="p-4 text-left text-sm text-gray-400 font-medium">Wallet</th>
                    <th className="p-4 text-left text-sm text-gray-400 font-medium">Searches</th>
                    <th className="p-4 text-left text-sm text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mostSearched.map((item, i) => (
                    <tr 
                      key={item.address} 
                      className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className={`font-bold ${
                          i === 0 ? "text-yellow-400" : 
                          i === 1 ? "text-gray-300" : 
                          i === 2 ? "text-amber-600" : "text-gray-500"
                        }`}>
                          #{i + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link 
                          href={`/wallet?address=${item.address}`}
                          className="font-mono hover:text-blue-400 transition-colors"
                        >
                          {formatAddress(item.address)}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="text-blue-400 font-semibold">
                          {item.count || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link 
                          href={`/wallet?address=${item.address}`}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* On-chain Moves Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>⛓️</span> On-chain Moves
          </h2>
          
          {loading && onChainMoves.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl">
              <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-green-400 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading on-chain activity...</p>
            </div>
          ) : onChainMoves.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-400 mb-2">Data temporarily unavailable</p>
              <p className="text-sm text-gray-500">
                Check back later for on-chain activity insights
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {onChainMoves.map((move, i) => (
                <div 
                  key={i} 
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-green-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏃</span>
                      <div>
                        <div className="font-mono text-sm text-green-400">
                          {formatAddress(move.wallet)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {move.chain} • {move.source}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{formatTime(move.timestamp)}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-300">
                    {move.reason}
                  </div>
                  {move.url && (
                    <a 
                      href={move.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-blue-400 hover:text-blue-300"
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
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>Data refreshes automatically every 30 seconds</p>
          <p className="mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </main>
      <BuildStamp />
    </div>
  );
}
