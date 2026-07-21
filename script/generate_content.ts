import path from "node:path";
import buildMarkdownFiles from "./buildMarkdownFiles";
import copyImageToPublic from "./copyImageToPublic";
import blogConfig from "@/blog.config.json";

const basePath = path.resolve();
const article_dir = path.join(basePath, blogConfig.article_dir);
const article_generate_dir = path.join(
  basePath,
  blogConfig.article_generate_dir,
);

buildMarkdownFiles({
  inputPath: article_dir,
  outputPath: article_generate_dir,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

copyImageToPublic().catch((error) => {
  console.error(error);
  process.exit(1);
});
