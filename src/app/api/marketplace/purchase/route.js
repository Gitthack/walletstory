// POST /api/marketplace/purchase — purchase a tool listing
// Body: { listingId, buyerAddress }

import { NextResponse } from "next/server";
import { purchaseTool, getUserPurchases } from "@/lib/marketplace";

export async function POST(request) {
  try {
    const body = await request.json();
    const { listingId, buyerAddress } = body;

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const result = purchaseTool(listingId, buyerAddress || "anonymous");
    if (result.error && !result.purchase) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Purchase error:", err);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyer = searchParams.get("buyer") || "anonymous";
    const purchases = getUserPurchases(buyer);
    return NextResponse.json({ purchases, total: purchases.length });
  } catch (err) {
    console.error("Get purchases error:", err);
    return NextResponse.json({ purchases: [], error: "Failed to load purchases" }, { status: 500 });
  }
}
