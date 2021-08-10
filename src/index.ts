import createBranches from "branch";
import createStateMachine from "client/state_machine";
import express from "express";
import { Context, ResolverArgs } from "interface";
import createChatbotRouter from "../chatbot-engine/src/bootstrap";
import serverless from "../chatbot-engine/src/bootstrap/javascript-helper/serverless/aws";
import inMemoryContextDAO from "../chatbot-engine/src/context/InMemoryContextDAO";

const chatbotRouter = createChatbotRouter<Context, ResolverArgs>({
  getChatbotBootstrapArgs: () => ({
    createBranches,
    contextDAO: inMemoryContextDAO(),
    formatErrorMessage: (error) => error.message,
    leafSelectorType: "default",
    onLeafCatchAll: async () => {},
    onWebhookError: async () => {},
    stateMachine: createStateMachine(),
  }),
  webhookTimeout: 25000,
});

const app = express();
app.use(chatbotRouter);

export const handler = serverless({
  defaultPort: 3000,
  initServer: async () => {
    return app;
  },
});
