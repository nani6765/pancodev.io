import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import highlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import readingTimeGenerator from "reading-time";

import { remarkCallout } from "./remarkPlugins";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(remarkCallout)
  .use(highlight, { prefix: "block" })
  .use(rehypeStringify);

const extractFileName = (filePath: string) => {
  const splitPaths = filePath.split(/[\\/]/);
  // .md제거
  return splitPaths[splitPaths.length - 1].slice(0, -3);
};

const generateJsonContent = async ({
  files,
  index,
}: {
  files: JsonFile[];
  index: number;
}) => {
  const target = files[index];
  const { filePath, metadata, content } = target;

  const processedContent = await processor.process(content);
  const contentHtml = processedContent.toString();

  const { text } = readingTimeGenerator(contentHtml);

  return {
    contentHtml,
    metadata: {
      ...metadata,
      index,
      path: extractFileName(filePath),
      readingTime: text,
    },
  };
};

export default generateJsonContent;
