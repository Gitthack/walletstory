// Tool Marketplace — off-chain MVP
// Manages tool listings, purchases, and tool registry
// Persisted as JSON in data/marketplace/

import { randomUUID } from "crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "marketplace");
const LISTINGS_FILE = join(DATA_DIR, "listings.json");
const PURCHASES_FILE = join(DATA_DIR, "purchases.json");

try { mkdirSync(DATA_DIR, { recursive: true }); } catch {}

// ─── BUILT-IN TOOLS (always available) ─────────────────────────────────────

const BUILTIN_TOOLS = [
  {
    id: "balance-fetcher",
    name: "Balance Fetcher",
    description: "Fetches current ETH balance via Etherscan V2 or RPC",
    category: "data",
    author: "WalletStory",
    price: 0,
    builtin: true,
    icon: "💰",
  },
  {
    id: "tx-fetcher",
    name: "Transaction Fetcher",
    description: "Fetches recent transactions with full metadata",
    category: "data",
    author: "WalletStory",
    price: 0,
    builtin: true,
    icon: "📋",
  },
  {
    id: "token-fetcher",
    name: "ERC20 Transfer Parser",
    description: "Parses ERC20 token transfer history",
    category: "data",
    author: "WalletStory",
    price: 0,
    builtin: true,
    icon: "🪙",
  },
  {
    id: "nft-fetcher",
    name: "NFT Transfer Fetcher",
    description: "Tracks ERC721 NFT movements and holdings",
    category: "data",
    author: "WalletStory",
    price: 0,
    builtin: true,
    icon: "🎨",
  },
  {
    id: "feature-extractor",
    name: "Feature Extractor",
    description: "Computes 30+ behavioral features from raw chain data",
    category: "analysis",
    author: "WalletStory",
    price: 0,
    builtin: true,
    icon: "🔬",
  },
  {
    id: "classifier",
    name: "Protocol Classifier",
    description: "Classifies wallet into 10 archetypes using weighted rules",
    category: "analysis",
    author: "WalletStory",
    price: 0,
    builtin: true,
    icon: "🏷️",
  },
  {
    id: "story-generator",
    name: "Story Generator",
    description: "Generates multi-layered narrative from wallet features",
    category: "generation",
    author: "WalletStory",
    price: 0,
    builtin: true,
    icon: "📖",
  },
  {
    id: "scorer",
    name: "Score Calculator",
    description: "Computes wallet score from confidence, tx count, and value",
    category: "analysis",
    author: "WalletStory",
    price: 0,
    builtin: true,
    icon: "📊",
  },
];

// ─── DATA PERSISTENCE ──────────────────────────────────────────────────────

function loadListings() {
  if (!existsSync(LISTINGS_FILE)) return [];
  try { return JSON.parse(readFileSync(LISTINGS_FILE, "utf8")); } catch { return []; }
}

function saveListings(listings) {
  try { writeFileSync(LISTINGS_FILE, JSON.stringify(listings, null, 2)); } catch (e) {
    console.error("Failed to save listings:", e.message);
  }
}

function loadPurchases() {
  if (!existsSync(PURCHASES_FILE)) return [];
  try { return JSON.parse(readFileSync(PURCHASES_FILE, "utf8")); } catch { return []; }
}

function savePurchases(purchases) {
  try { writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2)); } catch (e) {
    console.error("Failed to save purchases:", e.message);
  }
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

export function getAllTools() {
  const communityListings = loadListings().filter((l) => l.status === "active");
  return [
    ...BUILTIN_TOOLS,
    ...communityListings.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      category: l.category,
      author: l.author,
      price: l.price,
      builtin: false,
      icon: l.icon || "🔧",
      listingId: l.id,
      createdAt: l.createdAt,
    })),
  ];
}

export function getBuiltinTools() {
  return BUILTIN_TOOLS;
}

export function getListings() {
  return loadListings().filter((l) => l.status === "active");
}

export function createListing({ name, description, category, author, price, icon, authorAddress }) {
  const listings = loadListings();
  const listing = {
    id: "tool-" + randomUUID().slice(0, 8),
    name,
    description: description || "",
    category: category || "analysis",
    author: author || "Anonymous",
    authorAddress: authorAddress || null,
    price: price || 0,
    icon: icon || "🔧",
    status: "active",
    createdAt: new Date().toISOString(),
    purchaseCount: 0,
  };
  listings.push(listing);
  saveListings(listings);
  return listing;
}

export function delistTool(listingId, authorAddress) {
  const listings = loadListings();
  const idx = listings.findIndex((l) => l.id === listingId);
  if (idx === -1) return { error: "Listing not found" };
  if (authorAddress && listings[idx].authorAddress !== authorAddress) {
    return { error: "Not authorized" };
  }
  listings[idx].status = "delisted";
  saveListings(listings);
  return { success: true, listing: listings[idx] };
}

export function purchaseTool(listingId, buyerAddress) {
  const listings = loadListings();
  const listing = listings.find((l) => l.id === listingId && l.status === "active");
  if (!listing) return { error: "Listing not found or delisted" };

  const purchases = loadPurchases();
  const already = purchases.find((p) => p.listingId === listingId && p.buyerAddress === buyerAddress);
  if (already) return { error: "Already purchased", purchase: already };

  const purchase = {
    id: "purchase-" + randomUUID().slice(0, 8),
    listingId,
    toolId: listing.id,
    toolName: listing.name,
    buyerAddress: buyerAddress || "anonymous",
    price: listing.price,
    purchasedAt: new Date().toISOString(),
  };
  purchases.push(purchase);
  savePurchases(purchases);

  listing.purchaseCount = (listing.purchaseCount || 0) + 1;
  saveListings(listings);

  return { success: true, purchase };
}

export function getUserPurchases(buyerAddress) {
  return loadPurchases().filter((p) => p.buyerAddress === buyerAddress);
}

export function getToolById(toolId) {
  const builtin = BUILTIN_TOOLS.find((t) => t.id === toolId);
  if (builtin) return builtin;
  const listings = loadListings();
  return listings.find((l) => l.id === toolId && l.status === "active") || null;
}
