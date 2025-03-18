import '@testing-library/jest-dom';
import { server } from '@/mocks/server';

// Set test environment variables
process.env.CLAUDE_API_KEY = 'test-api-key';
process.env.CLAUDE_MODEL = 'claude-3-sonnet-20240229';

// Increase Jest timeout for all tests
jest.setTimeout(30000);

// Debug logging
const debug = {
  log: (...args: any[]) => console.log('[TEST DEBUG]', ...args),
  error: (...args: any[]) => console.error('[TEST ERROR]', ...args),
};

// Track server state
let isServerRunning = false;

// Establish API mocking before all tests
beforeAll(() => {
  debug.log('Starting MSW server');
  server.listen({
    onUnhandledRequest: (req) => {
      debug.error('Found an unhandled request:', {
        method: req.method,
        url: req.url.toString(),
        headers: Object.fromEntries(req.headers.entries()),
      });
    },
  });
  isServerRunning = true;
  debug.log('MSW server started');
});

// Reset handlers between tests
afterEach(() => {
  debug.log('Resetting MSW handlers');
  if (isServerRunning) {
    server.resetHandlers();
  }
  debug.log('MSW handlers reset');
});

// Clean up after the tests are finished
afterAll(() => {
  debug.log('Cleaning up MSW server');
  if (isServerRunning) {
    server.close();
    isServerRunning = false;
  }
  debug.log('MSW server cleaned up');
});

// Mock console.error to keep test output clean
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});