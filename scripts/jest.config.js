module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        '*.js',
        '!jest.config.js',
        '!__tests__/**',
        '!node_modules/**'
    ],
    coverageDirectory: '../coverage/scripts',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    verbose: true,
    clearMocks: true,
    restoreMocks: true
};
