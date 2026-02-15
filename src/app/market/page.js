// 三国市 - Three Kingdoms Marketplace for Trading Archetypes
"use client";

import { useState, useEffect } from "react";
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

export default function MarketPage() {
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("buy"); // buy, sell, inventory
  const [filterFaction, setFilterFaction] = useState("all");
  const [filterRarity, setFilterRarity] = useState("all");
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    fetchData();
  }, [walletAddress]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch marketplace listings
      const listingsRes = await fetch("/api/marketplace?type=wallet_analysis");
      const listingsData = await listingsRes.json();
      setListings(listingsData.listings || []);

      // Fetch user data if connected
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
    if (!walletAddress) {
      alert("Please connect wallet first");
      return;
    }

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "list",
          type: "wallet_analysis",
          name: archetype.name,
          description: `${archetype.rarity} archetype - ${archetype.name}`,
          price,
          seller: walletAddress,
          rarity: archetype.rarity,
        }),
      });

      if (res.ok) {
        alert("Listed successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to list:", error);
    }
  };

  const buyListing = async (listing) => {
    if (!walletAddress) {
      alert("Please connect wallet first");
      return;
    }

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "buy",
          listingId: listing.id,
          buyer: walletAddress,
        }),
      });

      if (res.ok) {
        alert("Purchase successful!");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Purchase failed");
      }
    } catch (error) {
      console.error("Failed to buy:", error);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (filterFaction !== "all" && l.faction !== filterFaction) return false;
    if (filterRarity !== "all" && l.rarity !== filterRarity) return false;
    return true;
  });

  const rarityColors = {
    common: "from-gray-500 to-gray-600",
    rare: "from-blue-500 to-blue-600",
    epic: "from-purple-500 to-purple-600",
    legendary: "from-yellow-500 to-orange-500",
  };

  return (
    <div className="min-h-screen bg-[--bg-primary] text-[--text-primary]">
      <Nav walletAddress={walletAddress} onConnect={handleConnect} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 flex items-center justify-center gap-3 sm:gap-4">
            <span className="text-4xl sm:text-6xl">🏪</span>
            三国市
          </h1>
          <p className="text-[--text-secondary] text-base sm:text-lg">
            Trade wallet archetypes with other warlords
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">{listings.length}</div>
            <div className="text-[11px] text-[--text-muted] uppercase tracking-wider">Active Listings</div>
          </div>
          <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[--green]">{inventory.length}</div>
            <div className="text-[11px] text-[--text-muted] uppercase tracking-wider">In Inventory</div>
          </div>
          <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[--accent]">
              {ARCHETYPES.filter((a) => inventory.some((i) => i.name === a.name)).length}
            </div>
            <div className="text-[11px] text-[--text-muted] uppercase tracking-wider">Archetypes Owned</div>
          </div>
          <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-[--amber]">
              {ARCHETYPES.length}
            </div>
            <div className="text-[11px] text-[--text-muted] uppercase tracking-wider">Total Types</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
          {[
            { id: "buy", label: "🛒 Buy" },
            { id: "sell", label: "📤 Sell" },
            { id: "inventory", label: "🎒 Inventory" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                selectedTab === tab.id
                  ? "bg-[--accent] text-[--bg-primary]"
                  : "bg-[--bg-card] text-[--text-secondary] border border-[--border] hover:bg-[--bg-elevated]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterFaction}
            onChange={(e) => setFilterFaction(e.target.value)}
            className="px-4 py-2.5 bg-[--bg-card] border border-[--border] rounded-lg text-[--text-primary] text-sm"
          >
            <option value="all">All Factions</option>
            {FACTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.icon} {f.name}
              </option>
            ))}
          </select>

          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-2.5 bg-[--bg-card] border border-[--border] rounded-lg text-[--text-primary] text-sm"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-10 h-10 border-2 border-[--border] border-t-[--accent] rounded-full mx-auto mb-4"></div>
            <p className="text-[--text-muted]">Loading marketplace...</p>
          </div>
        ) : (
          <>
            {/* Buy Tab */}
            {selectedTab === "buy" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-[--bg-card] border border-[--border] rounded-xl">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-xl text-[--text-primary] mb-2">No listings found</p>
                    <p className="text-[--text-muted]">Be the first to list an archetype!</p>
                  </div>
                ) : (
                  filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-[--bg-card] border border-[--border] rounded-xl p-4 hover:border-[--accent]/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">{listing.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${rarityColors[listing.rarity] || rarityColors.common}`}>
                              {listing.rarity}
                            </span>
                            {listing.faction && (
                              <span className="text-xs text-[--text-muted]">
                                {FACTIONS.find((f) => f.id === listing.faction)?.icon}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-lg sm:text-xl text-[--amber]">
                            {listing.price} GOLD
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-[--text-secondary] mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[--text-muted]">
                          Seller: {listing.seller?.slice(0, 6)}...
                        </span>
                        <button
                          onClick={() => buyListing(listing)}
                          className="px-4 py-2.5 bg-[--accent] text-[--bg-primary] hover:brightness-110 rounded-lg font-medium transition-all text-sm"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sell Tab - Show available archetypes to list */}
            {selectedTab === "sell" && (
              <div className="bg-[--bg-card] border border-[--border] rounded-xl p-4 sm:p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📤</span> List Your Archetypes
                </h2>
                <p className="text-[--text-secondary] mb-6 text-sm sm:text-base">
                  Select an archetype to list for sale from your inventory or buy from the shop first.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {ARCHETYPES.map((archetype) => (
                    <div
                      key={archetype.id}
                      className="bg-[--bg-elevated] border border-[--border] rounded-xl p-3 sm:p-4 text-center hover:border-[--accent]/30 transition-all"
                    >
                      <div className="text-3xl sm:text-4xl mb-2">{archetype.icon}</div>
                      <h3 className="font-medium text-xs sm:text-sm mb-1">{archetype.name}</h3>
                      <div className={`text-xs px-2 py-1 rounded mb-2 bg-gradient-to-r ${rarityColors[archetype.rarity]}`}>
                        {archetype.rarity}
                      </div>
                      <div className="font-mono text-[--amber] text-sm mb-3">{archetype.price} GOLD</div>
                      <button
                        onClick={() => listForSale(archetype, archetype.price)}
                        className="w-full px-3 py-2 bg-[--bg-card] border border-[--border] hover:bg-[--accent] hover:text-[--bg-primary] hover:border-[--accent] rounded-lg text-xs sm:text-sm transition-all"
                      >
                        List for {archetype.price}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {selectedTab === "inventory" && (
              <div>
                {inventory.length === 0 ? (
                  <div className="text-center py-16 bg-[--bg-card] border border-[--border] rounded-xl">
                    <div className="text-5xl mb-4">🎒</div>
                    <p className="text-xl text-[--text-primary] mb-2">Empty Inventory</p>
                    <p className="text-[--text-muted] mb-4">
                      Search wallets to earn archetype rewards
                    </p>
                    <a
                      href="/"
                      className="px-6 py-3 bg-[--accent] text-[--bg-primary] hover:brightness-110 rounded-xl font-medium inline-block transition-all"
                    >
                      Start Searching
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {inventory.map((item, i) => {
                      const archetype = ARCHETYPES.find((a) => a.name === item.name);
                      return (
                        <div
                          key={i}
                          className="bg-[--bg-card] border border-[--border] rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{archetype?.icon || "📦"}</div>
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <div className={`text-xs px-2 py-0.5 rounded inline-block bg-gradient-to-r ${rarityColors[item.rarity] || rarityColors.common}`}>
                                {item.rarity}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-[--text-muted]">Qty: {item.quantity || 1}</span>
                            <button
                              onClick={() => archetype && listForSale(archetype, archetype.price)}
                              className="px-3 py-1.5 bg-[--bg-elevated] border border-[--border] hover:bg-[--accent] hover:text-[--bg-primary] hover:border-[--accent] rounded-lg text-xs transition-all"
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-[--text-muted]">
          <p>🏪 三国市 • Three Kingdoms Marketplace</p>
          <p className="mt-1">Trade wallet archetypes with other warlords</p>
        </div>
      </main>
      <BuildStamp />
    </div>
  );
}
