import fs from "fs-extra";
import path from "node:path";

import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { remarkCallout } from "./remarkPlugins";
import blogConfig from "@/blog.config.json";
import getAllFiles from "@/function/getAllFiles";

const basePath = path.resolve();
const contentDir = path.join(basePath, blogConfig.contentDir);
const outputDir = path.join(basePath, blogConfig.generateDir);

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

async function buildMarkdownFiles() {
  const files = getAllFiles(contentDir);

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(remarkCallout)
    .use(rehypeStringify);

  for (const file of files) {
    const fileContent = fs.readFileSync(file, "utf-8");
    const { data: metadata, content } = matter(fileContent);

    const processedContent = await processor.process(content);
    const contentHtml = processedContent.toString();

    const relativePath = path.relative(contentDir, file);
    const outputFilePath = path.join(
      outputDir,
      `${relativePath.replace(/\.md$/, ".json")}`
    );

    ensureDirectoryExistence(outputFilePath);

    const output = {
      metadata,
      contentHtml,
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
  }
}

// 스크립트 실행
buildMarkdownFiles().catch((error) => {
  console.error(error);
  process.exit(1);
});
