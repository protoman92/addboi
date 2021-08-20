import { BranchCreator } from "interface";
import { createLeaf, NextResult } from "utils";

const _: BranchCreator = async ({}) => {
  return {
    passThroughAll: await createLeaf(async () => ({
      next: async function ({}) {
        return NextResult.FALLTHROUGH;
      },
    })),
  };
};

export default _;
