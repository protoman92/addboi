import { BranchCreator } from "interface";
import createCalculatorBranch from "./calculator";
import createCatchAllBranch from "./catch_all";
import createIntroductionBranch from "./introduction";

const _: BranchCreator = async (args) => {
  return {
    calculator: await createCalculatorBranch(args),
    introduction: await createIntroductionBranch(args),
    catchAll: await createCatchAllBranch(args),
  };
};

export default _;
