// API Response types
export interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: [{
    description: string;
    icon: string;
  }];
  wind: {
    speed: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  dt_txt?: string;
}

// Application types
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: string;
  date: string;
}

export interface WeatherForecast {
  current: WeatherData;
  forecast: WeatherData[];
}

export interface WeatherError {
  error: string;
  code?: string;
}

// Transform functions
export function transformWeatherData(data: OpenWeatherResponse): WeatherData {
  return {
    temperature: Math.round(data.main.temp),
    condition: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed),
    precipitation: (data.rain?.["1h"] || data.rain?.["3h"] || 0) * 100, // Convert to percentage
    icon: data.weather[0].icon,
    date: data.dt_txt || new Date().toISOString(),
  };
}

// Weather schemas
export const WeatherDataSchema = {
  temperature: "number",
  condition: "string",
  humidity: "number",
  windSpeed: "number",
  precipitation: "number",
  icon: "string",
  date: "string",
} as const;

export const ForecastDataSchema = {
  date: "string",
  temperature: "number",
  condition: "string",
  humidity: "number",
  windSpeed: "number",
  precipitation: "number",
  icon: "string",
} as const;