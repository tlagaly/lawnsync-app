import { useEffect, useState } from "react";
import { WeatherData } from "@/lib/weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { RecommendationsResponse, TaskRecommendation } from "@/types/recommendations";

interface TaskRecommendationsProps {
  weather: WeatherData;
}

export function TaskRecommendations({ weather }: TaskRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/recommendations");
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        const data = await response.json();
        setRecommendations(data);
        setError(null);
      } catch (err) {
        setError("Error loading recommendations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Recommendations...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    );
  }

  if (!recommendations?.tasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Current Tasks</CardTitle>
        </CardHeader>
        <CardContent>Check back later for lawn care recommendations.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Task Recommendations
          {recommendations.nextScheduledTask && (
            <span className="text-sm font-normal text-muted-foreground">
              Next: {recommendations.nextScheduledTask.name} on{" "}
              {recommendations.nextScheduledTask.dueDate}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recommendations.tasks.map((task, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  {task.name}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground">{task.description}</p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Conditions:</h4>
                <ul className="space-y-1 text-sm">
                  {task.conditions.map((condition, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 ${
                        condition.met ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {condition.met ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {condition.text}
                    </li>
                  ))}
                </ul>
              </div>

              {task.products && task.products.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recommended Products:</h4>
                  <ul className="space-y-2">
                    {task.products.map((product, idx) => (
                      <li key={idx} className="text-sm">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-muted-foreground"> - {product.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}