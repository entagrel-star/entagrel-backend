module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.server.json' }]
  },
  moduleNameMapper: {
    '^xdm$': '<rootDir>/tests/__mocks__/xdm.js'
  },
  transformIgnorePatterns: ['/node_modules/(?!your-esm-package)']
};
