"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData, ForecastData, getWeatherIconUrl } from "@/lib/weather";
import { TaskRecommendations } from "./task-recommendations";

interface WeatherDisplayProps {
  location: string;
}

export function WeatherDisplay({ location }: WeatherDisplayProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[] | null>(null);
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
        setError(err instanceof Error ? err.message : "Failed to load weather");
      } finally {
        setIsLoading(false);
      }
    }

    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground">
              Loading weather data...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-destructive text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!weather || !forecast) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Current Weather */}
      <Card>
        <CardHeader>
          <CardTitle>Current Weather in {location}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <img
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.condition}
              className="w-16 h-16"
            />
            <div>
              <div className="text-2xl font-bold">{weather.temperature}°F</div>
              <div className="capitalize">{weather.condition}</div>
              <div className="text-sm text-muted-foreground">
                Humidity: {weather.humidity}% | Wind: {weather.windSpeed} mph
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Recommendations */}
      <TaskRecommendations weather={weather} />

      {/* 5-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>5-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {forecast.map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center text-center p-2"
              >
                <div className="text-sm font-medium">{day.date}</div>
                <img
                  src={getWeatherIconUrl(day.icon)}
                  alt={day.condition}
                  className="w-10 h-10"
                />
                <div className="font-bold">{day.temperature}°F</div>
                <div className="text-xs capitalize text-muted-foreground">
                  {day.condition}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}