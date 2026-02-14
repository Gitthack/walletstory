// Three Kingdoms Marketplace API
// Trading system for in-game items, wallets, and faction assets

import { NextResponse } from "next/server";
import { 
  addMarketplaceItem, 
  getMarketplaceListings, 
  getMarketplaceStats,
  upsertGameProfile,
  getGameProfile,
} from "@/lib/db";

// Supported item types
const ITEM_TYPES = [
  "wallet_analysis",    // Premium wallet analysis reports
  "faction_bond",       // Faction investment bonds
  "land_deed",          // Virtual land in Three Kingdoms map
  "artifact",           // Special items with bonuses
  "strategy_guide",     // Premium strategy guides
];

// Supported factions
const FACTIONS = ["魏 Wei", "蜀 Shu", "吴 Wu", "neutral"];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const faction = searchParams.get("faction");
  const minPrice = parseFloat(searchParams.get("minPrice"));
  const maxPrice = parseFloat(searchParams.get("maxPrice"));
  
  try {
    const listings = await getMarketplaceListings({
      type,
      faction,
      minPrice: isNaN(minPrice) ? undefined : minPrice,
      maxPrice: isNaN(maxPrice) ? undefined : maxPrice,
    });
    
    const stats = await getMarketplaceStats();
    
    return NextResponse.json({
      listings: listings.map(l => ({
        id: l.id,
        type: l.type,
        name: l.name,
        description: l.description,
        price: l.price,
        currency: l.currency || "GOLD",
        seller: l.seller?.slice(0, 8) + "...",
        faction: l.faction,
        rarity: l.rarity,
        bonus: l.bonus,
        createdAt: l.createdAt,
      })),
      stats,
      filters: { type, faction, minPrice, maxPrice },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Marketplace GET error:", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      action, 
      type, 
      name, 
      description, 
      price, 
      currency,
      faction, 
      rarity, 
      bonus,
      seller,
      listingId,
      buyer
    } = body;
    
    switch (action) {
      case "list":
        // Validate required fields
        if (!type || !name || !price || !seller) {
          return NextResponse.json(
            { error: "Missing required fields: type, name, price, seller" },
            { status: 400 }
          );
        }
        
        if (!ITEM_TYPES.includes(type)) {
          return NextResponse.json(
            { error: `Invalid type. Supported: ${ITEM_TYPES.join(", ")}` },
            { status: 400 }
          );
        }
        
        if (faction && !FACTIONS.includes(faction)) {
          return NextResponse.json(
            { error: `Invalid faction. Supported: ${FACTIONS.join(", ")}` },
            { status: 400 }
          );
        }
        
        // Create new listing
        const newListing = addMarketplaceItem({
          type,
          name,
          description,
          price: parseFloat(price),
          currency: currency || "GOLD",
          faction,
          rarity,
          bonus,
          seller,
        });
        
        return NextResponse.json({
          success: true,
          listing: {
            id: newListing.id,
            type: newListing.type,
            name: newListing.name,
            price: newListing.price,
          },
          message: "Item listed successfully",
        });
        
      case "buy":
        // Validate purchase
        if (!listingId || !buyer) {
          return NextResponse.json(
            { error: "Missing required fields: listingId, buyer" },
            { status: 400 }
          );
        }
        
        // Check buyer's game profile and resources
        const profile = await getGameProfile(buyer);
        if (!profile) {
          return NextResponse.json(
            { error: "Buyer has no game profile. Start playing to access marketplace." },
            { status: 400 }
          );
        }
        
        // Get listing
        const listings = await getMarketplaceListings();
        const listing = listings.find(l => l.id === listingId && l.status === "active");
        if (!listing) {
          return NextResponse.json(
            { error: "Listing not found or already sold" },
            { status: 404 }
          );
        }
        
        // Check affordability
        const currencyType = listing.currency || "GOLD";
        const resourceKey = currencyType.toLowerCase();
        if ((profile.resources[resourceKey] || 0) < listing.price) {
          return NextResponse.json(
            { error: `Insufficient ${currencyType}. Need ${listing.price}, have ${profile.resources[resourceKey] || 0}` },
            { status: 400 }
          );
        }
        
        // Execute purchase - update buyer
        profile.resources[resourceKey] = (profile.resources[resourceKey] || 0) - listing.price;
        profile.marketplaceTransactions = (profile.marketplaceTransactions || 0) + 1;
        
        // Add item to inventory
        if (!profile.inventory) profile.inventory = [];
        profile.inventory.push({
          itemId: listing.id,
          type: listing.type,
          name: listing.name,
          rarity: listing.rarity,
          bonus: listing.bonus,
          acquiredAt: new Date().toISOString(),
        });
        
        await upsertGameProfile(buyer, profile);
        
        // Update seller profile (add revenue)
        const sellerProfile = await getGameProfile(listing.seller);
        if (sellerProfile) {
          sellerProfile.resources[resourceKey] = (sellerProfile.resources[resourceKey] || 0) + listing.price;
          await upsertGameProfile(listing.seller, sellerProfile);
        }
        
        return NextResponse.json({
          success: true,
          message: `Successfully purchased ${listing.name}`,
          item: {
            name: listing.name,
            type: listing.type,
            rarity: listing.rarity,
          },
          remainingBalance: profile.resources[resourceKey],
        });
        
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: list or buy" },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Marketplace POST error:", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
