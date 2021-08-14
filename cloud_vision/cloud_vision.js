"use strict";

const vision = require("@google-cloud/vision");
const annotatorClient = new vision.ImageAnnotatorClient();

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
exports.textAnnotation = async function ({ body }, response) {
  const result = await annotatorClient.annotateImage(body);
  response.json(result);
};
