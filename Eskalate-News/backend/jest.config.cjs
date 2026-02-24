/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  setupFiles: ["<rootDir>/src/tests/jest.setup.ts"],
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/tests/**", "!src/server.ts"],
};

