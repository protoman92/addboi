import { BranchCreator } from "interface";
import createEnterFormulaBranch from "./enter_formula";
import createResetVariableBranch from "./reset_variable";
import createScanImageBranch from "./scan_image";
import createShowVariableBranch from "./show_variable";
import createStoreVariableBranch from "./store_variable";
import createTriggerCalculatorBranch from "./trigger_calculator";

const _: BranchCreator = async (args) => {
  return {
    triggerCalculator: await createTriggerCalculatorBranch(args),
    enterFormula: await createEnterFormulaBranch(args),
    resetVariable: await createResetVariableBranch(args),
    scanImage: await createScanImageBranch(args),
    showVariable: await createShowVariableBranch(args),
    storeVariable: await createStoreVariableBranch(args),
  };
};

export default _;
