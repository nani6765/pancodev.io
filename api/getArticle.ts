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

type FlagByGetArticles = "preview" | "withData";

async function getArticleByPaths(paths: string[], flag: FlagByGetArticles) {
  return await Promise.all(
    paths.map(async (path, index) => {
      if (flag === "preview") {
        return generateFileName(path);
      }

      const fileData: Article = await fs.readJSON(path);
      return fileData;
    })
  );
}

export function getAllArticles(): Promise<Article[]>;
export function getAllArticles(flag: "preview"): Promise<string[]>;
export function getAllArticles(flag: "withData"): Promise<Article[]>;
export async function getAllArticles(
  flag: "withData" | "preview" = "withData"
) {
  try {
    const paths = getFilePathsByExtension({ dirPath: outputDir, ext: "json" });
    return getArticleByPaths(paths, flag);
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
}

export function getArticlesByCategory(category: string): Promise<Article[]>;
export function getArticlesByCategory(
  category: string,
  flag: "preview"
): Promise<string[]>;
export function getArticlesByCategory(
  category: string,
  flag: "withData"
): Promise<Article[]>;
export async function getArticlesByCategory(
  category: string,
  flag: "withData" | "preview" = "withData"
) {
  try {
    const paths = getFilePathsByExtension({
      dirPath: `${outputDir}/${category}`,
      ext: "json",
    });
    return getArticleByPaths(paths, flag);
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
}

type GetSpecificArticleParams = {
  category: string;
  title: string;
};

export async function getSpecificArticle({
  category,
  title,
}: GetSpecificArticleParams) {
  try {
    const hasFile = await hasFileWithName({
      dirPath: `${outputDir}/${category}`,
      name: `${title}.json`,
    });
    if (!hasFile) {
      throw new Error("no File");
    }
    const path = `${outputDir}/${category}/${title}.json`;
    const fileData: Article = await fs.readJSON(path);
    return fileData;
  } catch (error) {
    if (error instanceof Error && error.message === "no File") {
      throw new Response("This file does not exist.", { status: 500 });
    }
    throw new Response("Failed to load JSON file", { status: 500 });
  }
}
