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
      next: async (request) => {
        const { targetID, targetPlatform } = request;
        let telegramFileID: string | undefined;
        let imageURLToScan: string | undefined;
        let isImageCompressed: boolean | undefined;

        if (
          (request.targetPlatform === "telegram" &&
            request.input.type === "image" &&
            !!(telegramFileID = request.input.images[0].file_id) &&
            !!(isImageCompressed = true)) ||
          (request.input.type === "document" &&
            !!(telegramFileID = request.input.document.file_id))
        ) {
          const { fileURL } = await imageClient.uploadImageToCommonStorage({
            targetID,
            targetPlatform,
            imageURL: await telegramClient.getFileURLFromID(telegramFileID),
          });

          imageURLToScan = fileURL;
        } else if (
          request.input.type === "text" &&
          validator.isURL(request.input.text)
        ) {
          imageURLToScan = request.input.text;
        } else {
          return NextResult.FALLTHROUGH;
        }

        if (isImageCompressed) {
          await observer.next({
            targetID,
            targetPlatform,
            output: [
              {
                content: {
                  text:
                    "Looks like you sent a compressed image instead of a document. The scan result will not be as accurate.",
                  type: "text",
                },
              },
            ],
          });
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
          output: [
            {
              content: {
                text:
                  "Is this what you wanted to calculate? If not, you can copy the below text, edit it and send as a new formula",
                type: "text",
              },
            },
            ...getCrossPlatformOutput({
              telegram: [
                {
                  content: { text: formulaToCompute, type: "text" },
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
          ],
        });

        return NextResult.BREAK;
      },
    })),
  };
};

export default _;
