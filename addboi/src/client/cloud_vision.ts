import { TextAnnotationResult } from "../../../cloud_vision/interface";
import createAuthClient from "../../../javascript-helper/client/google_svc_acct_auth_client";

function createCloudVisionClient() {
  const authClient = createAuthClient({
    scopes: ["https://www.googleapis.com/auth/cloud-vision"],
  });

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
        url: process.env.GOOGLE_API_PROXY_CLOUD_VISION_TEXT_ANNOTATION_URL,
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

export default createCloudVisionClient();
