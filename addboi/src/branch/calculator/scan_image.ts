import { Calculator } from "client/state_machine";
import { BranchCreator } from "interface";
import {
  CONSTANTS,
  createLeaf,
  getCrossPlatformOutput,
  NextResult,
} from "utils";
import validator from "validator";
import { extractNumbersFromImageContents } from "./utils";

const _: BranchCreator = async ({
  cloudVision,
  imageClient,
  telegramClient,
}) => {
  return {
    confirmYes: await createLeaf(async (observer) => ({
      next: async ({ currentContext, input, targetID, targetPlatform }) => {
        if (
          input.type !== "postback" ||
          input.payload !== CONSTANTS.POSTBACK_CONFIRM_CALCULATION_FROM_IMAGE ||
          currentContext?.inputFlow?.state !== Calculator.State.SCAN_IMAGE
        ) {
          return NextResult.FALLTHROUGH;
        }

        await observer.next({
          targetID,
          targetPlatform,
          additionalContext: {
            inputFlow: {
              formulaToCompute: currentContext.inputFlow.formulaToCompute,
              state: Calculator.State.COMPUTE_FORMULA,
              inputType: "calculator",
            },
          },
          output: [],
        });

        return NextResult.BREAK;
      },
    })),
    scanImage: await createLeaf(async (observer) => ({
      next: async ({ input, targetID, targetPlatform }) => {
        let imageURLToScan: string | undefined;

        if (input.type === "image") {
          await observer.next({
            targetID,
            targetPlatform,
            output: [
              {
                content: {
                  text:
                    "Please send the image as a document, instead of a photo",
                  type: "text",
                },
              },
            ],
          });

          return NextResult.BREAK;
        } else if (input.type === "document") {
          const { file_id } = input.document;
          const telegramURL = await telegramClient.getFileURLFromID(file_id);

          const { fileURL } = await imageClient.uploadImageToCommonStorage({
            targetID,
            targetPlatform,
            imageURL: telegramURL,
          });

          imageURLToScan = fileURL;
        } else if (input.type === "text" && validator.isURL(input.text)) {
          imageURLToScan = input.text;
        } else {
          return NextResult.FALLTHROUGH;
        }

        const [imageContent] = await cloudVision.annotateImage({
          imageURL: imageURLToScan,
        });

        const numbersInImage = extractNumbersFromImageContents([imageContent]);
        const formulaToCompute = numbersInImage.join(" + ");

        await observer.next({
          targetID,
          targetPlatform,
          additionalContext: {
            inputFlow: {
              formulaToCompute,
              inputType: "calculator",
              state: Calculator.State.SCAN_IMAGE,
            },
          },
          output: getCrossPlatformOutput({
            telegram: [
              {
                content: {
                  text: `
Is this what you wanted to calculate?
${formulaToCompute}
            `.trim(),
                  type: "text",
                },
                quickReplies: {
                  content: [
                    [
                      {
                        payload:
                          CONSTANTS.POSTBACK_CONFIRM_CALCULATION_FROM_IMAGE,
                        text: "Yes",
                        type: "postback",
                      },
                    ],
                  ],
                  type: "inline_markup",
                },
              },
            ],
          })(targetPlatform),
        });

        return NextResult.BREAK;
      },
    })),
  };
};

export default _;
