// 三国市 - Three Kingdoms Marketplace for Trading Archetypes
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import BuildStamp from "@/components/BuildStamp";

const ARCHETYPES = [
  { id: "smart_money", name: "Smart Money", price: 500, rarity: "legendary", icon: "💰" },
  { id: "early_airdrop", name: "Early Airdrop Farmer", price: 300, rarity: "epic", icon: "🪂" },
  { id: "defi_yield", name: "DeFi Yield Farmer", price: 250, rarity: "epic", icon: "🌾" },
  { id: "nft_flipper", name: "NFT Flipper", price: 200, rarity: "rare", icon: "🖼️" },
  { id: "long_holder", name: "Long-term Holder", price: 180, rarity: "rare", icon: "📦" },
  { id: "degen_trader", name: "Degen Trader", price: 150, rarity: "rare", icon: "🎲" },
  { id: "liquidity_provider", name: "Liquidity Provider", price: 120, rarity: "common", icon: "💧" },
  { id: "fresh_wallet", name: "Fresh Wallet", price: 50, rarity: "common", icon: "🥚" },
  { id: "exit_liquidity", name: "Exit Liquidity", price: 100, rarity: "common", icon: "🚪" },
  { id: "bot_like", name: "Bot-like Behavior", price: 80, rarity: "common", icon: "🤖" },
];

const FACTIONS = [
  { id: "wei", name: "魏 Wei", color: "blue", icon: "🐉" },
  { id: "shu", name: "蜀 Shu", color: "red", icon: "🦁" },
  { id: "wu", name: "吴 Wu", color: "green", icon: "🐅" },
];

