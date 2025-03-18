import { getCurrentWeather } from "@/lib/weather";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  location: z
    .string()
    .min(1, "Location is required")
    .regex(/^[a-zA-Z0-9\s,-]+$/, "Invalid location format"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      location: searchParams.get("location"),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const weather = await getCurrentWeather(result.data.location);
    return NextResponse.json(weather);
  } catch (error) {
    console.error("Weather API error:", error);

    if (error instanceof Error && error.message === 'OpenWeatherMap API key not configured') {
      return NextResponse.json(
        { error: "Weather service configuration error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}