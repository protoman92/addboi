import { NumberToAlphabet } from "number-to-alphabet";
import {
  computeFormula,
  extractNumbersFromImageContents,
  getNextVariableName,
  getVariableAssignment,
} from "./utils";

describe("Utilities", () => {
  it("Extract numbers of image contents should work", () => {
    // Setup
    // When
    // Then
    expect(extractNumbersFromImageContents(["1a2b3d410:142:41 PM"])).toEqual([
      1,
      2,
      3,
      4,
    ]);

    expect(extractNumbersFromImageContents(["1)12310:30AM"])).toEqual([123]);
  });

  it("Getting next variable name should work", () => {
    // Setup
    // When
    // Then
    expect(getNextVariableName({})).toEqual("a");
    expect(getNextVariableName({ variables: { a: 1 } })).toEqual("b");
    expect(getNextVariableName({ variables: { ab: 2, aa: 1 } })).toEqual("ac");

    const n2aConverter = new NumberToAlphabet();
    const complexVariables: Record<string, number> = {};

    for (let i = 1; i < 10000; i += 1) {
      complexVariables[n2aConverter.numberToString(i)] = i;
    }

    expect(getNextVariableName({ variables: complexVariables })).toEqual(
      n2aConverter.numberToString(10000)
    );
  });

  it("Computing formula should work", () => {
    expect(computeFormula("1+2x3*4:5X6%")).toEqual(
      1 + (((2 * 3 * 4) / 5) * 6) / 100
    );
  });
  it("Getting variable assignment should work", () => {
    // Setup
    // When
    // Then
    expect(getVariableAssignment("a=1")).toEqual({
      resultToStore: 1,
      variableName: "a",
    });

    expect(getVariableAssignment("abc = 1.1")).toEqual({
      resultToStore: 1.1,
      variableName: "abc",
    });

    expect(getVariableAssignment(" abcd =112.121 ")).toEqual({
      resultToStore: 112.121,
      variableName: "abcd",
    });

    expect(getVariableAssignment(" abc = 1.1a ")).toEqual({
      resultToStore: undefined,
      variableName: undefined,
    });

    expect(getVariableAssignment(" a1c = 120 ")).toEqual({
      resultToStore: 120,
      variableName: "a1c",
    });

    expect(getVariableAssignment(" a12 = 120 ")).toEqual({
      resultToStore: 120,
      variableName: "a12",
    });
  });
});
