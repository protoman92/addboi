import { BranchCreator } from "interface";
import { CONSTANTS, createLeaf, NextResult } from "utils";

const _: BranchCreator = async ({ content }) => {
  return {
    resetVariables: await createLeaf(async (observer) => ({
      next: async ({ input, targetID, targetPlatform }) => {
        if (
          input.type !== "command" ||
          input.command !== CONSTANTS.COMMAND_RESET_VARIABLES
        ) {
          return NextResult.FALLTHROUGH;
        }

        await observer.next({
          targetID,
          targetPlatform,
          additionalContext: { variables: {} },
          output: [
            {
              content: {
                text: content.get({
                  key: "calculator__notification_success-reset-variable",
                }),
                type: "text",
              },
            },
          ],
        });

        return NextResult.BREAK;
      },
    })),
  };
};

export default _;
