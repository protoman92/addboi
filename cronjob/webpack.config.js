// @ts-check
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const slsw = require("serverless-webpack");
const { DefinePlugin } = require("webpack");
const merge = require("webpack-merge");
const { constructEnvVars } = require("../javascript-helper/build_utils");
const getServerlessConfig = require("../javascript-helper/serverless/aws/webpack.config");
const { ENVIRONMENT, PRODUCT } = process.env;

const serverlessConfig = getServerlessConfig({
  slsw,
  dirname: __dirname,
  infrastructure: "serverless",
});

const extraEnv = constructEnvVars({
  additionalEnv: {
    ...dotenv.config({
      encoding: "utf-8",
      debug: true,
      path: path.join(__dirname, `.env.${ENVIRONMENT}`),
    }).parsed,
    PRODUCT,
    NODE_ENV: ENVIRONMENT,
  },
  requiredKeys: ["ADDBOI_URL"],
});

const rootFiles = fs.readdirSync(path.join(__dirname));

module.exports = merge(serverlessConfig, {
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: { transpileOnly: true },
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      ...Object.entries(extraEnv).reduce(
        (acc, [k, v]) =>
          Object.assign(acc, { [`process.env.${k}`]: JSON.stringify(v) }),
        {}
      ),
      "process.env2": Object.entries(extraEnv).reduce(
        (acc, [k, v]) => Object.assign(acc, { [k]: JSON.stringify(v) }),
        {}
      ),
    }),
  ],
  resolve: {
    alias: {
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
