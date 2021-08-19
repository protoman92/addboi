import { extractNumbersFromImageContents, getNextVariableName } from "./utils";
import { NumberToAlphabet } from "number-to-alphabet";

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
});
