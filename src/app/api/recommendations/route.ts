import { NextRequest } from 'next/server';
import { claudeService } from '../../../lib/claude';
import { ClaudeError } from '../../../types/claude';

interface RateLimitError {
  type: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      // In tests, request.json() is available directly
      body = await request.json();
    } catch {
      // In production, we need to parse the body text
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        return Response.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
    }

    const { profile, conditions } = body;

    // Validate request body
    if (!profile || !conditions) {
      return Response.json(
        { error: 'Missing required fields: profile and conditions' },
        { status: 400 }
      );
    }

    // Validate profile fields
    const requiredProfileFields = ['size', 'grassType', 'sunExposure', 'location'];
    const missingProfileFields = requiredProfileFields.filter(
      field => !(field in profile)
    );

    if (missingProfileFields.length > 0) {
      return Response.json(
        { error: `Missing required profile fields: ${missingProfileFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate conditions fields
    const requiredConditionsFields = ['temperature', 'humidity', 'weather'];
    const missingConditionsFields = requiredConditionsFields.filter(
      field => !(field in conditions)
    );

    if (missingConditionsFields.length > 0) {
      return Response.json(
        { error: `Missing required conditions fields: ${missingConditionsFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (typeof profile.size !== 'number' || profile.size <= 0) {
      return Response.json(
        { error: 'Invalid lawn size' },
        { status: 400 }
      );
    }

    if (
      typeof conditions.temperature !== 'number' ||
      typeof conditions.humidity !== 'number' ||
      conditions.humidity < 0 ||
      conditions.humidity > 100
    ) {
      return Response.json(
        { error: 'Invalid temperature or humidity values' },
        { status: 400 }
      );
    }

    // Get recommendations from Claude
    const recommendations = await claudeService?.generateRecommendation(profile, conditions);

    if (!recommendations) {
      return Response.json(
        { error: 'Recommendation service unavailable' },
        { status: 503 }
      );
    }

    return Response.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);

    // Check if it's a rate limit error
    if (
      error &&
      typeof error === 'object' &&
      'type' in error &&
      (error as RateLimitError).type === 'rate_limit_error'
    ) {
      const rateLimitError = error as RateLimitError;
      return Response.json(
        { error: rateLimitError.message || 'Too many requests' },
        { status: 429 }
      );
    }

    // Handle other errors
    return Response.json(
      { error: 'An error occurred while generating recommendations' },
      { status: 500 }
    );
  }
}