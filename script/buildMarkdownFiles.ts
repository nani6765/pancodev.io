import dayjs from "dayjs";
import fs from "fs-extra";
import path from "node:path";

import matter from "gray-matter";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import highlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import readingTimeGenerator from "reading-time";

import { remarkCallout } from "./remarkPlugins";
import getFilePathsByExtension from "@/function/getFilePathsByExtension";

const prepareSortedMarkdownFiles = (inputPath: string) => {
  const filePaths = getFilePathsByExtension({ dirPath: inputPath, ext: "md" });
  const files = filePaths.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: metadata, content } = matter(fileContent);
    return {
      filePath,
      metadata,
      content,
    };
  });

  const sortFilesByCreatedAt = files.sort(
    ({ metadata: prevMetaData }, { metadata: nextMetaData }) => {
      const prevCreatedAt = dayjs(prevMetaData["created_at"] ?? "");
      const nextCreatedAt = dayjs(nextMetaData["created_at"] ?? "");
      return prevCreatedAt.isAfter(nextCreatedAt) ? 1 : -1;
    }
  );

  return sortFilesByCreatedAt;
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(remarkCallout)
  .use(highlight, { prefix: "block" })
  .use(rehypeStringify);

async function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    await fs.mkdirSync(dirname, { recursive: true });
  }
}

async function writeJsonFile({
  outputFilePath,
  metadata,
  index,
  contentHtml,
  withReadingTime,
}: {
  outputFilePath: string;
  metadata: { [key: string]: any };
  index: number;
  contentHtml: string;
  withReadingTime: boolean;
}) {
  const makeMetaData = () => {
    const base = {
      ...metadata,
      index,
    };
    if (withReadingTime) {
      const { text } = readingTimeGenerator(contentHtml);
      return {
        ...base,
        readingTime: text,
      };
    }
    return base;
  };

  await ensureDirectoryExistence(outputFilePath);

  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(
      {
        metadata: makeMetaData(),
        contentHtml,
      },
      null,
      2
    )
  );
}

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs();
  const publish = dayjs(createdAt);
  return today.isAfter(publish);
};

async function buildMarkdownFiles({
  inputPath,
  outputPath,
  withReadingTime = true,
}: {
  inputPath: string;
  outputPath: string;
  withReadingTime?: boolean;
}) {
  const files = prepareSortedMarkdownFiles(inputPath);

  for (let i = 0; i < files.length; i++) {
    const { filePath, metadata, content } = files[i];
    if (!validatePublicationDate(metadata["created_at"])) {
      return;
    }

    const processedContent = await processor.process(content);
    const relativePath = path.relative(inputPath, filePath);
    const outputFilePath = path.join(
      outputPath,
      `${relativePath.replace(/\.md$/, ".json")}`
    );

    const hasPrev = i !== 0;
    const hasNext = i !== files.length - 1;

    await writeJsonFile({
      outputFilePath,
      metadata: {
        ...metadata,
        prev_content_path: hasPrev ? files[i - 1].metadata["path"] : "",
        next_content_path: hasNext ? files[i + 1].metadata["path"] : "",
      },
      index: i,
      contentHtml: processedContent.toString(),
      withReadingTime,
    });
  }
}

export default buildMarkdownFiles;
