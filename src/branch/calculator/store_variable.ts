import { Calculator } from "client/state_machine";
import { BranchCreator } from "interface";
import {
  CONSTANTS,
  createLeaf,
  getCrossPlatformOutput,
  NextResult,
  Postback,
} from "utils";

const _: BranchCreator = async ({ stateMachine }) => {
  return {
    storeAsFixedVariable: await createLeaf(async (observer) => ({
      next: async ({
        currentContext: { variables },
        input,
        targetID,
        targetPlatform,
      }) => {
        let resultToStore: number | undefined;

        if (
          input.type !== "postback" ||
          (resultToStore = Postback.getResultToStoreAsFixedVariable(
            input.payload
          )) == null
        ) {
          return NextResult.FALLTHROUGH;
        }

        await observer.next({
          targetID,
          targetPlatform,
          additionalContext: {
            inputFlow: {
              inputType: "calculator",
              state: await stateMachine.calculator.nextState(
                Calculator.State.STORE_FIXED_VARIABLE
              ),
            },
            variables: {
              ...variables,
              [CONSTANTS.VARIABLE_NAME_FIXED]: resultToStore,
            },
          },
          output: getCrossPlatformOutput({
            telegram: [
              {
                content: {
                  text: `
Stored as variable "${CONSTANTS.VARIABLE_NAME_FIXED}". You can use it like <b>(${CONSTANTS.VARIABLE_NAME_FIXED} + 1) * 2</b>.
This message will no longer be shown next time.`,
                  type: "text",
                },
              },
            ],
          })(targetPlatform),
        });

        return NextResult.BREAK;
      },
    })),
  };
};

export default _;
