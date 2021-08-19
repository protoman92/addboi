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
  COMMAND_RESET_VARIABLES: "resetvariables",
  COMMAND_SHOW_VARIABLES: "showvariables",
  COMMAND_START: "start",
  COUNT_SHOW_VARIABLE_PAGE_SIZE: 5,
  COUNT_RETRY: 3,
  DATE_FORM_IMAGE_NAME: "DD-MM-YY-HH-mm-ss",
  HEADER_INTERNAL_TOKEN: "X-Internal-Token",
  POSTBACK_CONFIRM_CALCULATION_FROM_IMAGE: "imagecalculationyes",
  POSTBACK_GO_TO_VARIABLE_PAGE: "govarpage",
  POSTBACK_STORE_RESULT_AS_VARIABLE: "storeresult",
  VARIABLE_NAME_FIXED: "a",
};

export function tryValidateNumber(
  numberToCheck: number | null | undefined
): number | undefined {
  return numberToCheck == null || isNaN(numberToCheck)
    ? undefined
    : numberToCheck;
}

export namespace Postback {
  export namespace Extract {
    export function getDestinationVariablePage(payload: string) {
      const { destinationPage: rawDestinationPage = "" } =
        payload.match(
          new RegExp(
            `^${CONSTANTS.POSTBACK_GO_TO_VARIABLE_PAGE}\\|(?<destinationPage>.*)$`
          )
        )?.groups ?? {};

      return {
        destinationPage: tryValidateNumber(parseInt(rawDestinationPage)),
      };
    }

    export function getResultToStoreAsVariable(payload: string) {
      const { result: rawResult = "", variableName = undefined } =
        payload.match(
          new RegExp(
            `^${CONSTANTS.POSTBACK_STORE_RESULT_AS_VARIABLE}\\|(?<variableName>.*)\\|(?<result>.*)$`
          )
        )?.groups ?? {};

      return { variableName, result: tryValidateNumber(parseFloat(rawResult)) };
    }
  }

  export namespace Payload {
    export function goToVariablePage(destinationPage: number) {
      return `${CONSTANTS.POSTBACK_GO_TO_VARIABLE_PAGE}|${destinationPage}`;
    }

    export function storeResultAsVariable({
      result,
      variableName,
    }: Readonly<{ result: number | string; variableName: string }>) {
      return `${CONSTANTS.POSTBACK_STORE_RESULT_AS_VARIABLE}|${variableName}|${result}`;
    }
  }
}
