const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Setup files run before test framework setup
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  // Setup files that run after test framework initialization
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^msw/browser$': '<rootDir>/node_modules/msw/lib/browser/index.js',
    '^@mswjs/interceptors/ClientRequest$': '<rootDir>/node_modules/@mswjs/interceptors/lib/node/interceptors/ClientRequest/index.js',
    '^@mswjs/interceptors/XMLHttpRequest$': '<rootDir>/node_modules/@mswjs/interceptors/lib/node/interceptors/XMLHttpRequest/index.js',
    '^@mswjs/interceptors/fetch$': '<rootDir>/node_modules/@mswjs/interceptors/lib/node/interceptors/fetch/index.js'
  },
  testMatch: [
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,ts}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@mswjs|msw)/).+\\.js$'
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  resolver: undefined,
  // Add global mocks
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      diagnostics: {
        warnOnly: true
      }
    },
    // Set test environment
    NODE_ENV: 'test',
  },
  // Increase test timeout
  testTimeout: 30000,
  // Use swc for TypeScript compilation
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);