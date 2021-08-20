import { config as AWSConfig, S3 } from "aws-sdk";
import createBranches from "branch";
import createCloudVisionClient from "client/cloud_vision";
import createContentClient from "client/content";
import createImageClient from "client/image_client";
import createStateMachine from "client/state_machine";
import express from "express";
import { Context, LeafDependencies } from "interface";
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

AWSConfig.update({ region: "ap-southeast-1" });
const logger = createLogger();

const { chatbotDependencies, chatbotRouter } = createChatbotRouter<
  Context,
  LeafDependencies
>({
  getChatbotBootstrapArgs: ({ facebookClient, telegramClient }) => {
    const { contextDAO } = dynamoDBContextDAO<Context>();
    const s3 = new S3({});

    return {
      contextDAO,
      createBranches,
      s3,
      cloudVision: createCloudVisionClient(),
      content: createContentClient(),
      formatErrorMessage: (error) => error.message,
      imageClient: createImageClient({ facebookClient, s3, telegramClient }),
      leafSelectorType: "default",
      messageProcessorMiddlewares: {
        facebook: [
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
        telegram: [
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
      },
      onLeafCatchAll: async () => {},
      onWebhookError: async ({ error, ...meta }) => {
        logger.e({ error, meta, message: "Webhook error" });
      },
      stateMachine: createStateMachine(),
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

app.get("/internal/asset/*", async ({ url }, res, next) => {
  try {
    const objectKey = url.slice("/internal/asset/".length);

    const { Body, ContentLength, ContentType } = await chatbotDependencies.s3
      .getObject({
        Bucket: process.env.AWS_ASSET_BUCKET_NAME || "",
        Key: objectKey,
      })
      .promise();

    if (ContentLength != null) {
      res.setHeader("Content-Length", ContentLength);
    }

    if (!!ContentType) {
      res.setHeader("Content-Type", ContentType);
    }

    res.send(Body);
  } catch (error) {
    next(error);
  }
});

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
