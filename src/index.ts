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
import inMemoryContextDAO from "../chatbot-engine/src/context/InMemoryContextDAO";
import createLogger from "../javascript-helper/client/logger";
import serverless from "../javascript-helper/serverless/aws";

const chatbotRouter = createChatbotRouter<Context, ResolverArgs>({
  getChatbotBootstrapArgs: ({ facebookClient, telegramClient }) => {
    const contextDAO = inMemoryContextDAO<Context>();
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
