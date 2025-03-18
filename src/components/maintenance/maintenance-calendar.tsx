"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatus, type ScheduledTaskResponse, type TaskStatusUpdate } from "@/types/maintenance";
import { TaskActions } from "./task-actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MaintenanceCalendarProps {
  lawnProfileId: string;
}

export function MaintenanceCalendar({ lawnProfileId }: MaintenanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Handle task status updates
  const handleStatusUpdate = useCallback(async (taskId: string, update: TaskStatusUpdate) => {
    setUpdateError(null);
    try {
      const response = await fetch(`/api/maintenance/schedule/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task status');
      }

      // Refresh task list
      const fetchTasks = async () => {
        try {
          const response = await fetch(`/api/maintenance/schedule?lawnProfileId=${lawnProfileId}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch tasks");
          }
          
          setScheduledTasks(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load tasks");
        }
      };

      await fetchTasks();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update task');
      throw err; // Re-throw for the TaskActions component to handle
    }
  }, [lawnProfileId]);

  // Fetch scheduled tasks
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch(`/api/maintenance/schedule?lawnProfileId=${lawnProfileId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch tasks");
        }
        
        setScheduledTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, [lawnProfileId]);

  // Helper to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return scheduledTasks.filter((task) => {
      const taskDate = new Date(task.scheduledDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  // Get priority color class
  const getPriorityColorClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center min-h-[100px] text-destructive">
          {error === "Unauthorized" ? (
            <div className="text-center">
              <p className="mb-2">Please sign in to view your maintenance schedule</p>
              <Button asChild variant="outline">
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          ) : (
            <p>Error: {error}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="w-full">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full rounded-md border"
            disabled={(date) => date < new Date()}
            modifiers={{
              hasTask: (date) => getTasksForDate(date).length > 0,
              completed: (date) => getTasksForDate(date).some((task) => task.status === TaskStatus.completed),
              weatherWarning: (date) => getTasksForDate(date).some((task) => task.weatherAdjusted),
            }}
            modifiersClassNames={{
              hasTask: "font-bold",
              completed: "bg-green-50",
              weatherWarning: "relative",
            }}
            components={{
              Day: ({ date, displayMonth }) => {
                const tasksForDay = getTasksForDate(date);
                const hasWeatherWarning = tasksForDay.some((task) => task.weatherAdjusted);
                const isOutsideMonth = date.getMonth() !== displayMonth.getMonth();

                return (
                  <div className="relative w-full h-full group hover:bg-accent/10 rounded-md transition-colors">
                    <div className="absolute top-1 right-1 flex gap-0.5">
                      {tasksForDay.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-110",
                            getPriorityColorClass(task.task.priority)
                          )}
                        />
                      ))}
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-center text-sm p-2",
                        isOutsideMonth && "text-muted-foreground opacity-50",
                        tasksForDay.length > 0 && "font-medium"
                      )}
                    >
                      {date.getDate()}
                    </div>
                    {hasWeatherWarning && (
                      <span className="absolute bottom-1 right-1 text-xs transition-transform group-hover:scale-110">⛈️</span>
                    )}
                  </div>
                );
              },
            }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>High Priority</span>
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Medium Priority</span>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⛈️ Weather Warning</span>
          </div>
        </div>
      </div>
      {selectedDate && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">
            Tasks for {selectedDate.toLocaleDateString()}
          </h3>
          {updateError && (
            <p className="text-sm text-destructive mb-4">{updateError}</p>
          )}
          <div className="space-y-4">
            {getTasksForDate(selectedDate).map((task) => (
              <div
                key={task.id}
                className={cn(
                  "rounded-md border overflow-hidden",
                  task.status === TaskStatus.completed && "border-green-200",
                  task.status === TaskStatus.rescheduled && "border-yellow-200",
                  task.status === TaskStatus.skipped && "border-gray-200"
                )}
              >
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        getPriorityColorClass(task.task.priority)
                      )}
                    />
                    <span className="font-medium">{task.task.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {task.task.description}
                  </p>
                  {task.weatherAdjusted && (
                    <p className="text-sm text-yellow-600 mt-1">
                      ⚠️ Weather conditions may affect this task
                    </p>
                  )}
                </div>
                
                <TaskActions
                  task={task}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}