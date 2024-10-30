import path from "node:path";
import buildMarkdownFiles from "./buildMarkdownFiles";
import copyImageToPublic from "./copyImageToPublic";
import blogConfig from "@/blog.config.json";

const basePath = path.resolve();
const contentDir = path.join(basePath, blogConfig.contentDir);
const contentGenerateDir = path.join(basePath, blogConfig.contentGenerateDir);
const smallTalkDir = path.join(basePath, blogConfig.smallTalkDir);
const smallTalkGenerateDir = path.join(
  basePath,
  blogConfig.smallTalkGenerateDir
);

buildMarkdownFiles({
  inputPath: contentDir,
  outputPath: contentGenerateDir,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

buildMarkdownFiles({
  inputPath: smallTalkDir,
  outputPath: smallTalkGenerateDir,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

copyImageToPublic().catch((error) => {
  console.error(error);
  process.exit(1);
});
