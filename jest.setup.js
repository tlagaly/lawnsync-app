// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Web API imports
import { fetch, Request, Response, Headers } from 'undici';

// Make web API available globally
Object.assign(global, { 
  fetch, 
  Request, 
  Response, 
  Headers
});

// MSW Setup
import { server } from './src/mocks/server';

beforeAll(async () => {
  // Enable API mocking before tests
  await server.listen({ onUnhandledRequest: 'error' });
});

afterEach(async () => {
  // Reset request handlers between tests
  await server.resetHandlers();
});

afterAll(async () => {
  // Clean up after tests
  await server.close();
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
}));

// Mock environment variables
process.env.OPENWEATHER_API_KEY = 'test-api-key';