// Three Kingdoms Marketplace Page
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [wa, setWa] = useState(null);

  useEffect(() => {
    fetchMarketplaceData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketplaceData, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = filter === "all" 
        ? "/api/marketplace" 
        : `/api/marketplace?type=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setListings(data.listings || []);
        setStats(data.stats);
      }
    } catch (err) {
      setError("Failed to load marketplace");
      console.error("Marketplace fetch error:", err);
    }
    
    setLoading(false);
  };

  const formatAddress = (addr) => {
    if (!addr) return "Unknown";
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const rarityColors = {
    common: "border-gray-500 bg-gray-500/10",
    rare: "border-blue-500 bg-blue-500/10",
    epic: "border-purple-500 bg-purple-500/10",
    legendary: "border-yellow-500 bg-yellow-500/10",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Nav walletAddress={wa} onConnect={() => {}} />

      <main className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span className="text-4xl">⚔️</span>
            Three Kingdoms Marketplace
          </h1>
          <p className="text-gray-400">
            Trade wallets, artifacts, faction bonds, and strategic items
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <Link 
            href="/gamefi?tab=map"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            ← Back to Three Kingdoms
          </Link>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.activeListings || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Active Listings</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalSold || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Items Sold</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalVolume || 0}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Volume (GOLD)</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {stats.averagePrice ? stats.averagePrice.toFixed(0) : 0}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Price</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "wallet_analysis", "faction_bond", "artifact", "strategy_guide"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {type === "all" ? "All Items" : type.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && listings.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl">
            <div className="animate-spin w-12 h-12 border-2 border-gray-600 border-t-yellow-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading marketplace...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl text-gray-300 mb-2">No items listed</p>
            <p className="text-gray-500 mb-6">Be the first to list an item!</p>
            <button className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-medium transition-colors">
              List an Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) => (
              <div 
                key={item.id}
                className={`bg-gray-800/50 border rounded-xl p-4 ${rarityColors[item.rarity] || "border-gray-700"}`}
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="text-xs text-gray-500 capitalize">
                      {item.type.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xl text-yellow-400">
                      {item.price} GOLD
                    </div>
                  </div>
                </div>

                {/* Item Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {item.description || "No description provided"}
                </p>

                {/* Item Details */}
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <span>Seller: {formatAddress(item.seller)}</span>
                  {item.faction && (
                    <span className="capitalize">{item.faction}</span>
                  )}
                </div>

                {/* Bonus */}
                {item.bonus && (
                  <div className="mb-4 px-3 py-2 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="text-xs text-green-400 font-medium">Bonus</div>
                    <div className="text-sm text-green-300">{item.bonus.description}</div>
                  </div>
                )}

                {/* Buy Button */}
                <button className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-medium transition-colors">
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>Three Kingdoms Marketplace • Powered by WalletStory</p>
          <p className="mt-1">Data refreshes automatically</p>
        </div>
      </main>
    </div>
  );
}
