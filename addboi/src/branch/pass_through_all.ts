import { BranchCreator } from "interface";
import { createLeaf, NextResult } from "utils";

const _: BranchCreator = async ({ logger }) => {
  return {
    passThroughAll: await createLeaf(async () => ({
      next: async function (request) {
        if (request.input.type !== "context_change") {
          logger.i({ message: "Receive request", meta: request });
        }

        return NextResult.FALLTHROUGH;
      },
    })),
  };
};

export default _;
