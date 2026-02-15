"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import { connectWallet } from "@/lib/web3";
import ThreeKingdomsMap from "@/components/ThreeKingdomsMap";
import {
  FactionBanner,
  RankProgress,
  ResourceBar,
  InventoryGrid,
  RewardPopup,
} from "@/components/GameWidgets";
import BuildStamp from "@/components/BuildStamp";

export default function GameFiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[--text-muted] border-t-[--accent] rounded-full animate-spin" /></div>}>
      <GameFiContent />
    </Suspense>
  );
}

function GameFiContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "map";
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState(null);
  const [wa, setWa] = useState(null);
  const [marketplace, setMarketplace] = useState([]);
  const [marketplaceStats, setMarketplaceStats] = useState(null);

  const handleConnect = useCallback(async () => {
    try {
      const { address } = await connectWallet();
      setWa(address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum?.selectedAddress) {
      handleConnect();
    }
  }, [handleConnect]);

  // Load profile on mount
  useEffect(() => {
    fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_profile" }),
    })
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setProfile({
          faction: "neutral",
          rank: 100,
          total_searches: 0,
          daily_searches: 0,
          inventory: [],
          territory: [],
          resources: { gold: 100, food: 200, wood: 100, iron: 50 },
          rankTitle: "Commoner",
        });
        setLoading(false);
      });
  }, []);

  // Load marketplace data when tab is active
  useEffect(() => {
    if (activeTab === "marketplace") {
      fetch("/api/marketplace")
        .then((r) => r.json())
        .then((data) => {
          setMarketplace(data.listings);
          setMarketplaceStats(data.stats);
        });
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Nav walletAddress={wa} onConnect={handleConnect} />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[--text-muted] border-t-[--accent] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const inventory = profile?.inventory || [];
  const resources = profile?.resources || { gold: 100, food: 200, wood: 100, iron: 50 };
  const totalSearches = profile?.total_searches || 0;
  const dailySearches = profile?.daily_searches || 0;
  const faction = profile?.faction || "neutral";
  const ownedTiles = profile?.territory || [];

  const tabs = [
    { id: "map", label: "🗺️ Map" },
    { id: "inventory", label: "🎒 Inventory" },
    { id: "market", label: "🏪 三国市", href: "/market" },
  ];

  return (
    <div className="min-h-screen">
      <Nav walletAddress={wa} onConnect={handleConnect} />

      <main className="max-w-[960px] mx-auto px-5 pb-20">
        {/* Page Header */}
        <div className="text-center pt-8 pb-6 fade-in">
          <h1
            className="text-4xl mb-1"
            style={{
              fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
              background: "linear-gradient(135deg, #C4A96A, #F59E0B, #C4A96A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            三国志 · 链上天下
          </h1>
          <p className="text-[--text-secondary] text-sm">
            Three Kingdoms: On-Chain Realm — Search wallets, conquer territories
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            tab.href ? (
              <a
                key={tab.id}
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-[--accent] bg-[--accent-dim]"
                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated]"
                }`}
              >
                {tab.label}
              </a>
            ) : (
              <a
                key={tab.id}
                href={`/gamefi?tab=${tab.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-[--accent] bg-[--accent-dim]"
                    : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated]"
                }`}
              >
                {tab.label}
              </a>
            )
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === "map" && (
          <>
            {/* Game Stats Bar */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center fade-in-up stagger-1">
                <div className="font-mono text-2xl font-bold text-[--accent]">{totalSearches}</div>
                <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">Total Searches</div>
              </div>
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center fade-in-up stagger-2">
                <div className="font-mono text-2xl font-bold text-[--accent]">{inventory.length}</div>
                <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">Items Collected</div>
              </div>
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center fade-in-up stagger-3">
                <div className="font-mono text-2xl font-bold text-[--accent]">{Math.min(dailySearches, 10)}/10</div>
                <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">Daily Cap</div>
              </div>
            </div>

            {/* Faction & Rank Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="fade-in-up stagger-2">
                <FactionBanner faction={faction} />
              </div>
              <div className="fade-in-up stagger-3">
                <RankProgress totalSearches={totalSearches} />
              </div>
            </div>

            {/* Resources */}
            <div className="mb-6 fade-in-up stagger-3">
              <ResourceBar resources={resources} />
            </div>

            {/* Territory Map */}
            <div className="mb-6 fade-in-up stagger-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold tracking-tight">Territory Map</h2>
                <span className="text-xs text-[--text-muted]">Claim tiles by analyzing wallets</span>
              </div>
              <ThreeKingdomsMap
                ownedTiles={ownedTiles}
                onTileClick={(tile) => setSelectedTile(tile)}
              />
            </div>

            {/* Tile Info */}
            {selectedTile && (
              <div className="tk-parchment tk-border rounded-xl p-4 mb-6 fade-in">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <div className="tk-title text-lg">{selectedTile.tile.label || "Unclaimed Territory"}</div>
                    <div className="tk-text text-sm opacity-60 capitalize">{selectedTile.tile.type} tile</div>
                  </div>
                  <button
                    onClick={() => setSelectedTile(null)}
                    className="tk-text text-sm opacity-50 hover:opacity-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "inventory" && (
          <>
            {/* Inventory Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center fade-in-up stagger-1">
                <div className="font-mono text-2xl font-bold text-[--accent]">{inventory.length}</div>
                <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">Total Items</div>
              </div>
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center fade-in-up stagger-2">
                <div className="font-mono text-2xl font-bold text-[--accent]">
                  {inventory.reduce((sum, item) => sum + (item.rarity === "legendary" ? 1 : 0), 0)}
                </div>
                <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">Legendary Items</div>
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="mb-6 fade-in-up stagger-3">
              <h2 className="text-lg font-semibold tracking-tight mb-3">Inventory</h2>
              <InventoryGrid inventory={inventory} />
            </div>
          </>
        )}

        {activeTab === "marketplace" && (
          <>
            {/* Marketplace Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center fade-in-up stagger-1">
                <div className="font-mono text-2xl font-bold text-[--accent]">{marketplaceStats?.activeListings || 0}</div>
                <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">Active Listings</div>
              </div>
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center fade-in-up stagger-2">
                <div className="font-mono text-2xl font-bold text-[--accent]">{marketplaceStats?.totalSold || 0}</div>
                <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">Items Sold</div>
              </div>
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center fade-in-up stagger-3">
                <div className="font-mono text-2xl font-bold text-[--accent]">{marketplaceStats?.totalVolume || 0}</div>
                <div className="text-[11px] text-[--text-muted] uppercase tracking-wider mt-1">Total Volume</div>
              </div>
            </div>

            {/* Archetype Trading Link */}
            <div className="mb-6 fade-in-up stagger-4">
              <a href="/market" className="block bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🏪</span>
                    <div>
                      <div className="font-semibold text-lg text-yellow-400">三国市 - Archetype Marketplace</div>
                      <div className="text-sm text-gray-400">Buy and sell wallet archetypes with other warlords</div>
                    </div>
                  </div>
                  <span className="text-yellow-400">→</span>
                </div>
              </a>
            </div>
          </>
        )}

        {/* How to Play */}
        {activeTab === "map" && (
          <div className="bg-[--bg-card] border border-[--border] rounded-xl p-6 fade-in-up stagger-6">
            <h3 className="text-base font-semibold mb-3">How to Play</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[--text-secondary]">
              <div>
                <div className="text-[--accent] font-mono font-bold mb-1">01</div>
                <div className="font-medium text-[--text-primary] mb-1">Search Wallets</div>
                <div>Each wallet analysis grants one reward based on the wallet&apos;s archetype.</div>
              </div>
              <div>
                <div className="text-[--accent] font-mono font-bold mb-1">02</div>
                <div className="font-medium text-[--text-primary] mb-1">Collect Items</div>
                <div>Smart Money wallets yield Generals. DeFi farmers give Farmland. Rare archetypes give legendary items.</div>
              </div>
              <div>
                <div className="text-[--accent] font-mono font-bold mb-1">03</div>
                <div className="font-medium text-[--text-primary] mb-1">Rise in Rank</div>
                <div>From Commoner to Emperor — your rank grows with every search. 10 searches per day max.</div>
              </div>
            </div>
          </div>
        )}
      </main>
      <BuildStamp />
    </div>
  );
}
