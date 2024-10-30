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

import blogConfig from "@/blog.config.json";
import { remarkCallout } from "./remarkPlugins";
import getFilePathsByExtension from "@/function/getFilePathsByExtension";

const basePath = path.resolve();
const contentDir = path.join(basePath, blogConfig.contentDir);
const contentGenerateDir = path.join(basePath, blogConfig.contentGenerateDir);
const smallTalkDir = path.join(basePath, blogConfig.smallTalkDir);
const smallTalkGenerateDir = path.join(
  basePath,
  blogConfig.smallTalkGenerateDir
);

const paths = [
  {
    input: contentDir,
    output: contentGenerateDir,
  },
  { input: smallTalkDir, output: smallTalkGenerateDir },
];

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
  withReadingTime = true,
}: {
  outputFilePath: string;
  metadata: { [key: string]: any };
  index: number;
  contentHtml: string;
  withReadingTime?: boolean;
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

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(remarkCallout)
  .use(highlight, { prefix: "block" })
  .use(rehypeStringify);

async function buildMarkdownFiles({
  inputPath,
  outputPath,
  withReadingTime,
}: {
  inputPath: string;
  outputPath: string;
  withReadingTime: boolean;
}) {
  for (const { input, output } of paths) {
    const files = getFilePathsByExtension({ dirPath: input, ext: "md" });

    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data: metadata, content } = matter(fileContent);

      const processedContent = await processor.process(content);
      const relativePath = path.relative(input, filePath);

      await writeJsonFile({
        outputFilePath: path.join(
          output,
          `${relativePath.replace(/\.md$/, ".json")}`
        ),
        metadata,
        index: i,
        contentHtml: processedContent.toString(),
      });
    }
  }
}

export default buildMarkdownFiles;
