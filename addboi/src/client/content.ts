import { getContent } from "utils";

export default function createContentClient() {
  return { get: getContent };
}
