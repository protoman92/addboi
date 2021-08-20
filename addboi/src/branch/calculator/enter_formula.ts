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
  getNextVariableName,
  isComputableFormula,
  substituteVariablesIntoFormula,
} from "./utils";

const _: BranchCreator = async ({ content, stateMachine }) => {
  function shouldComputeFormula({
    currentContext: { variables },
    input,
  }: AmbiguousRequest<Context>) {
    const state: Calculator.State.COMPUTE_FORMULA =
      Calculator.State.COMPUTE_FORMULA;

    let formula: string | undefined;

    if (
      input.type === "command" &&
      input.command === CONSTANTS.COMMAND_CALCULATE &&
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

    if (
      input.type === "context_change" &&
      input.changedContext.inputFlow?.state ===
        Calculator.State.COMPUTE_FORMULA &&
      !!(formula = input.changedContext.inputFlow.formulaToCompute)
    ) {
      return { formula, state };
    }

    return undefined;
  }

  return {
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
              {
                content: {
                  text: content.get({
                    key: "calculator__notification_not-valid-formula",
                  }),
                  type: "text",
                },
              },
            ],
          });

          return NextResult.BREAK;
        }

        const nextVariableName = getNextVariableName(request.currentContext);

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
                      {
                        payload: Postback.Payload.storeResultAsVariable({
                          result,
                          variableName: CONSTANTS.VARIABLE_NAME_FIXED,
                        }),
                        text: content.get({
                          key: "calculator__command_store-as-variable",
                          replacements: {
                            variable: CONSTANTS.VARIABLE_NAME_FIXED,
                          },
                        }),
                        type: "postback",
                      },
                      ...(nextVariableName === CONSTANTS.VARIABLE_NAME_FIXED
                        ? []
                        : [
                            {
                              payload: Postback.Payload.storeResultAsVariable({
                                result,
                                variableName: nextVariableName,
                              }),
                              text: content.get({
                                key: "calculator__command_store-as-variable",
                                replacements: { variable: nextVariableName },
                              }),
                              type: "postback" as const,
                            },
                          ]),
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
