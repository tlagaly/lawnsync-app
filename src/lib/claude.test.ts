import '@testing-library/jest-dom';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { claudeHandlers } from '../mocks/handlers/claude';
import { ClaudeService } from './claude';

type LogFunction = (message: string, ...args: any[]) => void;

// Debug logging
const debug = {
  log: ((message, ...args) => console.log('[DEBUG]', message, ...args)) as LogFunction,
  error: ((message, ...args) => console.error('[DEBUG ERROR]', message, ...args)) as LogFunction,
};

// Test fixtures
const testProfile = {
  size: 5000,
  grassType: 'Kentucky Bluegrass',
  sunExposure: 'Full Sun',
  location: '12345',
};

const testConditions = {
  temperature: 85,
  humidity: 60,
  weather: 'Sunny',
};

const server = setupServer(...claudeHandlers);

// Enable API mocking
beforeAll(() => {
  debug.log('Starting MSW server');
  server.listen({
    onUnhandledRequest: (req) => {
      debug.error('Found an unhandled request:', req.method, req.url.toString());
    },
  });
  debug.log('MSW server started');
});

// Reset handlers between tests
afterEach(() => {
  debug.log('Resetting MSW handlers');
  server.resetHandlers();
  debug.log('MSW handlers reset');
});

// Clean up after tests
afterAll(() => {
  debug.log('Cleaning up MSW server');
  server.close();
  debug.log('MSW server cleaned up');
});

describe('ClaudeService', () => {
  const API_KEY = 'test-api-key';
  const DEFAULT_MODEL = 'claude-3-sonnet-20240229';

  describe('initialization', () => {
    it('should initialize with default model', () => {
      const service = new ClaudeService(API_KEY);
      expect(service).toBeInstanceOf(ClaudeService);
    });

    it('should initialize with custom model', () => {
      const customModel = 'claude-3-custom-model';
      const service = new ClaudeService(API_KEY, customModel);
      expect(service).toBeInstanceOf(ClaudeService);
    });

    it('should throw error with empty API key', () => {
      expect(() => new ClaudeService('')).toThrow('API key is required');
    });
  });

  describe('generateRecommendation', () => {
    const service = new ClaudeService(API_KEY);

    it('should generate recommendations successfully', async () => {
      debug.log('Testing successful recommendation generation');
      try {
        const result = await service.generateRecommendation(testProfile, testConditions);
        debug.log('Recommendation generated:', result);
        expect(result).toContain('Water deeply');
        expect(result).toContain('Raise mowing height');
      } catch (error) {
        debug.error('Recommendation generation failed:', error);
        throw error;
      }
    }, 30000);

    it('should handle API errors gracefully', async () => {
      debug.log('Testing API error handling');
      const invalidService = new ClaudeService('invalid-key');
      await expect(
        invalidService.generateRecommendation(testProfile, testConditions)
      ).rejects.toThrow('Invalid API key provided');
    }, 30000);

    it('should handle rate limiting', async () => {
      debug.log('Testing rate limit handling');
      const rateLimitProfile = {
        ...testProfile,
        grassType: 'rate_limit_test',
      };
      await expect(
        service.generateRecommendation(rateLimitProfile, testConditions)
      ).rejects.toThrow('Too many requests');
    }, 30000);

    it('should validate input parameters', async () => {
      debug.log('Testing input validation');
      const invalidProfile = {
        ...testProfile,
        size: -1000,
      };
      await expect(
        service.generateRecommendation(invalidProfile, testConditions)
      ).rejects.toThrow('Invalid lawn size');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      debug.log('Testing network error handling');
      const networkErrorProfile = {
        ...testProfile,
        grassType: 'network_error_test',
      };
      const service = new ClaudeService(API_KEY);
      await expect(
        service.generateRecommendation(networkErrorProfile, testConditions)
      ).rejects.toThrow('Network error');
    }, 30000);

    it('should handle malformed responses', async () => {
      debug.log('Testing malformed response handling');
      const malformedProfile = {
        ...testProfile,
        grassType: 'malformed_response_test',
      };
      const service = new ClaudeService(API_KEY);
      await expect(
        service.generateRecommendation(malformedProfile, testConditions)
      ).rejects.toThrow('Invalid response format');
    }, 30000);
  });

  describe('performance', () => {
    it('should complete within timeout', async () => {
      debug.log('Testing performance timeout');
      const service = new ClaudeService(API_KEY);
      const start = Date.now();
      await service.generateRecommendation(testProfile, testConditions);
      const duration = Date.now() - start;
      debug.log('Request duration:', duration);
      expect(duration).toBeLessThan(5000); // 5 second timeout
    }, 30000);
  });
});