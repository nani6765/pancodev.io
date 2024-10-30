import fs from "fs-extra";
import path from "node:path";

import blogConfig from "@/blog.config.json";
import hasFileWithName from "@/function/hasFileWithName";
import getFilePathsByExtension from "@/function/getFilePathsByExtension";

const basePath = path.resolve();
export const defaultGenerateDir = path.join(
  basePath,
  blogConfig.default_generate_dir
);
export const articleGenerateDir = path.join(
  basePath,
  blogConfig.articleGenerateDir
);
export const smallTalkGenerateDir = path.join(
  basePath,
  blogConfig.smallTalkGenerateDir
);

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

export function getContentsInDir({
  dirPath,
}: {
  dirPath: string;
}): Promise<Content[]>;
export function getContentsInDir({
  dirPath,
  flag,
}: {
  dirPath: string;
  flag: "preview";
}): Promise<string[]>;
export function getContentsInDir({
  dirPath,
  flag,
}: {
  dirPath: string;
  flag: "withData";
}): Promise<Content[]>;
export async function getContentsInDir({
  dirPath,
  flag = "withData",
}: {
  dirPath: string;
  flag?: FlagByGetContents;
}) {
  try {
    const paths = getFilePathsByExtension({
      dirPath: dirPath,
      ext: "json",
    });
    return getContentByPaths(paths, flag);
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
}

type GetSpecificContentParams = {
  dirPath: string;
  title: string;
};

export async function getSpecificContent({
  dirPath,
  title,
}: GetSpecificContentParams) {
  try {
    const hasFile = await hasFileWithName({
      dirPath,
      name: `${title}.json`,
    });
    if (!hasFile) {
      throw new Error("no File");
    }
    const path = `${dirPath}/${title}.json`;
    const fileData: Content = await fs.readJSON(path);
    return fileData;
  } catch (error) {
    if (error instanceof Error && error.message === "no File") {
      throw new Response("This file does not exist.", { status: 500 });
    }
    throw new Response("Failed to load JSON file", { status: 500 });
  }
}
