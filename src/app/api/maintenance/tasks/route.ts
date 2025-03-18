import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceTaskSchema } from "@/types/maintenance";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// Type guards
function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

// Get all maintenance tasks
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await db.maintenanceTask.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching maintenance tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance tasks" },
      { status: 500 }
    );
  }
}

// Create a new maintenance task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = maintenanceTaskSchema.parse(json);

    const task = await db.maintenanceTask.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        estimatedTime: validatedData.estimatedTime,
        priority: validatedData.priority,
        weatherFactors: validatedData.weatherFactors,
        seasonality: validatedData.seasonality,
        products: validatedData.products || [],
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (isZodError(error)) {
      return NextResponse.json(
        { error: "Invalid task data", details: error.errors },
        { status: 400 }
      );
    }

    if (isPrismaError(error)) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }

    console.error("Error creating maintenance task:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance task" },
      { status: 500 }
    );
  }
}

// Update a maintenance task
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { id, ...data } = json;
    
    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const validatedData = maintenanceTaskSchema.parse(data);

    const task = await db.maintenanceTask.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        estimatedTime: validatedData.estimatedTime,
        priority: validatedData.priority,
        weatherFactors: validatedData.weatherFactors,
        seasonality: validatedData.seasonality,
        products: validatedData.products || [],
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (isZodError(error)) {
      return NextResponse.json(
        { error: "Invalid task data", details: error.errors },
        { status: 400 }
      );
    }

    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }

    console.error("Error updating maintenance task:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance task" },
      { status: 500 }
    );
  }
}

// Delete a maintenance task
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Check if task has any scheduled instances
    const scheduledTasks = await db.scheduledTask.findMany({
      where: { taskId: id },
    });

    if (scheduledTasks.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete task with scheduled instances" },
        { status: 400 }
      );
    }

    await db.maintenanceTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }

    console.error("Error deleting maintenance task:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance task" },
      { status: 500 }
    );
  }
}