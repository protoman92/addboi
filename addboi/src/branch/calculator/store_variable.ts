import { Calculator } from "client/state_machine";
import { AmbiguousRequest, BranchCreator, Context } from "interface";
import {
  createLeaf,
  getCrossPlatformOutput,
  NextResult,
  Postback,
} from "utils";
import { getVariableAssignment } from "./utils";

const _: BranchCreator = async ({ content, stateMachine }) => {
  function shouldStoreVariable({ input }: AmbiguousRequest<Context>) {
    let resultToStore: number | undefined;
    let variableName: string | undefined;

    if (
      input.type === "postback" &&
      ({
        resultToStore,
        variableName,
      } = Postback.Extract.getResultToStoreAsVariable(input.payload)) == null
    ) {
    } else if (
      input.type === "text" &&
      ({ resultToStore, variableName } = getVariableAssignment(input.text)) ==
        null
    ) {
    }

    return { resultToStore, variableName };
  }

  return {
    storeResultAsVariable: await createLeaf(async (observer) => ({
      next: async (request) => {
        let resultToStore: number | undefined;
        let variableName: string | undefined;

        if (
          ({ resultToStore, variableName } = shouldStoreVariable(request)) ==
            null ||
          resultToStore == null ||
          !variableName
        ) {
          return NextResult.FALLTHROUGH;
        }

        const {
          currentContext: { variables },
          targetID,
          targetPlatform,
        } = request;

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
                  text: content.get({
                    key: "calculator__notification_success-variable-storage",
                    replacements: { variable: variableName },
                  }),
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
