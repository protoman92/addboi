import { Calculator } from "client/state_machine";
import { BranchCreator } from "interface";
import {
  createLeaf,
  getCrossPlatformOutput,
  NextResult,
  Postback,
} from "utils";

const _: BranchCreator = async ({ stateMachine }) => {
  return {
    storeResultAsVariable: await createLeaf(async (observer) => ({
      next: async ({
        currentContext: { variables },
        input,
        targetID,
        targetPlatform,
      }) => {
        let resultToStore: number | undefined;
        let variableName: string | undefined;

        if (
          input.type !== "postback" ||
          ({
            result: resultToStore,
            variableName,
          } = Postback.Extract.getResultToStoreAsVariable(input.payload)) ==
            null ||
          resultToStore == null ||
          !variableName
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
                Calculator.State.STORE_VARIABLE
              ),
            },
            variables: { ...variables, [variableName]: resultToStore },
          },
          output: getCrossPlatformOutput({
            telegram: [
              {
                content: {
                  text: `
Stored as variable "${variableName}". You can use it like <b>(${variableName} + 1) * 2</b>.
`.trim(),
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
