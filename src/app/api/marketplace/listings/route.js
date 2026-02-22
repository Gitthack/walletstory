// GET /api/marketplace/listings — list active community tools
// POST /api/marketplace/listings — create a new listing
// DELETE /api/marketplace/listings?id=...&author=... — delist a tool

import { NextResponse } from "next/server";
import { getListings, createListing, delistTool } from "@/lib/marketplace";

export async function GET() {
  try {
    const listings = getListings();
    return NextResponse.json({ listings, total: listings.length });
  } catch (err) {
    console.error("Listings error:", err);
    return NextResponse.json({ listings: [], error: "Failed to load listings" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, category, author, price, icon, authorAddress } = body;

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Tool name is required (min 2 chars)" }, { status: 400 });
    }

    const listing = createListing({ name, description, category, author, price, icon, authorAddress });
    return NextResponse.json({ success: true, listing });
  } catch (err) {
    console.error("Create listing error:", err);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const author = searchParams.get("author");

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const result = delistTool(id, author);
    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Delist error:", err);
    return NextResponse.json({ error: "Failed to delist tool" }, { status: 500 });
  }
}
