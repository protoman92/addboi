import { BranchCreator } from "interface";
import createEnterFormulaBranch from "./enter_formula";
import createTriggerCalculatorBranch from "./trigger_calculator";

const _: BranchCreator = async (args) => {
  return {
    ...(await createTriggerCalculatorBranch(args)),
    ...(await createEnterFormulaBranch(args)),
  };
};

export default _;
