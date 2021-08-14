import { ImageAnnotatorClient } from "@google-cloud/vision";
import { Promised } from "../../javascript-helper/interface";

export type TextAnnotationResult = Promised<
  ReturnType<typeof ImageAnnotatorClient["prototype"]["annotateImage"]>
>;
