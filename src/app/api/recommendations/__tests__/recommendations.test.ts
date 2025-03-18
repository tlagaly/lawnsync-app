import { NextRequest } from 'next/server';
import { POST } from '../route';
import { ClaudeService } from '../../../../lib/claude';

// Debug logging
const debug = {
  log: (message: string, ...args: any[]) => console.log('[DEBUG]', message, ...args),
  error: (message: string, ...args: any[]) => console.error('[DEBUG ERROR]', message, ...args),
};

// Mock Claude service
jest.mock('../../../../lib/claude', () => ({
  claudeService: {
    generateRecommendation: jest.fn(),
  } as unknown as ClaudeService,
}));

// Import after mocking
import { claudeService } from '../../../../lib/claude';

// Mock Response.json
const createMockResponse = (data: any, status = 200) => {
  debug.log('Creating mock response:', { data, status });
  const response = {
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    ok: status >= 200 && status < 300,
  };
  debug.log('Created response:', response);
  return response;
};

// Mock NextRequest implementation
class MockNextRequest extends NextRequest {
  private mockBody: string;

  constructor(url: string, options: { method: string; body?: any }) {
    super(url, {
      method: options.method,
    });
    this.mockBody = options.body ? 
      (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) 
      : '';
    debug.log('Created mock request:', { url, options, body: this.mockBody });
  }

  async text() {
    debug.log('Getting request text:', this.mockBody);
    return this.mockBody;
  }

  async json() {
    debug.log('Parsing request JSON');
    return JSON.parse(this.mockBody);
  }
}

// Helper function to create a request with a body
const createRequest = (body: any): NextRequest => {
  debug.log('Creating request with body:', body);
  return new MockNextRequest('http://localhost:3000/api/recommendations', {
    method: 'POST',
    body,
  });
};

// Mock Response.json globally
global.Response.json = jest.fn((data, init) => {
  debug.log('Response.json called with:', { data, init });
  return createMockResponse(data, init?.status);
}) as any;

describe('Recommendations API', () => {
  // Cast the mock to the correct type
  const mockClaudeService = (claudeService as unknown as { 
    generateRecommendation: jest.Mock<Promise<string>, [any, any]> 
  });

  const validProfile = {
    size: 5000,
    grassType: 'Kentucky Bluegrass',
    sunExposure: 'Full Sun',
    location: '12345',
  };

  const validConditions = {
    temperature: 85,
    humidity: 60,
    weather: 'Sunny',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    debug.log('Cleared all mocks');
  });

  describe('POST /api/recommendations', () => {
    it('should return recommendations for valid input', async () => {
      const mockRecommendations = 'Test recommendations';
      mockClaudeService.generateRecommendation.mockResolvedValue(mockRecommendations);
      debug.log('Set up mock recommendations:', mockRecommendations);

      const response = await POST(createRequest({
        profile: validProfile,
        conditions: validConditions,
      }));
      debug.log('Got response:', response);

      expect(response.status).toBe(200);
      const data = await response.json();
      debug.log('Parsed response data:', data);
      expect(data).toEqual({ recommendations: mockRecommendations });
      expect(mockClaudeService.generateRecommendation).toHaveBeenCalledWith(
        validProfile,
        validConditions
      );
    });

    it('should return 400 for missing profile', async () => {
      const response = await POST(createRequest({
        conditions: validConditions,
      }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required fields: profile and conditions');
    });

    it('should return 400 for missing conditions', async () => {
      const response = await POST(createRequest({
        profile: validProfile,
      }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required fields: profile and conditions');
    });

    it('should return 400 for invalid profile fields', async () => {
      const response = await POST(createRequest({
        profile: { size: 5000 }, // Missing required fields
        conditions: validConditions,
      }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required profile fields');
    });

    it('should return 400 for invalid conditions fields', async () => {
      const response = await POST(createRequest({
        profile: validProfile,
        conditions: { temperature: 85 }, // Missing required fields
      }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required conditions fields');
    });

    it('should return 400 for invalid lawn size', async () => {
      const response = await POST(createRequest({
        profile: { ...validProfile, size: -1000 },
        conditions: validConditions,
      }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid lawn size');
    });

    it('should return 400 for invalid humidity', async () => {
      const response = await POST(createRequest({
        profile: validProfile,
        conditions: { ...validConditions, humidity: 101 },
      }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid temperature or humidity values');
    });

    it('should return 503 when service is unavailable', async () => {
      mockClaudeService.generateRecommendation.mockResolvedValue('');

      const response = await POST(createRequest({
        profile: validProfile,
        conditions: validConditions,
      }));

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.error).toBe('Recommendation service unavailable');
    });

    it('should return 429 for rate limit errors', async () => {
      mockClaudeService.generateRecommendation.mockRejectedValue({
        type: 'rate_limit_error',
        message: 'Too many requests',
      });

      const response = await POST(createRequest({
        profile: validProfile,
        conditions: validConditions,
      }));

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toBe('Too many requests');
    });

    it('should return 500 for other errors', async () => {
      mockClaudeService.generateRecommendation.mockRejectedValue(new Error('Unknown error'));

      const response = await POST(createRequest({
        profile: validProfile,
        conditions: validConditions,
      }));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An error occurred while generating recommendations');
    });

    it('should return 400 for invalid JSON', async () => {
      const response = await POST(new MockNextRequest('http://localhost:3000/api/recommendations', {
        method: 'POST',
        body: 'invalid json',
      }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid JSON in request body');
    });
  });
});