/** @type {import('jest').Config} */
module.exports = {
  // Pure-TS unit tests for the conjugation engine. Does not run React Native
  // components — for those, switch to the `jest-expo` preset.
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Sentry imports native modules at load time; stub it for node tests.
    '^@sentry/react-native$': '<rootDir>/__tests__/mocks/sentry.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        target: 'es2020',
        module: 'commonjs',
        strict: true,
        paths: { '@/*': ['./*'] },
        baseUrl: '.',
      },
    }],
  },
};
