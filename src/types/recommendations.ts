import { z } from "zod";

export interface TaskCondition {
  met: boolean;
  text: string;
}

export interface ProductRecommendation {
  name: string;
  type: string;
  description: string;
}

export interface TaskRecommendation {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  conditions: TaskCondition[];
  products?: ProductRecommendation[];
  aiInsights?: {
    personalizedTips: string[];
    seasonalAdvice: string;
  };
}

export interface RecommendationsResponse {
  tasks: TaskRecommendation[];
  nextScheduledTask?: {
    name: string;
    dueDate: string;
  };
}

export const RecommendationsResponseSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      conditions: z.array(
        z.object({
          met: z.boolean(),
          text: z.string(),
        })
      ),
      products: z
        .array(
          z.object({
            name: z.string(),
            type: z.string(),
            description: z.string(),
          })
        )
        .optional(),
      aiInsights: z
        .object({
          personalizedTips: z.array(z.string()),
          seasonalAdvice: z.string(),
        })
        .optional(),
    })
  ),
  nextScheduledTask: z
    .object({
      name: z.string(),
      dueDate: z.string(),
    })
    .optional(),
});

// Predefined tasks based on grass type
export const GRASS_TYPE_TASKS = {
  "kentucky-bluegrass": {
    mowingHeight: "2.5-3.5 inches",
    wateringFrequency: "1-1.5 inches per week",
    fertilizingSchedule: "4-5 times per year",
  },
  "tall-fescue": {
    mowingHeight: "2-3 inches",
    wateringFrequency: "1-1.25 inches per week",
    fertilizingSchedule: "3-4 times per year",
  },
  "perennial-ryegrass": {
    mowingHeight: "1.5-2.5 inches",
    wateringFrequency: "1 inch per week",
    fertilizingSchedule: "2-3 times per year",
  },
  "bermuda": {
    mowingHeight: "0.5-1.5 inches",
    wateringFrequency: "1-1.25 inches per week",
    fertilizingSchedule: "4-6 times per year",
  },
  "zoysia": {
    mowingHeight: "0.5-1 inch",
    wateringFrequency: "1 inch per week",
    fertilizingSchedule: "2-3 times per year",
  },
};

// Sun exposure adjustments
export const SUN_EXPOSURE_TASKS = {
  "full-sun": {
    mowingTiming: "Mow during cooler parts of the day",
    wateringAdjustment: "Water deeply and less frequently",
    fertilizingNote: "Use full recommended fertilizer amount",
  },
  "partial-shade": {
    mowingTiming: "Mow when grass is dry",
    wateringAdjustment: "Monitor soil moisture, adjust watering as needed",
    fertilizingNote: "Reduce fertilizer amount by 25%",
  },
  "full-shade": {
    mowingTiming: "Raise mowing height slightly",
    wateringAdjustment: "Water less frequently, monitor for moisture",
    fertilizingNote: "Reduce fertilizer amount by 50%",
  },
};