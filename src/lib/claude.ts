import { ClaudeRequest, ClaudeResponse, ClaudeError } from "../types/claude";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

/**
 * Service for interacting with Claude AI API
 */
export class ClaudeService {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, model = "claude-3-sonnet-20240229") {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    this.defaultModel = model;
  }

  /**
   * Generate lawn care recommendations based on profile and conditions
   */
  async generateRecommendation(
    profile: {
      size: number;
      grassType: string;
      sunExposure: string;
      location: string;
    },
    conditions: {
      temperature: number;
      humidity: number;
      weather: string;
    }
  ): Promise<string> {
    // Validate input
    if (profile.size <= 0) {
      throw new Error("Invalid lawn size");
    }

    const prompt = `As a lawn care expert, provide recommendations for this lawn:

Lawn Profile:
- Size: ${profile.size} sq ft
- Grass Type: ${profile.grassType}
- Sun Exposure: ${profile.sunExposure}
- Location: ${profile.location}

Current Conditions:
- Temperature: ${conditions.temperature}°F
- Humidity: ${conditions.humidity}%
- Weather: ${conditions.weather}

Please provide specific recommendations for:
1. Immediate care based on current conditions
2. Maintenance tasks that should be performed
3. Weather-related adjustments to normal care routines`;

    const response = await this.sendMessage(prompt);
    return response.content[0].text;
  }

  /**
   * Send a message to Claude API
   */
  private async sendMessage(content: string): Promise<ClaudeResponse> {
    const request: ClaudeRequest = {
      model: this.defaultModel,
      messages: [{ role: "user", content }],
      max_tokens: 1024,
      temperature: 0.7,
    };

    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(request),
        // Disable response cloning in development
        ...(process.env.NODE_ENV === 'test' && {
          duplex: 'half',
          cache: 'no-store',
        }),
      });

      // Handle network errors (status 0)
      if (response.status === 0) {
        throw new Error("Network error");
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Network error");
      }

      if (!response.ok) {
        throw new ClaudeError(
          data.error?.type || "UnknownError",
          data.error?.message || "Unknown error occurred"
        );
      }

      // Validate response format
      if (!data.content?.[0]?.text) {
        throw new Error("Invalid response format");
      }

      return data as ClaudeResponse;
    } catch (error) {
      if (error instanceof ClaudeError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.message === "Network error" || error.message.includes("Failed to fetch")) {
          throw new Error("Network error");
        }
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }
}

// Export singleton instance only in non-test environments
export const claudeService = process.env.NODE_ENV !== 'test' 
  ? new ClaudeService(process.env.CLAUDE_API_KEY || "")
  : undefined;