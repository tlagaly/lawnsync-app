"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData, getWeatherIconUrl } from "@/lib/weather";
import { TaskRecommendations } from "./task-recommendations";

interface WeatherDisplayProps {
  location: string;
}

export function WeatherDisplay({ location }: WeatherDisplayProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setIsLoading(true);
        setError(null);

        const [currentRes, forecastRes] = await Promise.all([
          fetch(`/api/weather/current?location=${encodeURIComponent(location)}`),
          fetch(`/api/weather/forecast?location=${encodeURIComponent(location)}`),
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const [currentData, forecastData] = await Promise.all([
          currentRes.json(),
          forecastRes.json(),
        ]);

        setWeather(currentData);
        setForecast(forecastData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeatherData();
  }, [location]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <img
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.condition}
              className="w-16 h-16"
            />
            <div>
              <div className="text-2xl font-bold">{weather.temperature}°F</div>
              <div className="text-gray-500 capitalize">{weather.condition}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Humidity</div>
              <div>{weather.humidity}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Wind Speed</div>
              <div>{weather.windSpeed} mph</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {forecast && <TaskRecommendations weather={weather} forecast={forecast} />}
    </div>
  );
}