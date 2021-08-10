import { Calculator } from "client/state_machine";
import { BranchCreator } from "interface";
import { CONSTANTS, createLeaf, NextResult } from "utils";

const _: BranchCreator = async ({ stateMachine }) => {
  return {
    triggerCalculator: await createLeaf(async (observer) => ({
      next: async ({ input, targetID, targetPlatform }) => {
        if (
          input.type !== "command" ||
          input.command !== CONSTANTS.COMMAND_CALCULATE ||
          !!input.text
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
                Calculator.State.STARTED
              ),
            },
          },
          output: [],
        });

        return NextResult.BREAK;
      },
    })),
    onCalculatorCompleteTrigger: await createLeaf(async (observer) => ({
      next: async ({ input, targetID, targetPlatform }) => {
        if (
          input.type !== "context_change" ||
          input.changedContext.inputFlow?.state !== Calculator.State.COMPLETED
        ) {
          return NextResult.FALLTHROUGH;
        }

        await observer.next({
          targetID,
          targetPlatform,
          additionalContext: { inputFlow: undefined },
          output: [],
        });

        return NextResult.BREAK;
      },
    })),
  };
};

export default _;
