import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDir = path.join(path.resolve(), "content");
const outputDir = path.join(path.resolve(), "data");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

async function buildMarkdownFiles() {
  const files = getAllFiles(contentDir);

  for (const file of files) {
    const fileContent = fs.readFileSync(file, "utf-8");
    const { data: metadata, content } = matter(fileContent);

    const processedContent = await remark().use(html).process(content);
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
