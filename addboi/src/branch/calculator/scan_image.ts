import { BranchCreator } from "interface";
import { createLeaf, NextResult } from "utils";
import validator from "validator";

const _: BranchCreator = async ({
  cloudVision,
  imageClient,
  telegramClient,
}) => {
  return {
    scanImage: await createLeaf(async (observer) => ({
      next: async ({ targetID, targetPlatform, input }) => {
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

        const imageContents = await cloudVision.annotateImage({
          imageURL: imageURLToScan,
        });

        await observer.next({
          targetID,
          targetPlatform,
          output: [
            { content: { text: imageContents.join("\n"), type: "text" } },
          ],
        });

        return NextResult.BREAK;
      },
    })),
  };
};

export default _;
