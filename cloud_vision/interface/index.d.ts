import { ImageAnnotatorClient } from "@google-cloud/vision";

export type TextAnnotationResult = ReturnType<
  typeof ImageAnnotatorClient["prototype"]["annotateImage"]
>;
