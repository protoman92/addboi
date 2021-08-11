import { BranchCreator } from "interface";
import createCalculatorBranch from "./calculator";
import createIntroductionBranch from "./introduction";

const _: BranchCreator = async (args) => {
  return {
    calculator: await createCalculatorBranch(args),
    introduction: await createIntroductionBranch(args),
  };
};

export default _;
