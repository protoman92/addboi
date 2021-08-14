// @ts-check
const fs = require("fs-extra");
const path = require("path");
const { DefinePlugin } = require("webpack");
const merge = require("webpack-merge");
const { constructEnvVars } = require("../javascript-helper/build_utils");
const getServerlessConfig = require("../javascript-helper/serverless/gcp/webpack.config");
const { ENVIRONMENT } = process.env;

const extraEnv = constructEnvVars({ requiredKeys: [] });

const serverlessConfig = getServerlessConfig({
  dirname: __dirname,
  infrastructure: "serverless",
});

const rootFiles = fs.readdirSync(path.join(__dirname, "src"));

const webpackConfig = merge(serverlessConfig, {
  entry: [path.join(__dirname, "src", "index.ts")],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: { transpileOnly: true },
      },
      {
        test: /\.map$/,
        use: ["source-map-loader"],
        enforce: "pre",
      },
    ],
  },
  mode: ENVIRONMENT === "production" ? "production" : "development",
  optimization: { minimize: true },
  output: { filename: "index.js" },
  plugins: [
    new DefinePlugin({
      "process.env2": Object.entries(extraEnv).reduce(
        (acc, [k, v]) => Object.assign(acc, { [k]: JSON.stringify(v) }),
        {}
      ),
    }),
  ],
  resolve: {
    alias: {
      ...rootFiles.map(path.parse).reduce((acc, { name }) => {
        return Object.assign(acc, {
          [name]: path.join(__dirname, "src", name),
        });
      }, {}),
    },
    extensions: [".ts", ".js", ".json"],
  },
});

module.exports = webpackConfig;
