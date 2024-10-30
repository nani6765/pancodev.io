import fs from "fs-extra";
import path from "node:path";

import blogConfig from "@/blog.config.json";
import hasFileWithName from "@/function/hasFileWithName";
import getFilePathsByExtension from "@/function/getFilePathsByExtension";

const basePath = path.resolve();
const outputDir = path.join(basePath, blogConfig.contentGenerateDir);

const generateFileName = (fullPath: string) => {
  const categoryAndFilePath = fullPath.split(/[\\/]/).slice(-2);

  return `${categoryAndFilePath[0]}/${categoryAndFilePath[1].split(".")[0]}`;
};

type FlagByGetContents = "preview" | "withData";

async function getContentByPaths(paths: string[], flag: FlagByGetContents) {
  return await Promise.all(
    paths.map(async (path) => {
      if (flag === "preview") {
        return generateFileName(path);
      }

      const fileData: Content = await fs.readJSON(path);
      return fileData;
    })
  );
}

export function getAllContents(): Promise<Content[]>;
export function getAllContents(flag: "preview"): Promise<string[]>;
export function getAllContents(flag: "withData"): Promise<Content[]>;
export async function getAllContents(
  flag: "withData" | "preview" = "withData"
) {
  try {
    const paths = getFilePathsByExtension({ dirPath: outputDir, ext: "json" });
    return getContentByPaths(paths, flag);
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
}

export function getContentsByCategory(category: string): Promise<Content[]>;
export function getContentsByCategory(
  category: string,
  flag: "preview"
): Promise<string[]>;
export function getContentsByCategory(
  category: string,
  flag: "withData"
): Promise<Content[]>;
export async function getContentsByCategory(
  category: string,
  flag: "withData" | "preview" = "withData"
) {
  try {
    const paths = getFilePathsByExtension({
      dirPath: `${outputDir}/${category}`,
      ext: "json",
    });
    return getContentByPaths(paths, flag);
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
}

type GetSpecificContentParams = {
  category: string;
  title: string;
};

export async function getSpecificContent({
  category,
  title,
}: GetSpecificContentParams) {
  try {
    const hasFile = await hasFileWithName({
      dirPath: `${outputDir}/${category}`,
      name: `${title}.json`,
    });
    if (!hasFile) {
      throw new Error("no File");
    }
    const path = `${outputDir}/${category}/${title}.json`;
    const fileData: Content = await fs.readJSON(path);
    return fileData;
  } catch (error) {
    if (error instanceof Error && error.message === "no File") {
      throw new Response("This file does not exist.", { status: 500 });
    }
    throw new Response("Failed to load JSON file", { status: 500 });
  }
}
