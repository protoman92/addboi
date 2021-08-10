import { Parser } from "expr-eval";
import { roundAmount } from "utils";

export function isComputableFormula(formula: string) {
  return (
    !!formula &&
    formula.replace(/\s*/g, "").match(/^(\d|\+|-|x|\*|\/|:|\(|\)|\.)+$/) != null
  );
}

export function computeFormula(formula: string) {
  try {
    const cleanedInput = formula.replace(/(x|×)/gi, "*");
    return roundAmount(Parser.evaluate(cleanedInput));
  } catch {
    return undefined;
  }
}
