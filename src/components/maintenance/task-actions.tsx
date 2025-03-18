"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TaskStatus,
  type ScheduledTaskResponse,
  type TaskStatusUpdate,
} from "@/types/maintenance";
import { cn } from "@/lib/utils";

interface TaskActionsProps {
  task: ScheduledTaskResponse;
  onStatusUpdate: (taskId: string, update: TaskStatusUpdate) => Promise<void>;
}

export function TaskActions({ task, onStatusUpdate }: TaskActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState(task.notes || "");
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    setError(null);
    setIsUpdating(true);

    try {
      const update: TaskStatusUpdate = {
        status: newStatus,
        notes: notes || undefined,
      };

      if (newStatus === TaskStatus.completed) {
        if (!duration) {
          setError("Please enter the task duration");
          return;
        }
        update.completedDate = new Date().toISOString();
        update.duration = parseInt(duration);
      }

      await onStatusUpdate(task.id, update);
      
      // Reset form if not completed (completed status persists)
      if (newStatus !== TaskStatus.completed) {
        setDuration("");
        setNotes("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't show actions for completed tasks
  if (task.status === TaskStatus.completed) {
    return (
      <Card className="p-3 bg-green-50">
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm">
            Completed {task.history?.completedDate
              ? new Date(task.history.completedDate).toLocaleDateString()
              : ""}
          </span>
        </div>
        {task.history?.duration && (
          <p className="text-sm text-gray-600 mt-1">
            Duration: {task.history.duration} minutes
          </p>
        )}
        {task.history?.notes && (
          <p className="text-sm text-gray-600 mt-1">
            Notes: {task.history.notes}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-3 space-y-3">
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Enter task duration"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add task notes"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => handleStatusUpdate(TaskStatus.completed)}
          disabled={isUpdating}
        >
          Complete
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleStatusUpdate(TaskStatus.skipped)}
          disabled={isUpdating}
        >
          Skip
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleStatusUpdate(TaskStatus.rescheduled)}
          disabled={isUpdating}
        >
          Reschedule
        </Button>
      </div>
    </Card>
  );
}