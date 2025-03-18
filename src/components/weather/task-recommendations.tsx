import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData } from "@/lib/weather";

export interface TaskRecommendationsProps {
  weather: WeatherData;
  forecast: WeatherData[];
}

export function TaskRecommendations({ weather, forecast }: TaskRecommendationsProps) {
  // Function to determine if conditions are suitable for outdoor tasks
  const isGoodForOutdoorTasks = (weather: WeatherData) => {
    return (
      weather.temperature >= 50 &&
      weather.temperature <= 85 &&
      weather.windSpeed < 15 &&
      weather.precipitation < 30
    );
  };

  // Get the next good weather window
  const nextGoodWeather = forecast.find(isGoodForOutdoorTasks);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {isGoodForOutdoorTasks(weather) ? (
          <div className="text-green-600">
            <p>Current conditions are good for outdoor lawn care tasks!</p>
            <ul className="list-disc list-inside mt-2">
              <li>Temperature is in a comfortable range</li>
              <li>Wind conditions are suitable</li>
              <li>Low chance of precipitation</li>
            </ul>
          </div>
        ) : (
          <div>
            <p className="text-yellow-600 mb-2">
              Current conditions are not ideal for outdoor tasks:
            </p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              {weather.temperature < 50 && (
                <li>Temperature is too low</li>
              )}
              {weather.temperature > 85 && (
                <li>Temperature is too high</li>
              )}
              {weather.windSpeed >= 15 && (
                <li>Wind conditions are unfavorable</li>
              )}
              {weather.precipitation >= 30 && (
                <li>High chance of precipitation</li>
              )}
            </ul>
            {nextGoodWeather ? (
              <p className="text-green-600">
                Better conditions expected on {new Date(nextGoodWeather.date).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-gray-600">
                Consider indoor lawn care planning and equipment maintenance
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}