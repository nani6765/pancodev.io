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
export const article_generate_dir = path.join(
  basePath,
  blogConfig.article_generate_dir
);
export const small_talk_generate_dir = path.join(
  basePath,
  blogConfig.small_talk_generate_dir
);

const generateFileName = (fullPath: string) => {
  const splitFullPath = fullPath.split(/[\\/]/).slice(-2);
  const fileName = splitFullPath[1].split(".")[0];

  return `${splitFullPath[0]}/${fileName}`;
};

type FlagByGetContents = "preview" | "withData";

async function getContentByPaths<T>(paths: string[], flag: FlagByGetContents) {
  return await Promise.all(
    paths.map(async (path) => {
      if (flag === "preview") {
        return generateFileName(path);
      }

      const fileData: T = await fs.readJSON(path);
      return fileData;
    })
  );
}

export function getContentsInDir<T>({
  dirPath,
}: {
  dirPath: string;
}): Promise<T[]>;
export function getContentsInDir<T>({
  dirPath,
  flag,
}: {
  dirPath: string;
  flag: "preview";
}): Promise<string[]>;
export function getContentsInDir<T>({
  dirPath,
  flag,
}: {
  dirPath: string;
  flag: "withData";
}): Promise<T[]>;
export async function getContentsInDir<T>({
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
    return getContentByPaths<T>(paths, flag);
  } catch (error) {
    console.log(error);
    throw new Response("Failed to load JSON files", { status: 500 });
  }
}

type GetSpecificContentParams = {
  dirPath: string;
  title: string;
};

export async function getSpecificContent<T>({
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
    const fileData: T = await fs.readJSON(path);
    return fileData;
  } catch (error) {
    if (error instanceof Error && error.message === "no File") {
      throw new Response("This file does not exist.", { status: 500 });
    }
    throw new Response("Failed to load JSON file", { status: 500 });
  }
}
