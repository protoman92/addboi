import { extractNumbersFromImageContents } from "./utils";

describe("Utilities", () => {
  it("Extract numbers of image contents should work", () => {
    // Setup
    expect(extractNumbersFromImageContents(["1a2b3d410:142:41 PM"])).toEqual([
      1,
      2,
      3,
      4,
    ]);
  });
});
