import { Parser } from "expr-eval";
import { Context } from "interface";
import { NumberToAlphabet } from "number-to-alphabet";
import { CONSTANTS } from "utils";

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

export function isComputableFormula(formula: string) {
  return (
    !!formula &&
    formula
      .replace(/\s*/g, "")
      .match(/^(\d|\+|-|x|\*|\^|\/|:|\(|\)|\.|\!|%)+$/) != null
  );
}

export function computeFormula(formula: string) {
  try {
    const cleanedInput = formula.replace(/(x|×)/gi, "*");
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

export function substituteVariablesIntoFormula({
  formula,
  variables = {},
}: Readonly<{
  formula: string;
  variables?: Context["variables"];
}>) {
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
