import { BranchCreator } from "interface";
import createEnterFormulaBranch from "./enter_formula";
import createStoreVariableBranch from "./store_variable";
import createTriggerCalculatorBranch from "./trigger_calculator";

const _: BranchCreator = async (args) => {
  return {
    ...(await createTriggerCalculatorBranch(args)),
    ...(await createEnterFormulaBranch(args)),
    ...(await createStoreVariableBranch(args)),
  };
};

export default _;
