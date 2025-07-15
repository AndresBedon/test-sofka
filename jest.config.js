module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.test.ts',
    '!src/app/**/index.ts',
    '!src/app/**/*.module.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'html',
    'text-summary',
    'lcov'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!@angular|@ngrx|ngx-)'
  ],
  testEnvironment: 'jsdom'
};