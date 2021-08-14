import { BranchCreator } from "interface";
import { createLeaf, NextResult } from "utils";

const _: BranchCreator = async ({}) => {
  return {
    catchAll: await createLeaf(async (observer) => ({
      next: async function ({ input, targetID, targetPlatform }) {
        if (input.type === "context_change") {
          return NextResult.FALLTHROUGH;
        }

        await observer.next({
          targetID,
          targetPlatform,
          output: [
            {
              content: {
                text:
                  "Sorry, I don't know what to say. Could you try something else?",
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
