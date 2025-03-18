import { NextResponse } from "next/server";
import { setupTestUser } from "@/lib/setup-test-user";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not available in production", { status: 404 });
  }

  try {
    await setupTestUser();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in setup route:", error);
    return NextResponse.json(
      { error: "Failed to setup test environment" },
      { status: 500 }
    );
  }
}