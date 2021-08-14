import { S3 } from "aws-sdk";
import axios from "axios";
import dayjs from "dayjs";
import { AmbiguousPlatform, FacebookClient, TelegramClient } from "interface";
import mimes from "mime-types";
import path from "path";
import { CONSTANTS } from "utils";

interface ImageClientArgs {
  readonly facebookClient: FacebookClient;
  readonly telegramClient: TelegramClient;
}

export default function createImageClient({
  facebookClient,
  telegramClient,
}: ImageClientArgs) {
  const s3Client = new S3({ region: "ap-southeast-1" });

  function getPhotoKeyPath({
    extension,
    targetID,
    targetPlatform,
  }: Readonly<{
    extension: string;
    targetID: number | string;
    targetPlatform: AmbiguousPlatform;
  }>) {
    const datePostfix = dayjs().format(CONSTANTS.DATE_FORM_IMAGE_NAME);
    let path = [targetPlatform, targetID, datePostfix].join("/");

    if (!!extension) {
      path = `${path}.${extension}`;
    }

    return path;
  }

  async function uploadImageFromURL({
    keyPath,
    url,
  }: Readonly<{ keyPath: string; url: string }>) {
    let { data: fileStream } = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    await s3Client
      .upload({
        Body: fileStream,
        Bucket: process.env.AWS_ASSET_BUCKET_NAME || "",
        ContentType: mimes.lookup(url) || "text/plain",
        Key: keyPath,
      })
      .promise();

    const fileURL = [process.env.AWS_ASSET_CDN_HOST || "", keyPath].join("/");
    return { fileURL };
  }

  async function uploadImageToFacebookStorage({
    reusable,
    imageURL,
  }: Readonly<{ imageURL: string; reusable: boolean }>) {
    const {
      attachmentID: facebookAttachmentID,
    } = await facebookClient.uploadAttachment({
      reusable,
      type: "image",
      url: imageURL,
    });

    return { facebookAttachmentID };
  }

  return {
    uploadImageToCommonStorage: async function ({
      imageURL,
      ...args
    }: Pick<
      Parameters<typeof getPhotoKeyPath>[0],
      "targetID" | "targetPlatform"
    > &
      Readonly<{ imageURL: string }>) {
      /** Facebook image URLs have some weird query params */
      const pathName = new URL(imageURL).pathname;
      const extension = path.extname(pathName).slice(1);
      const keyPath = getPhotoKeyPath({ ...args, extension });
      return uploadImageFromURL({ keyPath, url: imageURL });
    },
    uploadTelegramImageToCommonStorage: async function ({
      imageID,
      shouldSaveFacebookImage = false,
      ...args
    }: Pick<Parameters<typeof getPhotoKeyPath>[0], "targetID"> &
      Readonly<{ imageID: string; shouldSaveFacebookImage?: boolean }>) {
      const telegramFileURL = await telegramClient.getFileURLFromID(imageID);
      const extension = path.extname(telegramFileURL).slice(1);

      const keyPath = getPhotoKeyPath({
        ...args,
        extension,
        targetPlatform: "telegram",
      });

      const { fileURL } = await uploadImageFromURL({
        keyPath,
        url: telegramFileURL,
      });

      if (shouldSaveFacebookImage) {
        const { facebookAttachmentID } = await uploadImageToFacebookStorage({
          imageURL: fileURL,
          reusable: true,
        });

        return { facebookAttachmentID, fileURL };
      }

      return { fileURL };
    },
  };
}
