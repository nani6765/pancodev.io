import fs from "fs-extra";
import path from "node:path";

import blogConfig from "@/blog.config.json";
import getFilePathsByExtension from "@/function/getFilePathsByExtension";
import hasFileWithName from "@/function/hasFileWithName";

const basePath = path.resolve();
const outputDir = path.join(basePath, blogConfig.generateDir);

const generateFileName = (fullPath: string) => {
  const lastElement = fullPath.split(/[\\/]/).slice(-1)[0];
  return lastElement.split(".")[0];
};

type ArticlePreview = {
  fileName: string;
  key: number;
};

type ArticleWithData = {
  key: number;
  data: Article;
};

type FlagByGetArticles = "preview" | "withData";

async function getArticleByPaths(paths: string[], flag: FlagByGetArticles) {
  return await Promise.all(
    paths.map(async (path, index) => {
      if (flag === "preview") {
        return {
          fileName: generateFileName(path),
          key: index,
        } as ArticlePreview;
      }

      const fileData: Article = await fs.readJSON(path);

      return {
        key: index,
        data: fileData,
      } as ArticleWithData;
    })
  );
}

export function getAllArticles(): Promise<ArticleWithData[]>;
export function getAllArticles(flag: "preview"): Promise<ArticlePreview[]>;
export function getAllArticles(flag: "withData"): Promise<ArticleWithData[]>;
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

export function getArticlesByCategory(
  category: string
): Promise<ArticleWithData[]>;
export function getArticlesByCategory(
  category: string,
  flag: "preview"
): Promise<ArticlePreview[]>;
export function getArticlesByCategory(
  category: string,
  flag: "withData"
): Promise<ArticleWithData[]>;
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

type GetSpecificArticle = {
  category: string;
  title: string;
};

export async function getSpecificArticle({
  category,
  title,
}: GetSpecificArticle) {
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
