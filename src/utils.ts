export {
  chunkArray,
  getCrossPlatformOutput,
  getCrossPlatformResponse,
} from "../chatbot-engine/src/common/utils";
export * from "../chatbot-engine/src/content";
export * from "../chatbot-engine/src/messenger";
export * from "../chatbot-engine/src/stream";

export const CONSTANTS = {
  COMMAND_CALCULATE: "calculate",
  COMMAND_START: "start",
  HEADER_INTERNAL_TOKEN: "X-Internal-Token",
};

export function roundAmount(amount: number) {
  return Math.round(amount * 100) / 100;
}
