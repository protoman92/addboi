import { BranchCreator } from "interface";
import createEnterFormulaBranch from "./enter_formula";
import createScanImageBranch from "./scan_image";
import createStoreVariableBranch from "./store_variable";
import createTriggerCalculatorBranch from "./trigger_calculator";

const _: BranchCreator = async (args) => {
  return {
    triggerCalculator: await createTriggerCalculatorBranch(args),
    enterFormula: await createEnterFormulaBranch(args),
    scanImage: await createScanImageBranch(args),
    storeVariable: await createStoreVariableBranch(args),
  };
};

export default _;
