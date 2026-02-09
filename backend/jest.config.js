export default {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['./tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/db.js',
    '!src/config/swagger.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
