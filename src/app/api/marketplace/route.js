// Three Kingdoms Marketplace API
// Trading system for in-game items, wallets, and faction assets

import { NextResponse } from "next/server";
import { 
  addMarketplaceItem, 
  getMarketplaceListings, 
  purchaseListing,
  getMarketplaceStats,
  upsertGameProfile,
  getGameProfile
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
    const listings = getMarketplaceListings({
      type,
      faction,
      minPrice: isNaN(minPrice) ? undefined : minPrice,
      maxPrice: isNaN(maxPrice) ? undefined : maxPrice,
    });
    
    const stats = getMarketplaceStats();
    
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
        const profile = getGameProfile(buyer);
        if (!profile) {
          return NextResponse.json(
            { error: "Buyer has no game profile. Start playing to access marketplace." },
            { status: 400 }
          );
        }
        
        // Get listing (we need to call the function, not access store directly)
        const listings = getMarketplaceListings();
        const listing = listings.find(l => l.id === listingId && l.status === "active");
        if (!listing) {
          return NextResponse.json(
            { error: "Listing not found or already sold" },
            { status: 404 }
          );
        }
        
        // Check affordability
        const currencyType = listing.currency || "GOLD";
        if (profile.resources[currencyType.toLowerCase()] < listing.price) {
          return NextResponse.json(
            { error: `Insufficient ${currencyType}. Need ${listing.price}, have ${profile.resources[currencyType.toLowerCase()]}` },
            { status: 400 }
          );
        }
        
        // Execute purchase
        const purchased = purchaseListing(listingId, buyer);
        if (!purchased) {
          return NextResponse.json({ error: "Purchase failed" }, { status: 500 });
        }
        
        // Update profiles
        const sellerProfile = getGameProfile(listing.seller);
        if (sellerProfile) {
          sellerProfile.resources[currencyType.toLowerCase()] += listing.price;
          upsertGameProfile(listing.seller, sellerProfile);
        }
        
        profile.resources[currencyType.toLowerCase()] -= listing.price;
        profile.marketplaceTransactions++;
        
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
        
        upsertGameProfile(buyer, profile);
        
        return NextResponse.json({
          success: true,
          message: `Successfully purchased ${listing.name}`,
          item: {
            name: listing.name,
            type: listing.type,
            rarity: listing.rarity,
          },
          remainingBalance: profile.resources[currencyType.toLowerCase()],
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
