import { http } from 'msw';
import { ClaudeRequest, ClaudeResponse, ClaudeErrorResponse } from '../../types/claude';

// Mock successful response
const mockClaudeResponse: ClaudeResponse = {
  id: "msg_123",
  model: "claude-3-sonnet-20240229",
  role: "assistant",
  content: [
    {
      type: "text",
      text: "Based on your lawn profile and current conditions, here are my recommendations:\n\n- Water deeply in the early morning due to high temperatures\n- Raise mowing height to reduce stress on grass\n- Consider applying heat-stress reducing products\n\nThe current weather conditions suggest focusing on moisture management."
    }
  ],
  stop_reason: "end_turn",
};

// Mock error response
const mockClaudeError: ClaudeErrorResponse = {
  error: {
    type: "invalid_request_error",
    message: "Invalid API key provided",
  },
};

// Mock rate limit response
const mockRateLimitError: ClaudeErrorResponse = {
  error: {
    type: "rate_limit_error",
    message: "Too many requests. Please try again later.",
  },
};

export const claudeHandlers = [
  // Successful request
  http.post("https://api.anthropic.com/v1/messages", async ({ request }) => {
    // Add delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 100));

    const body = await request.json() as ClaudeRequest;
    const apiKey = request.headers.get("x-api-key");

    // Handle invalid API key
    if (apiKey === 'invalid-key') {
      return new Response(JSON.stringify(mockClaudeError), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Handle missing API key
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: {
          type: "auth_error",
          message: "Missing API key",
        },
      } as ClaudeErrorResponse), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Handle missing required fields
    if (!body.messages?.length || !body.model) {
      return new Response(
        JSON.stringify({
          error: {
            type: "invalid_request_error",
            message: "Missing required fields",
          },
        } as ClaudeErrorResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Handle rate limiting
    if (body.messages[0]?.content?.includes("rate_limit_test")) {
      return new Response(JSON.stringify(mockRateLimitError), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Handle network error test
    if (body.messages[0]?.content?.includes("network_error_test")) {
      return Response.error();
    }

    // Handle malformed response test
    if (body.messages[0]?.content?.includes("malformed_response_test")) {
      return new Response(JSON.stringify({ invalid: 'response' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Return successful response
    return new Response(JSON.stringify(mockClaudeResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
];