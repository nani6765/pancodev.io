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

  const baseMetaData = {
    ...metadata,
    index,
    path: extractFileName(filePath),
  };

  const isArticleProcess = filePath.includes("article");
  if (isArticleProcess) {
    const { text } = readingTimeGenerator(contentHtml);
    return {
      contentHtml,
      metadata: { ...baseMetaData, readingTime: text },
    };
  }

  const hasPrev = index !== 0;
  const hasNext = index !== files.length - 1;

  return {
    contentHtml,
    metadata: {
      ...baseMetaData,
      prev: {
        content_path: hasPrev ? extractFileName(files[index - 1].filePath) : "",
        content_title: hasPrev ? files[index - 1].metadata["title"] : "",
      },
      next: {
        content_path: hasNext ? extractFileName(files[index + 1].filePath) : "",
        content_title: hasNext ? files[index + 1].metadata["title"] : "",
      },
      hasCloseContent: hasPrev || hasNext,
    },
  };
};

export default generateJsonContent;
