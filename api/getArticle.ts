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

export const getAllArticle = async () => {
  try {
    const paths = getAllFiles({ dirPath: outputDir, exp: "json" });

    return await Promise.all(
      paths.map(async (path, index) => {
        const fileData = await fs.readJSON(path);
        return {
          fileName: generateFileName(path),
          key: index,
          data: fileData,
          path,
        };
      })
    );
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
};
