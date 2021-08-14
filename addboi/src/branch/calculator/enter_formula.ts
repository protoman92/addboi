import { Calculator } from "client/state_machine";
import { AmbiguousRequest, BranchCreator, Context } from "interface";
import {
  CONSTANTS,
  createLeaf,
  getCrossPlatformOutput,
  NextResult,
  Postback,
} from "utils";
import {
  computeFormula,
  isComputableFormula,
  substituteVariablesIntoFormula,
} from "./utils";

const _: BranchCreator = async ({ stateMachine }) => {
  function shouldComputeFormula({
    currentContext: { inputFlow, variables },
    input,
  }: AmbiguousRequest<Context>) {
    const state: Calculator.State.ENTER_FORMULA =
      Calculator.State.ENTER_FORMULA;

    let formula: string | undefined;

    if (
      input.type === "command" &&
      input.command === CONSTANTS.COMMAND_CALCULATE &&
      !!(formula = input.text)
    ) {
      return { formula, state };
    }

    if (
      inputFlow?.state === Calculator.State.ENTER_FORMULA &&
      input.type === "text" &&
      !!(formula = input.text)
    ) {
      return { formula, state };
    }

    if (
      input.type === "text" &&
      !!(formula = substituteVariablesIntoFormula({
        variables,
        formula: input.text,
      })) &&
      isComputableFormula(formula)
    ) {
      return { formula, state };
    }

    return undefined;
  }

  return {
    onEnterFormulaTrigger: await createLeaf(async (observer) => ({
      next: async ({ input, targetID, targetPlatform }) => {
        if (
          input.type !== "context_change" ||
          input.changedContext.inputFlow?.state !==
            Calculator.State.ENTER_FORMULA
        ) {
          return NextResult.FALLTHROUGH;
        }

        await observer.next({
          targetID,
          targetPlatform,
          output: [
            {
              content: {
                text: "Enter formula to calculate:",
                type: "text",
              },
            },
          ],
        });

        return NextResult.BREAK;
      },
    })),
    computeFormula: await createLeaf(async (observer) => ({
      next: async (request) => {
        const { targetID, targetPlatform } = request;
        let data: ReturnType<typeof shouldComputeFormula>;

        if ((data = shouldComputeFormula(request)) == null) {
          return NextResult.FALLTHROUGH;
        }

        const result = computeFormula(data.formula);

        if (result == null) {
          await observer.next({
            targetID,
            targetPlatform,
            output: [
              { content: { text: "Not a valid formula", type: "text" } },
            ],
          });

          return NextResult.BREAK;
        }

        await observer.next({
          targetID,
          targetPlatform,
          additionalContext: {
            inputFlow: {
              inputType: "calculator",
              state: await stateMachine.calculator.nextState(data.state),
            },
          },
          output: getCrossPlatformOutput({
            telegram: [
              {
                content: { text: result.toString(), type: "text" },
                quickReplies: {
                  content: [
                    [
                      // {
                      //   payload: Postback.storeResultAsVariable(result),
                      //   text: "Store as a variable",
                      //   type: "postback",
                      // },
                      {
                        payload: Postback.storeResultAsFixedVariable(result),
                        text: `Store as variable "${CONSTANTS.VARIABLE_NAME_FIXED}"`,
                        type: "postback",
                      },
                    ],
                  ],
                  type: "inline_markup",
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