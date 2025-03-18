import { OpenWeatherResponse, WeatherData, transformWeatherData } from "@/types/weather";

export type { WeatherData };

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Fetches current weather data for a given location
 */
export async function getCurrentWeather(location: string): Promise<WeatherData> {
  if (!API_KEY) throw new Error("OpenWeatherMap API key not configured");

  const response = await fetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=imperial`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json() as OpenWeatherResponse;
  return transformWeatherData(data);
}

/**
 * Fetches 5-day forecast data for a given location
 */
export async function getForecast(location: string): Promise<WeatherData[]> {
  if (!API_KEY) throw new Error("OpenWeatherMap API key not configured");

  const response = await fetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=imperial`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Get one forecast per day (every 8th item is noon)
  return data.list
    .filter((_: any, index: number) => index % 8 === 0)
    .slice(0, 5)
    .map((item: OpenWeatherResponse) => transformWeatherData(item));
}

/**
 * Gets the weather icon URL from OpenWeatherMap
 */
export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

/**
 * Determines if outdoor tasks are recommended based on weather
 */
export function isOutdoorTaskRecommended(weather: WeatherData): boolean {
  const badConditions = [
    "rain",
    "snow",
    "thunderstorm",
    "drizzle",
    "sleet",
    "storm",
  ];

  return (
    !badConditions.some((condition) =>
      weather.condition.toLowerCase().includes(condition)
    ) &&
    weather.temperature >= 50 &&
    weather.temperature <= 85 &&
    weather.windSpeed < 15
  );
}