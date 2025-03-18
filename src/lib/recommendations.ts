import { WeatherData } from "./weather";
import { LawnProfile } from "@/types/db";
import { GRASS_TYPE_TASKS, SUN_EXPOSURE_TASKS, TaskRecommendation } from "@/types/recommendations";
import { claudeService } from "./claude";

/**
 * Determines if a task is suitable based on weather conditions
 */
function isTaskSuitable(weather: WeatherData, task: string): boolean {
  const badConditions = ["rain", "snow", "thunderstorm", "drizzle", "sleet", "storm"];
  const isGoodWeather = !badConditions.some(condition => 
    weather.condition.toLowerCase().includes(condition)
  );

  switch (task) {
    case "mowing":
      return (
        isGoodWeather &&
        weather.temperature >= 50 &&
        weather.temperature <= 85 &&
        weather.windSpeed < 15
      );
    case "fertilizing":
      return (
        isGoodWeather &&
        weather.temperature >= 60 &&
        weather.windSpeed < 10
      );
    case "watering":
      return (
        !isGoodWeather || // Good to water if it's not already raining
        weather.temperature > 85 || // High temperature needs
        weather.humidity < 30 // Low humidity needs
      );
    default:
      return isGoodWeather;
  }
}

/**
 * Generates lawn care task recommendations based on profile and weather
 */
export async function generateRecommendations(
  profile: LawnProfile,
  weather: WeatherData
): Promise<TaskRecommendation[]> {
  const grassType = profile.grassType.toLowerCase().replace(" ", "-");
  const sunExposure = profile.sunExposure.toLowerCase().replace(" ", "-");
  
  const grassSpecs = GRASS_TYPE_TASKS[grassType as keyof typeof GRASS_TYPE_TASKS];
  const sunSpecs = SUN_EXPOSURE_TASKS[sunExposure as keyof typeof SUN_EXPOSURE_TASKS];

  const recommendations: TaskRecommendation[] = [];

  // Get AI insights for the current conditions
  let aiAdvice: string;
  try {
    aiAdvice = await claudeService.generateRecommendation(
      {
        size: profile.size,
        grassType: profile.grassType,
        sunExposure: profile.sunExposure,
        location: profile.location,
      },
      {
        temperature: weather.temperature,
        humidity: weather.humidity,
        weather: weather.condition,
      }
    );

    // Parse AI response into structured insights
    const aiInsights = {
      personalizedTips: aiAdvice
        .split("\n")
        .filter(line => line.trim().startsWith("-") || line.trim().startsWith("*"))
        .map(line => line.trim().replace(/^[-*]\s+/, "")),
      seasonalAdvice: aiAdvice
        .split("\n")
        .find(line => line.toLowerCase().includes("season") || line.toLowerCase().includes("weather"))
        ?.trim() || "",
    };

    // Mowing recommendation
    if (isTaskSuitable(weather, "mowing")) {
      recommendations.push({
        name: "Mowing",
        description: `Mow at ${grassSpecs.mowingHeight} height. ${sunSpecs.mowingTiming}.`,
        priority: "high",
        conditions: [
          { met: weather.temperature >= 50, text: "Temperature above 50°F" },
          { met: weather.temperature <= 85, text: "Temperature below 85°F" },
          { met: weather.windSpeed < 15, text: "Wind speed below 15 mph" },
          { met: !weather.condition.toLowerCase().includes("rain"), text: "No rain conditions" },
        ],
        products: [
          {
            name: "Sharp Mower Blades",
            type: "equipment",
            description: "Ensure clean cuts and healthy grass",
          }
        ],
        aiInsights,
      });
    }

    // Watering recommendation
    const needsWatering = isTaskSuitable(weather, "watering");
    if (needsWatering) {
      recommendations.push({
        name: "Watering",
        description: `Water ${grassSpecs.wateringFrequency}. ${sunSpecs.wateringAdjustment}.`,
        priority: weather.temperature > 85 ? "high" : "medium",
        conditions: [
          { met: weather.temperature > 85, text: "High temperature stress" },
          { met: weather.humidity < 30, text: "Low humidity conditions" },
          { met: !weather.condition.toLowerCase().includes("rain"), text: "No rain in forecast" },
        ],
        aiInsights,
      });
    }

    // Fertilizing recommendation
    if (isTaskSuitable(weather, "fertilizing")) {
      recommendations.push({
        name: "Fertilizing",
        description: `Follow ${grassSpecs.fertilizingSchedule}. ${sunSpecs.fertilizingNote}.`,
        priority: "medium",
        conditions: [
          { met: weather.temperature >= 60, text: "Temperature above 60°F" },
          { met: weather.windSpeed < 10, text: "Low wind conditions" },
          { met: !weather.condition.toLowerCase().includes("rain"), text: "No immediate rain" },
        ],
        products: [
          {
            name: "Balanced Fertilizer",
            type: "fertilizer",
            description: "NPK ratio suitable for your grass type",
          }
        ],
        aiInsights,
      });
    }
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    // Continue with basic recommendations if AI fails
  }

  return recommendations;
}

/**
 * Calculates the next scheduled task based on lawn profile and current date
 */
export function getNextScheduledTask(profile: LawnProfile): { name: string; dueDate: string } | null {
  const now = new Date();
  const grassType = profile.grassType.toLowerCase().replace(" ", "-");
  const specs = GRASS_TYPE_TASKS[grassType as keyof typeof GRASS_TYPE_TASKS];
  
  // Simple scheduling logic - can be enhanced with more sophisticated calculations
  const nextMowing = new Date(now.setDate(now.getDate() + 7)); // Weekly mowing
  
  return {
    name: "Regular Mowing",
    dueDate: nextMowing.toLocaleDateString(),
  };
}