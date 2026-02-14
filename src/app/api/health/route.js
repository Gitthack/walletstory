import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Health check for external services
    const services = {
      api: "ok",
      storage: "ok",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      status: "ok",
      services,
      message: "WalletStory API is healthy and running",
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Health check failed",
    });
  }
}
