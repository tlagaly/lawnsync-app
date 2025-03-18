import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentWeather } from "@/lib/weather";
import { generateRecommendations, getNextScheduledTask } from "@/lib/recommendations";
import { RecommendationsResponseSchema } from "@/types/recommendations";

export async function GET() {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's lawn profile
    const profile = await db.lawnProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return new NextResponse("Lawn profile not found", { status: 404 });
    }

    // Get current weather for the profile's location
    const weather = await getCurrentWeather(profile.location);

    // Generate recommendations
    const tasks = generateRecommendations(profile, weather);
    const nextScheduledTask = getNextScheduledTask(profile);

    // Validate response schema
    const response = RecommendationsResponseSchema.parse({
      tasks,
      nextScheduledTask,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Recommendations error:", error);
    return new NextResponse(
      "Error generating recommendations", 
      { status: 500 }
    );
  }
}