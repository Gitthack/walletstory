// GET /api/marketplace/tools
// Returns all available tools (builtin + community listings)

import { NextResponse } from "next/server";
import { getAllTools } from "@/lib/marketplace";

export async function GET() {
  try {
    const tools = getAllTools();
    return NextResponse.json({
      tools,
      total: tools.length,
      builtin: tools.filter((t) => t.builtin).length,
      community: tools.filter((t) => !t.builtin).length,
    });
  } catch (err) {
    console.error("Marketplace tools error:", err);
    return NextResponse.json({ tools: [], error: "Failed to load tools" }, { status: 500 });
  }
}