const rarityConfig = {
  common:    { gradient: "from-gray-500 to-gray-600",    dot: "#9CA3AF", bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.15)" },
  rare:      { gradient: "from-blue-500 to-blue-600",    dot: "#3B82F6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.15)" },
  epic:      { gradient: "from-purple-500 to-purple-600", dot: "#A855F7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.15)" },
  legendary: { gradient: "from-amber-400 to-orange-500",  dot: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
};

export default function MarketPage() {
  const [listings, setListings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("buy");
  const [filterFaction, setFilterFaction] = useState("all");
  const [filterRarity, setFilterRarity] = useState("all");
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    fetchData();
  }, [walletAddress]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const listingsRes = await fetch("/api/marketplace?type=wallet_analysis");
      const listingsData = await listingsRes.json();
      setListings(listingsData.listings || []);

      if (walletAddress) {
        const profileRes = await fetch("/api/game?action=get_profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: walletAddress }),
        });
        const profileData = await profileRes.json();
        setInventory(profileData.inventory || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    }
  };

  const listForSale = async (archetype, price) => {
    if (!walletAddress) { alert("Please connect wallet first"); return; }
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "list", type: "wallet_analysis", name: archetype.name,
          description: `${archetype.rarity} archetype - ${archetype.name}`,
          price, seller: walletAddress, rarity: archetype.rarity,
        }),
      });
      if (res.ok) { alert("Listed successfully!"); fetchData(); }
    } catch (error) { console.error("Failed to list:", error); }
  };

  const buyListing = async (listing) => {
    if (!walletAddress) { alert("Please connect wallet first"); return; }
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "buy", listingId: listing.id, buyer: walletAddress }),
      });
      if (res.ok) { alert("Purchase successful!"); fetchData(); }
      else { const data = await res.json(); alert(data.error || "Purchase failed"); }
    } catch (error) { console.error("Failed to buy:", error); }
  };

  const filteredListings = listings.filter((l) => {
    if (filterFaction !== "all" && l.faction !== filterFaction) return false;
    if (filterRarity !== "all" && l.rarity !== filterRarity) return false;
    return true;
  });

  const tabItems = [
    { id: "buy", label: "Buy", count: filteredListings.length },
    { id: "sell", label: "Sell", count: ARCHETYPES.length },
    { id: "inventory", label: "Inventory", count: inventory.length },
  ];

  return (
    <div className="min-h-screen">
      <Nav walletAddress={walletAddress} onConnect={handleConnect} />

      <main className="max-w-[960px] mx-auto px-5 pb-20">
        {/* Hero */}
        <div className="text-center pt-12 sm:pt-16 pb-8 fade-in">
          <h1 className="text-[32px] sm:text-[42px] font-bold tracking-tight leading-[1.1] mb-3">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">三国市</span>
          </h1>
          <p className="text-[--text-secondary] text-sm sm:text-base max-w-[500px] mx-auto leading-relaxed">
            Trade wallet archetypes with other warlords
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-5 text-xs font-mono">
            <span className="text-[--text-muted]">
              <span className="text-[--accent] font-bold">{listings.length}</span> listings
            </span>
            <span className="text-[--text-muted]">
              <span className="text-[--green] font-bold">{inventory.length}</span> in inventory
            </span>
            <span className="text-[--text-muted]">
              <span className="text-[--amber] font-bold">{ARCHETYPES.length}</span> archetypes
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-[--bg-card] rounded-lg p-1 border border-[--border] w-fit">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 sm:px-5 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTab === tab.id
                  ? "bg-[--accent] text-[--bg-primary]"
                  : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated]"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 font-mono text-[11px] ${
                selectedTab === tab.id ? "opacity-70" : "text-[--text-muted]"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters (buy tab only) */}
        {selectedTab === "buy" && (
          <div className="flex flex-wrap items-center gap-2 mb-5 fade-in">
            <span className="text-[--text-muted] text-xs font-medium mr-1">Filter:</span>
            <select
              value={filterFaction}
              onChange={(e) => setFilterFaction(e.target.value)}
              className="px-3 py-1.5 bg-[--bg-card] border border-[--border] rounded-md text-sm text-[--text-primary] focus:border-[--accent] outline-none transition-colors"
            >
              <option value="all">All Factions</option>
              {FACTIONS.map((f) => (
                <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
              ))}
            </select>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-1.5 bg-[--bg-card] border border-[--border] rounded-md text-sm text-[--text-primary] focus:border-[--accent] outline-none transition-colors"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 fade-in">
            <div className="inline-block w-8 h-8 border-2 border-[--text-muted] border-t-[--accent] rounded-full animate-spin mb-4" />
            <p className="text-[--text-secondary] text-sm">Loading marketplace...</p>
          </div>
        ) : (
          <>
            {/* ── Buy Tab ── */}
            {selectedTab === "buy" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold tracking-tight">Listings</h2>
                  <span className="text-[--amber] text-xs font-medium animate-pulse">● LIVE</span>
                </div>

                {filteredListings.length === 0 ? (
                  <div className="text-center py-12 bg-[--bg-card] rounded-lg border border-[--border] fade-in">
                    <p className="text-[--text-secondary] mb-1">No listings found</p>
                    <p className="text-sm text-[--text-muted]">Be the first to list an archetype!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {filteredListings.map((listing, i) => {
                      const rc = rarityConfig[listing.rarity] || rarityConfig.common;
                      return (
                        <div
                          key={listing.id}
                          className="flex items-center gap-3 px-4 py-3 bg-[--bg-card] rounded-lg transition-colors hover:bg-[--bg-elevated] fade-in-up"
                          style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: rc.dot, boxShadow: `0 0 6px ${rc.dot}40` }}
                          />
                          <span className="text-sm font-medium flex-1 min-w-0 truncate">{listing.name}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                            style={{ background: rc.bg, color: rc.dot, border: `1px solid ${rc.border}` }}
                          >
                            {listing.rarity}
                          </span>
                          <span className="font-mono text-[13px] font-bold text-[--amber] min-w-[70px] text-right">
                            {listing.price} <span className="text-[11px] text-[--text-muted]">GOLD</span>
                          </span>
                          <button
                            onClick={() => buyListing(listing)}
                            className="px-3 py-1.5 bg-[--accent-dim] text-[--accent] rounded-md text-xs font-semibold hover:bg-[--accent] hover:text-[--bg-primary] transition-all shrink-0"
                          >
                            Buy
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── Sell Tab ── */}
            {selectedTab === "sell" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold tracking-tight">List Archetypes</h2>
                </div>
                <p className="text-[--text-secondary] text-sm mb-5">
                  Select an archetype to list for sale on the marketplace.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ARCHETYPES.map((archetype, i) => {
                    const rc = rarityConfig[archetype.rarity] || rarityConfig.common;
                    return (
                      <div
                        key={archetype.id}
                        className="flex items-center gap-3 px-4 py-3 bg-[--bg-card] rounded-lg transition-colors hover:bg-[--bg-elevated] fade-in-up group"
                        style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                      >
                        <span className="text-xl shrink-0">{archetype.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium block truncate">{archetype.name}</span>
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: rc.dot }}
                          >
                            {archetype.rarity}
                          </span>
                        </div>
                        <span className="font-mono text-[13px] font-bold text-[--amber]">{archetype.price}</span>
                        <button
                          onClick={() => listForSale(archetype, archetype.price)}
                          className="px-3 py-1.5 bg-[--bg-elevated] border border-[--border] rounded-md text-xs font-medium text-[--text-secondary] hover:bg-[--accent] hover:text-[--bg-primary] hover:border-[--accent] transition-all shrink-0"
                        >
                          List
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Inventory Tab ── */}
            {selectedTab === "inventory" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold tracking-tight">Your Inventory</h2>
                  {inventory.length > 0 && (
                    <span className="text-[--text-muted] text-xs font-mono">{inventory.length} items</span>
                  )}
                </div>

                {inventory.length === 0 ? (
                  <div className="text-center py-16 bg-[--bg-card] rounded-lg border border-[--border] fade-in">
                    <p className="text-[--text-secondary] mb-2">Your inventory is empty</p>
                    <p className="text-sm text-[--text-muted] mb-5">Search wallets to earn archetype rewards</p>
                    <Link
                      href="/"
                      className="inline-block px-5 py-2.5 bg-[--accent] text-[--bg-primary] rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
                    >
                      Start Searching
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {inventory.map((item, i) => {
                      const archetype = ARCHETYPES.find((a) => a.name === item.name);
                      const rc = rarityConfig[item.rarity] || rarityConfig.common;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-4 py-3 bg-[--bg-card] rounded-lg transition-colors hover:bg-[--bg-elevated] fade-in-up"
                          style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                        >
                          <span className="text-xl shrink-0">{archetype?.icon || "📦"}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate">{item.name}</span>
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wider"
                              style={{ color: rc.dot }}
                            >
                              {item.rarity} · Qty {item.quantity || 1}
                            </span>
                          </div>
                          <button
                            onClick={() => archetype && listForSale(archetype, archetype.price)}
                            className="px-3 py-1.5 bg-[--bg-elevated] border border-[--border] rounded-md text-xs font-medium text-[--text-secondary] hover:bg-[--accent] hover:text-[--bg-primary] hover:border-[--accent] transition-all shrink-0"
                          >
                            Sell
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Faction legend */}
        <div className="mt-10 flex justify-center gap-5 text-xs font-mono text-[--text-muted]">
          {FACTIONS.map((f) => (
            <span key={f.id} className="flex items-center gap-1.5">
              <span>{f.icon}</span> {f.name}
            </span>
          ))}
        </div>
      </main>
      <BuildStamp />
    </div>
  );
}
