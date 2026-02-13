// Enhanced Leaderboard Page with Hot Wallets, Daily Trends, and Three Kingdoms Marketplace

"use client";
import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [hotWallets, setHotWallets] = useState([]);
  const [trendingArchetypes, setTrendingArchetypes] = useState([]);
  const [marketplaceStats, setMarketplaceStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("daily");
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch leaderboard
      const lbRes = await fetch(`/api/leaderboard?type=${activeTab}&limit=20`);
      const lbData = await lbRes.json();
      setLeaderboard(lbData.leaderboard || []);
      setMetadata(lbData.metadata || {});
      setTrendingArchetypes(lbData.trendingArchetypes || []);
      setInsights(lbData.hotInsights);

      // Fetch hot wallets
      const hotRes = await fetch("/api/leaderboard?type=hot&limit=10");
      const hotData = await hotRes.json();
      setHotWallets(hotData.leaderboard || []);

      // Fetch marketplace stats
      const mpRes = await fetch("/api/marketplace");
      const mpData = await mpRes.json();
      setMarketplaceStats(mpData.stats);
    } catch (err) {
      console.error("Failed to fetch leaderboard data:", err);
    }
    setLoading(false);
  };

  const tabs = [
    { id: "hot", label: "🔥 Hot Wallets", desc: "Most searched right now" },
    { id: "daily", label: "📅 Daily", desc: "Today's top performers" },
    { id: "weekly", label: "🏆 Weekly", desc: "This week's best" },
    { id: "all-time", label: "👑 All-Time", desc: "Legendary wallets" },
  ];

  const archetypeColors = {
    "Smart Money": "bg-green-500",
    "Early Airdrop Farmer": "bg-yellow-500",
    "DeFi Yield Farmer": "bg-emerald-500",
    "NFT Flipper": "bg-purple-500",
    "Long-term Holder": "bg-blue-500",
    "Degen Trader": "bg-red-500",
    "Liquidity Provider": "bg-cyan-500",
    "Fresh Wallet": "bg-gray-400",
    "Exit Liquidity": "bg-orange-500",
    "Bot-like Behavior": "bg-indigo-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Nav />

      <main className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Wallet Leaderboard</h1>
          <p className="text-gray-400">Discover the most interesting wallets on-chain</p>
        </div>

        {/* Quick Stats */}
        {marketplaceStats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{marketplaceStats.activeListings}</div>
              <div className="text-sm text-gray-400">Active Listings</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{marketplaceStats.totalSold}</div>
              <div className="text-sm text-gray-400">Items Sold</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{marketplaceStats.totalVolume.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Total Volume (GOLD)</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {leaderboard.filter((w) => w.score >= 80).length}
              </div>
              <div className="text-sm text-gray-400">Legendary Wallets</div>
            </div>
          </div>
        )}

        {/* Trending Archetypes */}
        {trendingArchetypes.length > 0 && (
          <div className="mb-8 bg-gray-800/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">📈 Trending Archetypes</h2>
            <div className="flex flex-wrap gap-3">
              {trendingArchetypes.map((item) => (
                <span
                  key={item.archetype}
                  className={`px-3 py-1 rounded-full text-sm ${archetypeColors[item.archetype] || "bg-gray-500"} bg-opacity-20`}
                >
                  {item.archetype}: {item.searchCount} searches (avg score: {item.avgScore})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tab.label}
              <div className="text-xs opacity-70">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* AI Insights */}
        {insights && activeTab === "daily" && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🔮</span> On-Chain Intelligence
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-400 mb-2">🔥 Hot Wallet of the Day</h3>
                <p className="text-sm font-mono text-yellow-300">{insights.hotWallet?.slice(0, 10)}...{insights.hotWallet?.slice(-6)}</p>
                <p className="text-xs text-gray-500 mt-1">Analyzing story...</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-2">📊 Market Pulse</h3>
                <ul className="text-sm space-y-1">
                  {insights.insights?.map((insight, i) => (
                    <li key={i}>• {insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Hot Wallets Sidebar */}
        {activeTab === "hot" && hotWallets.length > 0 && (
          <div className="mb-6 bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>🔥</span> Trending Right Now
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {hotWallets.slice(0, 5).map((wallet, i) => (
                <Link
                  key={wallet.address}
                  href={`/wallet?address=${wallet.address}`}
                  className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-bold">#{i + 1}</span>
                    <span className="text-xs font-mono">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${archetypeColors[wallet.archetype] || "bg-gray-500"}`}></span>
                    <span className="text-xs text-gray-400">{wallet.archetype}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-400">No wallets found yet. Be the first to search!</p>
            <Link href="/" className="text-blue-400 hover:underline mt-2 inline-block">
              Go to Home →
            </Link>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-4 text-left text-sm text-gray-400">Rank</th>
                  <th className="p-4 text-left text-sm text-gray-400">Wallet</th>
                  <th className="p-4 text-left text-sm text-gray-400">Archetype</th>
                  <th className="p-4 text-left text-sm text-gray-400">Score</th>
                  <th className="p-4 text-left text-sm text-gray-400">Key Stats</th>
                  <th className="p-4 text-left text-sm text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={entry.address} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <span className={`text-lg font-bold ${
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-500"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link href={`/wallet?address=${entry.address}`} className="font-mono text-sm hover:text-blue-400 transition-colors">
                        {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                      </Link>
                      {entry.title && (
                        <div className="text-xs text-gray-500 mt-1">{entry.title.slice(0, 40)}...</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        archetypeColors[entry.archetype] || "bg-gray-500"
                      } bg-opacity-20`}>
                        {entry.archetype}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              entry.score >= 80 ? "bg-yellow-400" : entry.score >= 60 ? "bg-green-400" : "bg-blue-400"
                            }`}
                            style={{ width: `${entry.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{entry.score}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {entry.stats?.totalTx ? (
                        <span>{entry.stats.totalTx.toLocaleString()} txs</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/wallet?address=${entry.address}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View Story →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Marketplace Teaser */}
        <div className="mt-8 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">⚔️ Three Kingdoms Marketplace</h2>
              <p className="text-gray-400 text-sm">Trade wallet analyses, faction bonds, and artifacts</p>
            </div>
            <Link
              href="/gamefi?tab=marketplace"
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-medium transition-colors"
            >
              Enter Market →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
