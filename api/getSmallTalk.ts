import fs from "fs-extra";
import path from "node:path";

import blogConfig from "@/blog.config.json";
import hasFileWithName from "@/function/hasFileWithName";
import getFilePathsByExtension from "@/function/getFilePathsByExtension";

const basePath = path.resolve();
const outputDir = path.join(basePath, blogConfig.contentGenerateDir);

async function getSmallTalksByPaths(paths: string[]) {
  return await Promise.all(
    paths.map(async (path) => {
      const fileData: Article = await fs.readJSON(path);
      return fileData;
    })
  );
}

export function getAllSmallTalks(): Promise<Article[]>;
export async function getAllSmallTalks() {
  try {
    const paths = getFilePathsByExtension({ dirPath: outputDir, ext: "json" });
    return getSmallTalksByPaths(paths);
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
}

export async function getSpecificSmallTalk(title: string) {
  try {
    const hasFile = await hasFileWithName({
      dirPath: outputDir,
      name: `${title}.json`,
    });
    if (!hasFile) {
      throw new Error("no File");
    }
    const path = `${outputDir}/${title}.json`;
    const fileData: Article = await fs.readJSON(path);
    return fileData;
  } catch (error) {
    if (error instanceof Error && error.message === "no File") {
      throw new Response("This file does not exist.", { status: 500 });
    }
    throw new Response("Failed to load JSON file", { status: 500 });
  }
}
