import { TextAnnotationResult } from "../../../cloud_vision/src/interface";
import createAuthClient from "../../../javascript-helper/client/google_svc_acct_auth_client";

export default function createCloudVisionClient() {
  const authClient = createAuthClient({});

  return {
    annotateImage: async ({ imageURL }: Readonly<{ imageURL: string }>) => {
      const {
        data: [result],
      } = await authClient.request<TextAnnotationResult>({
        data: {
          image: { source: { imageUri: imageURL } },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        },
        method: "POST",
        url: process.env.CLOUD_VISION_TEXT_ANNOTATION_URL,
      });

      if (result.error != null) {
        throw result.error;
      }

      const descriptions: string[] = [];

      if (result.textAnnotations != null) {
        for (const textAnnotation of result.textAnnotations) {
          if (textAnnotation.description == null) {
            continue;
          }

          descriptions.push(textAnnotation.description);
        }
      }

      return descriptions;
    },
  };
}
