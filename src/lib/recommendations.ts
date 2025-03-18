import { WeatherData } from "./weather";
import { LawnProfile } from "@/types/db";
import { GRASS_TYPE_TASKS, SUN_EXPOSURE_TASKS, TaskRecommendation } from "@/types/recommendations";
import { claudeService, ClaudeService } from "./claude";

type GrassType = keyof typeof GRASS_TYPE_TASKS;
type SunExposure = keyof typeof SUN_EXPOSURE_TASKS;

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
        weather.temperature > 85 || // Water during high temps
        weather.humidity < 40 // Water during low humidity
      );
    default:
      return isGoodWeather;
  }
}

/**
 * Gets task recommendations based on lawn profile and weather
 */
export async function getRecommendations(
  profile: LawnProfile,
  weather: WeatherData
): Promise<TaskRecommendation[]> {
  // Get base tasks for grass type and sun exposure
  const grassTasks = GRASS_TYPE_TASKS[profile.grassType as GrassType] || {};
  const sunTasks = SUN_EXPOSURE_TASKS[profile.sunExposure as SunExposure] || {};

  // Create task recommendations
  const recommendations: TaskRecommendation[] = [
    {
      name: "Mowing",
      description: `Mow at height: ${grassTasks.mowingHeight || "2-3 inches"}. ${sunTasks.mowingTiming || ""}`,
      priority: "high",
      conditions: [
        {
          met: isTaskSuitable(weather, "mowing"),
          text: "Weather conditions suitable for mowing",
        },
      ],
    },
    {
      name: "Watering",
      description: `Water ${grassTasks.wateringFrequency || "1 inch per week"}. ${sunTasks.wateringAdjustment || ""}`,
      priority: "medium",
      conditions: [
        {
          met: isTaskSuitable(weather, "watering"),
          text: "Weather conditions suitable for watering",
        },
      ],
    },
    {
      name: "Fertilizing",
      description: `Follow schedule: ${grassTasks.fertilizingSchedule || "3-4 times per year"}. ${sunTasks.fertilizingNote || ""}`,
      priority: "low",
      conditions: [
        {
          met: isTaskSuitable(weather, "fertilizing"),
          text: "Weather conditions suitable for fertilizing",
        },
      ],
    },
  ];

  // Get AI recommendations if available
  try {
    // Get or create Claude service
    const service = claudeService || new ClaudeService(process.env.CLAUDE_API_KEY || "");
    
    const aiAdvice = await service.generateRecommendation(
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

    // Add AI insights to each recommendation
    return recommendations.map(rec => ({
      ...rec,
      aiInsights: {
        personalizedTips: [aiAdvice],
        seasonalAdvice: aiAdvice,
      },
    }));
  } catch (error) {
    console.error('Failed to get AI recommendations:', error);
    return recommendations;
  }
}