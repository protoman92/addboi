import vision from "@google-cloud/vision";
import { backOff } from "exponential-backoff";
import { Request, Response } from "express";
let annotatorClient = new vision.ImageAnnotatorClient();

export async function textAnnotation({ body }: Request, response: Response) {
  const result = await backOff(() => annotatorClient.annotateImage(body), {
    numOfAttempts: 3,
  });

  response.json(result);
}
