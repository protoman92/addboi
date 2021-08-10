import { BranchCreator } from "interface";
import createCalculatorBranch from "./calculator";

const _: BranchCreator = async (args) => {
  return { calculator: await createCalculatorBranch(args) };
};

export default _;
