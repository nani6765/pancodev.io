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
const outputDir = path.join(basePath, blogConfig.contentGenerateDir);

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

async function buildMarkdownFiles() {
  const files = getFilePathsByExtension({ dirPath: contentDir, ext: "md" });

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(remarkCallout)
    .use(highlight, { prefix: "block" })
    .use(rehypeStringify);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileContent = fs.readFileSync(file, "utf-8");
    const { data: metadata, content } = matter(fileContent);

    const processedContent = await processor.process(content);
    const contentHtml = processedContent.toString();
    const readingTime = readingTimeGenerator(contentHtml);

    const relativePath = path.relative(contentDir, file);
    const outputFilePath = path.join(
      outputDir,
      `${relativePath.replace(/\.md$/, ".json")}`
    );

    ensureDirectoryExistence(outputFilePath);

    const output = {
      metadata: {
        ...metadata,
        index: i,
        readingTime: readingTime.text,
      },
      contentHtml,
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
  }
}

export default buildMarkdownFiles;
