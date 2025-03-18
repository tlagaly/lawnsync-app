import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { scheduledTaskSchema, TaskStatus } from "@/types/maintenance";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { getCurrentWeather, getForecast } from "@/lib/weather";
import { shouldRescheduleTask, getNextAvailableDate } from "@/lib/maintenance";

// Type guards
function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

// Get scheduled tasks for a lawn profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lawnProfileId = searchParams.get("lawnProfileId");
    
    if (!lawnProfileId) {
      return NextResponse.json(
        { error: "Lawn profile ID is required" },
        { status: 400 }
      );
    }

    // Get the lawn profile to verify ownership
    const lawnProfile = await db.lawnProfile.findUnique({
      where: { id: lawnProfileId },
      include: { user: true },
    });

    if (!lawnProfile || lawnProfile.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Lawn profile not found" },
        { status: 404 }
      );
    }

    const scheduledTasks = await db.scheduledTask.findMany({
      where: { lawnProfileId },
      include: { task: true },
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json(scheduledTasks);
  } catch (error) {
    console.error("Error fetching scheduled tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled tasks" },
      { status: 500 }
    );
  }
}

// Schedule a new task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = scheduledTaskSchema.parse(json);

    // Get the lawn profile to verify ownership and get location
    const lawnProfile = await db.lawnProfile.findUnique({
      where: { id: validatedData.lawnProfileId },
      include: { user: true },
    });

    if (!lawnProfile || lawnProfile.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Lawn profile not found" },
        { status: 404 }
      );
    }

    // Get the task
    const task = await db.maintenanceTask.findUnique({
      where: { id: validatedData.taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Get weather data
    const weather = await getCurrentWeather(lawnProfile.location);
    const forecast = await getForecast(lawnProfile.location);

    // Check if we need to reschedule
    const scheduledDate = new Date(validatedData.scheduledDate);
    let weatherAdjusted = false;
    let finalScheduledDate = scheduledDate;

    const partialTask = {
      ...validatedData,
      status: TaskStatus.pending,
      id: '',
      task,
      weatherAdjusted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (shouldRescheduleTask(task, partialTask, weather)) {
      const nextDate = getNextAvailableDate(task, scheduledDate, forecast);
      if (nextDate) {
        finalScheduledDate = nextDate;
        weatherAdjusted = true;
      }
    }

    // Create the scheduled task
    const scheduledTask = await db.scheduledTask.create({
      data: {
        taskId: validatedData.taskId,
        lawnProfileId: validatedData.lawnProfileId,
        scheduledDate: finalScheduledDate,
        status: TaskStatus.pending,
        weatherAdjusted,
        notes: validatedData.notes,
      },
      include: { task: true },
    });

    return NextResponse.json(scheduledTask);
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

    console.error("Error scheduling task:", error);
    return NextResponse.json(
      { error: "Failed to schedule task" },
      { status: 500 }
    );
  }
}

// Update a scheduled task
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { id, status, notes } = json;

    if (!id) {
      return NextResponse.json(
        { error: "Scheduled task ID is required" },
        { status: 400 }
      );
    }

    // Get the scheduled task to verify ownership
    const existingTask = await db.scheduledTask.findUnique({
      where: { id },
      include: { lawnProfile: { include: { user: true } } },
    });

    if (!existingTask || existingTask.lawnProfile.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Scheduled task not found" },
        { status: 404 }
      );
    }

    // Update the scheduled task
    const updatedTask = await db.scheduledTask.update({
      where: { id },
      data: {
        status: status || existingTask.status,
        notes: notes || existingTask.notes,
      },
      include: { task: true },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Scheduled task not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }

    console.error("Error updating scheduled task:", error);
    return NextResponse.json(
      { error: "Failed to update scheduled task" },
      { status: 500 }
    );
  }
}

// Delete a scheduled task
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
        { error: "Scheduled task ID is required" },
        { status: 400 }
      );
    }

    // Get the scheduled task to verify ownership
    const existingTask = await db.scheduledTask.findUnique({
      where: { id },
      include: { lawnProfile: { include: { user: true } } },
    });

    if (!existingTask || existingTask.lawnProfile.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Scheduled task not found" },
        { status: 404 }
      );
    }

    // Don't allow deleting completed tasks
    if (existingTask.status === TaskStatus.completed) {
      return NextResponse.json(
        { error: "Cannot delete completed tasks" },
        { status: 400 }
      );
    }

    await db.scheduledTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Scheduled task not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }

    console.error("Error deleting scheduled task:", error);
    return NextResponse.json(
      { error: "Failed to delete scheduled task" },
      { status: 500 }
    );
  }
}