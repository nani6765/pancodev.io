import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDir = path.join(path.resolve(), "content");
const outputDir = path.join(path.resolve(), "data");

async function buildMarkdownFiles() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(contentDir);

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: metadata, content } = matter(fileContent);

    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    const output = {
      metadata,
      contentHtml,
    };

    const outputFilePath = path.join(
      outputDir,
      `${path.basename(file, ".md")}.json`
    );
    fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
  }
}

// 스크립트 실행
buildMarkdownFiles().catch((error) => {
  console.error(error);
  process.exit(1);
});
