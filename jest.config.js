module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1",
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    }
  };
  