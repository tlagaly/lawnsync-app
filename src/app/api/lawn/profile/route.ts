import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const profileSchema = z.object({
  size: z.number().positive(),
  grassType: z.string().min(1),
  sunExposure: z.string().min(1),
  location: z.string().min(3),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = profileSchema.parse(json)

    // Check if user already has a lawn profile
    const existingProfile = await db.lawnProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await db.lawnProfile.update({
        where: {
          id: existingProfile.id,
        },
        data: body,
      })
      return NextResponse.json(updatedProfile)
    }

    // Create new profile
    const profile = await db.lawnProfile.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    return new NextResponse("Internal error", { status: 500 })
  }
}