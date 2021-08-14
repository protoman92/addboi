export {
  chunkArray,
  getCrossPlatformOutput,
  getCrossPlatformResponse,
} from "../../chatbot-engine/src/common/utils";
export * from "../../chatbot-engine/src/content";
export * from "../../chatbot-engine/src/messenger";
export * from "../../chatbot-engine/src/stream";

export const CONSTANTS = {
  COMMAND_CALCULATE: "calculate",
  COMMAND_START: "start",
  COUNT_RETRY: 3,
  DATE_FORM_IMAGE_NAME: "DD-MM-YY-HH-mm-ss",
  HEADER_INTERNAL_TOKEN: "X-Internal-Token",
  POSTBACK_STORE_RESULT_AS_FIXED_VARIABLE: "storeresultfixed",
  POSTBACK_STORE_RESULT_AS_VARIABLE: "storeresult",
  VARIABLE_NAME_FIXED: "a",
};

export function roundAmount(amount: number) {
  return Math.round(amount * 100) / 100;
}

export namespace Postback {
  export function getResultToStoreAsFixedVariable(payload: string) {
    const rawResult =
      payload.match(
        new RegExp(
          `^${CONSTANTS.POSTBACK_STORE_RESULT_AS_FIXED_VARIABLE}\\|\\|\\|(?<result>.*)$`
        )
      )?.groups?.result || "";

    return parseFloat(rawResult) || undefined;
  }

  export function getResultToStoreAsVariable(payload: string) {
    const rawResult =
      payload.match(
        new RegExp(
          `^${CONSTANTS.POSTBACK_STORE_RESULT_AS_VARIABLE}\\|\\|\\|(?<result>.*)$`
        )
      )?.groups?.result || "";

    return parseFloat(rawResult) || undefined;
  }

  export function storeResultAsVariable(result: number | string) {
    return `${CONSTANTS.POSTBACK_STORE_RESULT_AS_VARIABLE}|||${result}`;
  }

  export function storeResultAsFixedVariable(result: number | string) {
    return `${CONSTANTS.POSTBACK_STORE_RESULT_AS_FIXED_VARIABLE}|||${result}`;
  }
}
