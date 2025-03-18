import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = userSchema.parse(json)

    // Check if email exists
    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 409 })
    }

    const hashedPassword = await hash(body.password, 10)

    const user = await db.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
      },
    })

    return NextResponse.json({
      user: {
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    return new NextResponse("Internal error", { status: 500 })
  }
}