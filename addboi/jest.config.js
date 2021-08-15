const fs = require("fs-extra");
const path = require("path");

module.exports = {
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/node_modules/**", "!**/*test*"],
  moduleNameMapper: {
    ...fs
      .readdirSync(path.join(__dirname, "src"))
      .map(path.parse)
      .reduce(
        (acc, { name }) =>
          Object.assign(acc, {
            [`^${name}(.*)$`]: path.join("<rootDir>", "src", `${name}$1`),
          }),
        {}
      ),
  },
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: [path.join("<rootDir>", "**", "*.(test|spec).(js|jsx|ts|tsx)")],
  testEnvironment: "node",
  transformIgnorePatterns: ["node_modules"],
  verbose: true,
};
