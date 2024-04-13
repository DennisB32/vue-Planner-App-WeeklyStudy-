module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/vue-cli',
    moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '^.+\\.js$': 'babel-jest',
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'],
    testURL: 'http://localhost/',
    modulePathIgnorePatterns: [
        '<rootDir>/node_modules/@vue/server-renderer'
      ],
  };
