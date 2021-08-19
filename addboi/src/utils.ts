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
  COMMAND_SHOW_VARIABLES: "showvariables",
  COMMAND_START: "start",
  COUNT_RETRY: 3,
  DATE_FORM_IMAGE_NAME: "DD-MM-YY-HH-mm-ss",
  HEADER_INTERNAL_TOKEN: "X-Internal-Token",
  POSTBACK_CONFIRM_CALCULATION_FROM_IMAGE: "imagecalculationyes",
  POSTBACK_STORE_RESULT_AS_VARIABLE: "storeresult",
  VARIABLE_NAME_FIXED: "a",
};

export namespace Postback {
  export namespace Extract {
    export function getResultToStoreAsVariable(payload: string) {
      const { result: rawResult = "", variableName = undefined } =
        payload.match(
          new RegExp(
            `^${CONSTANTS.POSTBACK_STORE_RESULT_AS_VARIABLE}\\|(?<variableName>.*)\\|(?<result>.*)$`
          )
        )?.groups ?? {};

      return { variableName, result: parseFloat(rawResult) || undefined };
    }
  }

  export namespace Payload {
    export function storeResultAsVariable({
      result,
      variableName,
    }: Readonly<{ result: number | string; variableName: string }>) {
      return `${CONSTANTS.POSTBACK_STORE_RESULT_AS_VARIABLE}|${variableName}|${result}`;
    }
  }
}
