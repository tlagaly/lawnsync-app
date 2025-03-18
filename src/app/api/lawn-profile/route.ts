import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const profileSchema = z.object({
  size: z.number().min(1, "Lawn size must be greater than 0"),
  grassType: z.string().min(1, "Grass type is required"),
  sunExposure: z.string().min(1, "Sun exposure is required"),
  location: z.string().min(1, "Location is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = profileSchema.parse(json);

    // Check if profile exists
    const existingProfile = await db.lawnProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      // Update existing profile
      const profile = await db.lawnProfile.update({
        where: { userId: session.user.id },
        data: body,
      });

      return NextResponse.json({ profile });
    } else {
      // Create new profile
      const profile = await db.lawnProfile.create({
        data: {
          ...body,
          userId: session.user.id,
        },
      });

      return NextResponse.json({ profile });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}