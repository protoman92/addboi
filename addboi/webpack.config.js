// @ts-check
const dotenv = require("dotenv");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const fs = require("fs-extra");
const path = require("path");
const slsw = require("serverless-webpack");
const { DefinePlugin } = require("webpack");
const merge = require("webpack-merge");
const parseArgs = require("yargs-parser");
const chatbotBootstrapConfig = require("../chatbot-engine/src/bootstrap/webpack.config");
const {
  constructEnvVars,
  getLocalAWSCredentials,
} = require("../javascript-helper/build_utils");
const getServerlessConfig = require("../javascript-helper/serverless/aws/webpack.config");
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
    AWS_ASSET_BUCKET_NAME: "addboi-global-asset-origin",
    AWS_ASSET_CDN_HOST: "https://d1dpjthkmhky3z.cloudfront.net",
    GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: fs
      .readFileSync(
        path.join(
          __dirname,
          "..",
          "credential",
          "google_service_account_credentials.json"
        )
      )
      .toString("utf-8"),
    ...(ENVIRONMENT === "local"
      ? (() => {
          const {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
          } = getLocalAWSCredentials({ profile: "default" });

          return { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY };
        })()
      : {}),
  },
  optionalKeys: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
  requiredKeys: [
    "AWS_ASSET_BUCKET_NAME",
    "DYNAMO_DB_ENDPOINT",
    "DYNAMO_DB_REGION",
    "DYNAMO_DB_TABLE_NAME",
    "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS",
    "FACEBOOK_API_VERSION",
    "FACEBOOK_PAGE_TOKEN",
    "INTERNAL_TOKEN",
    "TELEGRAM_AUTH_TOKEN",
    "TELEGRAM_WEBHOOK_URL",
    "WIT_AUTHORIZATION_TOKEN",
  ],
});

const rootFiles = fs.readdirSync(path.join(__dirname, "src"));

module.exports = merge(
  serverlessConfig,
  chatbotBootstrapConfig({ env: ENVIRONMENT }),
  {
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
  }
);
