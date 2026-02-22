// GET /api/tool-runs/:id
// Returns the full tool run log for transparency/traceability

import { NextResponse } from "next/server";
import { getToolRun } from "@/lib/toolRunLog";

export async function GET(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing run ID" }, { status: 400 });
  }

  const run = getToolRun(id);

  if (!run) {
    return NextResponse.json({ error: "Tool run not found" }, { status: 404 });
  }

  return NextResponse.json(run);
}
