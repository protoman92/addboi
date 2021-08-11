import { config as AWSConfig } from "aws-sdk";
import createBranches from "branch";
import createStateMachine from "client/state_machine";
import express from "express";
import { Context, ResolverArgs } from "interface";
import {
  injectContextOnReceive,
  saveContextOnSend,
  setTypingIndicator,
} from "utils";
import createChatbotRouter from "../chatbot-engine/src/bootstrap";
import dynamoDBContextDAO from "../chatbot-engine/src/context/DynamoDBContextDAO";
import createLogger from "../javascript-helper/client/logger";
import serverless from "../javascript-helper/serverless/aws";

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

if (!!AWS_ACCESS_KEY_ID && !!AWS_SECRET_ACCESS_KEY) {
  AWSConfig.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: "ap-southeast-1",
  });
}

const chatbotRouter = createChatbotRouter<Context, ResolverArgs>({
  getChatbotBootstrapArgs: ({ facebookClient, telegramClient }) => {
    const { contextDAO } = dynamoDBContextDAO<Context>();
    const logger = createLogger();

    return {
      contextDAO,
      createBranches,
      formatErrorMessage: (error) => error.message,
      leafSelectorType: "default",
      onLeafCatchAll: async () => {},
      onWebhookError: async ({ error, ...meta }) => {
        logger.e({ error, meta, message: "Webhook error" });
      },
      stateMachine: createStateMachine(),
      facebookMessageProcessorMiddlewares: [
        injectContextOnReceive(contextDAO),
        saveContextOnSend(contextDAO),
        setTypingIndicator({ client: facebookClient }),
      ],
      telegramMessageProcessorMiddlewares: [
        injectContextOnReceive(contextDAO),
        saveContextOnSend(contextDAO),
        setTypingIndicator({ client: telegramClient }),
      ],
    };
  },
  webhookTimeout: 25000,
});

const app = express();
app.use(chatbotRouter);

app.get("/webhook/:platform", ({ params: { platform } }, res) => {
  res.send(`Webhook route for ${platform}`);
});

export const handler = serverless({
  defaultPort: 3000,
  initServer: async () => {
    return app;
  },
});
