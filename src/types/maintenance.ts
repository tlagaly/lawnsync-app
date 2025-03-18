import { z } from "zod";

// Define our enums to match Prisma's
export enum TaskPriority {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

export enum TaskStatus {
  pending = 'pending',
  completed = 'completed',
  skipped = 'skipped',
  rescheduled = 'rescheduled',
}

// Schemas for validation
export const maintenanceTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().min(1, "Description is required"),
  estimatedTime: z.number().min(1, "Estimated time must be at least 1 minute"),
  priority: z.nativeEnum(TaskPriority),
  weatherFactors: z.object({
    temperature: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
    precipitation: z.object({
      chance: z.number(),
      intensity: z.number(),
    }).optional(),
    wind: z.object({
      speed: z.number(),
    }).optional(),
  }),
  seasonality: z.array(z.enum(["spring", "summer", "fall", "winter"])),
  products: z.array(z.object({
    name: z.string(),
    description: z.string(),
    link: z.string().url().optional(),
  })).optional(),
});

export const scheduledTaskSchema = z.object({
  taskId: z.string(),
  lawnProfileId: z.string(),
  scheduledDate: z.string().datetime(),
  notes: z.string().optional(),
});

export const taskStatusUpdateSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  notes: z.string().optional(),
  completedDate: z.string().datetime().optional(),
  duration: z.number().optional(),
});

// Types derived from schemas
export type MaintenanceTask = z.infer<typeof maintenanceTaskSchema>;
export type ScheduledTask = z.infer<typeof scheduledTaskSchema>;
export type TaskStatusUpdate = z.infer<typeof taskStatusUpdateSchema>;

// Response types
export type MaintenanceTaskResponse = MaintenanceTask & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type ScheduledTaskResponse = ScheduledTask & {
  id: string;
  task: MaintenanceTaskResponse;
  status: TaskStatus;
  weatherAdjusted: boolean;
  createdAt: string;
  updatedAt: string;
  history?: TaskHistoryResponse;
};

export type TaskHistoryResponse = {
  id: string;
  scheduledTaskId: string;
  lawnProfileId: string;
  completedDate: string;
  duration?: number;
  notes?: string;
  weather: {
    temperature: number;
    conditions: string;
    wind: number;
  };
  createdAt: string;
  updatedAt: string;
};

// Partial types for updates
export type PartialScheduledTask = {
  taskId: string;
  status: TaskStatus;
  scheduledDate?: string;
  notes?: string;
  lawnProfileId?: string;
};