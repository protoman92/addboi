import { BranchCreator } from "interface";
import { CONSTANTS, createLeaf, NextResult } from "utils";

const _: BranchCreator = async ({ content }) => {
  return {
    introduction: await createLeaf(async (observer) => ({
      next: async function ({ input, targetID, targetPlatform }) {
        if (
          input.type !== "command" ||
          input.command !== CONSTANTS.COMMAND_START
        ) {
          return NextResult.FALLTHROUGH;
        }

        await observer.next({
          targetID,
          targetPlatform,
          output: [
            {
              content: {
                text: content.get({ key: "introduction__message" }),
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
