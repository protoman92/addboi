// @ts-check
const dotenv = require("dotenv");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const fs = require("fs-extra");
const path = require("path");
const slsw = require("serverless-webpack");
const { DefinePlugin } = require("webpack");
const merge = require("webpack-merge");
const parseArgs = require("yargs-parser");
const {
  constructEnvVars,
} = require("./chatbot-engine/src/bootstrap/javascript-helper/build_utils");
const getServerlessConfig = require("./chatbot-engine/src/bootstrap/javascript-helper/serverless/aws/webpack.config");
const { infrastructure } = parseArgs(process.argv);
const { ENVIRONMENT = "local" } = process.env;

const {
  resolve: serverlessResolve = {},
  ...serverlessConfig
} = getServerlessConfig({
  infrastructure,
  slsw,
  dirname: __dirname,
  serverOverrides: { entry: path.join(__dirname, "src", "index.ts") },
});

const { ...extraEnv } = constructEnvVars({
  additionalEnv: {
    ...dotenv.config({
      encoding: "utf-8",
      debug: true,
      path: path.join(__dirname, `.env.${ENVIRONMENT}`),
    }).parsed,
  },
  requiredKeys: [
    "FACEBOOK_API_VERSION",
    "FACEBOOK_PAGE_TOKEN",
    "TELEGRAM_AUTH_TOKEN",
    "TELEGRAM_WEBHOOK_URL",
    "WIT_AUTHORIZATION_TOKEN",
  ],
});

const rootFiles = fs.readdirSync(path.join(__dirname, "src"));

module.exports = merge(serverlessConfig, {
  module: {
    rules: [
      {
        test: /src\/.*\/.*\.json$/,
        loader: "file-loader",
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: { transpileOnly: true },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: path.join(__dirname, "tsconfig.json"),
    }),
    new DefinePlugin({
      "process.env": Object.entries(extraEnv).reduce(
        (acc, [k, v]) => Object.assign(acc, { [k]: JSON.stringify(v) }),
        {}
      ),
    }),
  ],
  resolve: {
    ...serverlessResolve,
    alias: {
      ...serverlessResolve.alias,
      ...rootFiles
        .map(path.parse)
        .reduce(
          (acc, { name }) =>
            Object.assign(acc, { [name]: path.join(__dirname, "src", name) }),
          {}
        ),
    },
    extensions: [".ts", ".js", ".json"],
  },
});
