import { BranchCreator } from "interface";
import createCalculatorBranch from "./calculator";
import createCatchAllBranch from "./catch_all";
import createIntroductionBranch from "./introduction";
import createPassThroughAllBranch from "./pass_through_all";

const _: BranchCreator = async (args) => {
  return {
    passThrough: await createPassThroughAllBranch(args),
    calculator: await createCalculatorBranch(args),
    introduction: await createIntroductionBranch(args),
    catchAll: await createCatchAllBranch(args),
  };
};

export default _;
