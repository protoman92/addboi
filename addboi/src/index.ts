import { config as AWSConfig } from "aws-sdk";
import createBranches from "branch";
import createCloudVisionClient from "client/cloud_vision";
import createImageClient from "client/image_client";
import createStateMachine from "client/state_machine";
import express from "express";
import { Context, ResolverArgs } from "interface";
import {
  CONSTANTS,
  injectContextOnReceive,
  saveContextOnSend,
  saveFacebookUser,
  saveTelegramUser,
  setTypingIndicator,
} from "utils";
import createChatbotRouter from "../../chatbot-engine/src/bootstrap";
import dynamoDBContextDAO from "../../chatbot-engine/src/context/DynamoDBContextDAO";
import createLogger from "../../javascript-helper/client/logger";
import serverless from "../../javascript-helper/serverless/aws";
import { analyzeError } from "../../javascript-helper/utils";

if (!!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY) {
  AWSConfig.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-southeast-1",
  });
} else {
  AWSConfig.update({ region: "ap-southeast-1" });
}

const logger = createLogger();

const chatbotRouter = createChatbotRouter<Context, ResolverArgs>({
  getChatbotBootstrapArgs: ({ facebookClient, telegramClient }) => {
    const { contextDAO } = dynamoDBContextDAO<Context>();

    return {
      contextDAO,
      createBranches,
      cloudVision: createCloudVisionClient(),
      formatErrorMessage: (error) => error.message,
      imageClient: createImageClient({ facebookClient, telegramClient }),
      leafSelectorType: "default",
      onLeafCatchAll: async () => {},
      onWebhookError: async ({ error, ...meta }) => {
        logger.e({ error, meta, message: "Webhook error" });
      },
      stateMachine: createStateMachine(),
      facebookMessageProcessorMiddlewares: [
        injectContextOnReceive({ contextDAO }),
        saveContextOnSend({ contextDAO }),
        setTypingIndicator({ client: facebookClient }),
        saveFacebookUser({
          contextDAO,
          client: facebookClient,
          saveUser: async (user) => {
            return {
              additionalContext: { platformUser: user },
              targetUserID: user.id.toString(),
            };
          },
        }),
      ],
      telegramMessageProcessorMiddlewares: [
        injectContextOnReceive({ contextDAO }),
        saveContextOnSend({ contextDAO }),
        setTypingIndicator({ client: telegramClient }),
        saveTelegramUser({
          contextDAO,
          saveUser: async (user) => {
            return {
              additionalContext: { platformUser: user },
              telegramUserID: user.id,
            };
          },
        }),
      ],
    };
  },
  webhookTimeout: 25000,
});

const app = express();
app.use(chatbotRouter);

app.use(
  "/internal/*",
  (
    ...[
      {
        headers: {
          [CONSTANTS.HEADER_INTERNAL_TOKEN.toLowerCase()]: internalToken,
        },
      },
      ,
      next,
    ]
  ) => {
    let error: Error | undefined;

    if (internalToken !== process.env.INTERNAL_TOKEN) {
      error = new Error("Unexpected error");
    }

    next(error);
  }
);

app.get("/internal/env", (...[, res]) => {
  res.json({ ...process.env, ...process.env2 });
});

app.get(
  "/internal/env/:key",
  (
    ...[
      {
        params: { key },
      },
      res,
    ]
  ) => {
    res.send(process.env2[key]);
  }
);

app.get("/webhook/:platform", ({ params: { platform } }, res) => {
  res.send(`Webhook route for ${platform}`);
});

app.use(((err, req, res, next) => {
  logger.e({ error: err, meta: { req } });
  let { config, message: error, status } = analyzeError(err);
  res.status(status).json({ config, error });
}) as express.ErrorRequestHandler);

export const handler = serverless({
  defaultPort: 3000,
  initServer: async () => {
    return app;
  },
});
