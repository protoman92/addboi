import { Parser } from "expr-eval";
import { Context } from "interface";
import { NumberToAlphabet } from "number-to-alphabet";
import { CONSTANTS, tryValidateNumber } from "utils";

export function extractNumbersFromImageContents(contents: readonly string[]) {
  const numbers: number[] = [];

  for (const content of contents) {
    const numberMatches = content
      /** Remove numbering */
      .replace(/(\d+)\)/, "")
      /** Remove timestamps */
      .replace(/(\d{1,2}:\d{1,2}\s?([AP]M)?)/g, "")
      .match(/(\d+\.?\d*)/g);

    if (numberMatches == null) {
      continue;
    }

    for (const numberMatch of numberMatches) {
      const matchedNumber = parseFloat(numberMatch);

      if (isNaN(matchedNumber)) {
        continue;
      }

      numbers.push(matchedNumber);
    }
  }

  return numbers;
}

export function computeFormula(formula: string) {
  try {
    const cleanedInput = formula
      /** Replace multiplication sign */
      .replace(/(x|×)/gi, "*")
      /** Replace division sign */
      .replace(/:/g, "/")
      /** Replace percentable sign */
      .replace(/(\d+)(%)/g, "$1 / 100");

    return Parser.evaluate(cleanedInput);
  } catch (error) {
    return undefined;
  }
}

/** Keep incrementing the variable name: a -> b -> c -> d etc */
export const getNextVariableName = (() => {
  const converter = new NumberToAlphabet();

  return ({ variables = {} }: Context) => {
    const currentVariableNames = Object.keys(variables).sort((lhs, rhs) => {
      return converter.stringToNumber(rhs) - converter.stringToNumber(lhs);
    });

    if (currentVariableNames.length === 0) {
      return CONSTANTS.VARIABLE_NAME_FIXED;
    }

    const lastVariableName = currentVariableNames[0];
    const lastVariableAlphabet = converter.stringToNumber(lastVariableName);
    const nextVariableAlphabet = lastVariableAlphabet + 1;
    return converter.numberToString(nextVariableAlphabet);
  };
})();

export function isComputableFormula(args: string) {
  return (
    !!args &&
    args.replace(/\s*/g, "").match(/^(\d|\+|-|x|\*|\^|\/|:|\(|\)|\.|\!|%)+$/) !=
      null
  );
}

export function getVariableAssignment(
  args: string
): Readonly<{ resultToStore?: number; variableName?: string }> {
  const { resultToStore = "", variableName } =
    args
      .trim()
      .match(
        /^(?<variableName>[a-z]([a-z]|\d)*)\s*=\s*(?<resultToStore>\d+(.\d+)?)$/
      )?.groups ?? {};

  return {
    variableName,
    resultToStore: tryValidateNumber(parseFloat(resultToStore)),
  };
}

export function substituteVariablesIntoFormula({
  formula,
  variables = {},
}: Readonly<{ formula: string; variables?: Context["variables"] }>) {
  /**
   * Make sure the variables with the longest names are substituted first to
   * avoid the situation where short variables are mistakenly processed (e.g.
   * variables "a" and "aaa").
   */
  const variableNames = Object.entries(variables)
    .filter(([, v]) => {
      return v != null && !isNaN(v);
    })
    .map(([k]) => {
      return k;
    })
    .sort((lhs, rhs) => {
      return rhs.length - lhs.length;
    });

  let finalFormula = formula;

  for (const variableName of variableNames) {
    finalFormula = finalFormula.replace(
      new RegExp(variableName, "g"),
      variables[variableName].toString()
    );
  }

  return finalFormula;
}
