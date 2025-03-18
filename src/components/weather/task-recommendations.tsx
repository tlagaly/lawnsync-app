import { useEffect, useState, useCallback } from "react";
import { WeatherData } from "@/lib/weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { RecommendationsResponse } from "@/types/recommendations";
import { LawnProfile } from "@/types/db";

interface TaskRecommendationsProps {
  weather: WeatherData;
  lawnProfile: Pick<LawnProfile, "grassType" | "sunExposure" | "size" | "location">;
}

export function TaskRecommendations({ weather, lawnProfile }: TaskRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: lawnProfile,
          conditions: {
            temperature: weather.temperature,
            humidity: weather.humidity,
            weather: weather.condition,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      setRecommendations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading recommendations");
      console.error(err);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [weather, lawnProfile]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleRetry = () => {
    setRetrying(true);
    fetchRecommendations();
  };

  const toggleTaskExpansion = (index: number) => {
    setExpandedTasks(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="space-y-1">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const isConfigError = error.includes('not configured');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            {isConfigError ? 'Configuration Required' : 'Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{error}</p>
          {isConfigError && (
            <div className="text-sm text-muted-foreground">
              <p>To enable AI-powered recommendations:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Get an API key from Anthropic</li>
                <li>Add CLAUDE_API_KEY to your environment variables</li>
                <li>Restart the application</li>
              </ol>
            </div>
          )}
          {!isConfigError && (
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={retrying}
            >
              <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Try Again'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!recommendations?.tasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Current Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Check back later for lawn care recommendations.</p>
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="mt-4 flex items-center gap-2"
            disabled={retrying}
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Checking...' : 'Check Now'}
          </Button>
        </CardContent>
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
            <div key={index} className="space-y-3 border-b pb-4 last:border-0 last:pb-0">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleTaskExpansion(index)}
              >
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
                {expandedTasks.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              
              {expandedTasks.includes(index) && (
                <>
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

                  {task.aiInsights && (
                    <div className="space-y-2 mt-4 bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-700">AI Insights:</h4>
                      {task.aiInsights.personalizedTips.length > 0 && (
                        <ul className="space-y-2">
                          {task.aiInsights.personalizedTips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-blue-600">
                              • {tip}
                            </li>
                          ))}
                        </ul>
                      )}
                      {task.aiInsights.seasonalAdvice && (
                        <p className="text-sm text-blue-600 mt-2">
                          <strong>Seasonal Note:</strong> {task.aiInsights.seasonalAdvice}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}