import { BranchCreator } from "interface";
import { CONSTANTS, createLeaf, NextResult } from "utils";

const _: BranchCreator = async ({}) => {
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
                text: `
Welcome! Please:
- type a formula for me to calculate (e.g. (1+2)*3/4), or;
- send me a picture to detect what I can calculate.
`.trim(),
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
