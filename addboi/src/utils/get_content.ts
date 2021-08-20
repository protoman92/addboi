import contents from "content/content.json";
import handlebars from "handlebars";

export default function getContent({
  key,
  replacements,
  ...args
}: Readonly<{
  key: keyof typeof contents;
  replacements?: Record<string, unknown>;
}> &
  Pick<CompileOptions, "noEscape">) {
  const contentValue = contents[key];
  let handlebarInput: string;

  if (Array.isArray(contentValue)) {
    const randomIndex = Math.floor(Math.random() * contentValue.length);
    handlebarInput = contentValue[randomIndex];
  } else {
    handlebarInput = contentValue;
  }

  return handlebars.compile(handlebarInput, args)(replacements);
}
