export default {
    testEnvironment: "node",

    testMatch: [
        "**/tests/**/*.test.js"
    ],

    clearMocks: true,

    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js",
        "!src/config/env.js"
    ]
};