import fs from "fs-extra";
import path from "node:path";

import blogConfig from "@/blog.config.json";
import getAllFiles from "@/function/getAllFiles";

const basePath = path.resolve();
const outputDir = path.join(basePath, blogConfig.generateDir);

const generateFileName = (fullPath: string) => {
  const lastElement = fullPath.split(/[\\/]/).slice(-1)[0];
  return lastElement.split(".")[0];
};

export const getFullArticle = async () => {
  try {
    const paths = getAllFiles(outputDir);
    return await Promise.all(
      paths.map(async (path) => {
        const fileData = await fs.readJSON(path);
        return {
          fileName: generateFileName(path),
          data: fileData,
        };
      })
    );
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
};
