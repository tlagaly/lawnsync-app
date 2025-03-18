import { z } from "zod";

export const TaskConditionSchema = z.object({
  met: z.boolean(),
  text: z.string(),
});

export const TaskRecommendationSchema = z.object({
  name: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  conditions: z.array(TaskConditionSchema),
  products: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string(),
  })).optional(),
});

export const RecommendationsResponseSchema = z.object({
  tasks: z.array(TaskRecommendationSchema),
  nextScheduledTask: z.object({
    name: z.string(),
    dueDate: z.string(),
  }).optional(),
});

export type TaskCondition = z.infer<typeof TaskConditionSchema>;
export type TaskRecommendation = z.infer<typeof TaskRecommendationSchema>;
export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>;

// Grass-specific recommendations
export const GRASS_TYPE_TASKS = {
  "bermuda": {
    mowingHeight: "1-2 inches",
    wateringFrequency: "1-2 times per week",
    fertilizingSchedule: "Every 4-6 weeks during growing season",
  },
  "fescue": {
    mowingHeight: "2.5-3.5 inches",
    wateringFrequency: "2-3 times per week",
    fertilizingSchedule: "Every 6-8 weeks during growing season",
  },
  "kentucky-bluegrass": {
    mowingHeight: "2.5-3.5 inches",
    wateringFrequency: "1-2 times per week",
    fertilizingSchedule: "Every 6-8 weeks during growing season",
  },
  "st-augustine": {
    mowingHeight: "2.5-4 inches",
    wateringFrequency: "1-2 times per week",
    fertilizingSchedule: "Every 6-8 weeks during growing season",
  },
  "zoysia": {
    mowingHeight: "0.5-2 inches",
    wateringFrequency: "1-2 times per week",
    fertilizingSchedule: "Every 6-8 weeks during growing season",
  },
} as const;

// Sun exposure recommendations
export const SUN_EXPOSURE_TASKS = {
  "full-sun": {
    wateringAdjustment: "Increase frequency during hot periods",
    mowingTiming: "Early morning or late afternoon",
    fertilizingNote: "May need more frequent fertilization",
  },
  "partial-shade": {
    wateringAdjustment: "Monitor moisture levels carefully",
    mowingTiming: "Anytime during the day",
    fertilizingNote: "Standard fertilization schedule",
  },
  "full-shade": {
    wateringAdjustment: "Reduce watering frequency",
    mowingTiming: "Anytime during the day",
    fertilizingNote: "Reduce fertilization frequency",
  },
} as const;