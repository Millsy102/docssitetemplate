const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/tests/accessibility/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.accessibility.{test,spec}.{ts,tsx}'
  ],
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    '<rootDir>/tests/accessibility/setup-accessibility.ts'
  ],
  testEnvironment: 'jsdom',
  testTimeout: 10000,
  verbose: true,
  collectCoverage: false, // Disable coverage for accessibility tests
  coverageDirectory: undefined,
  coverageReporters: undefined,
  coverageThreshold: undefined,
  collectCoverageFrom: undefined
};
