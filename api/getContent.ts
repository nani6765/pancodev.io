import fs from "fs-extra";
import path from "node:path";

import blogConfig from "@/blog.config.json";
import getFilePathsByExtension from "@/function/getFilePathsByExtension";

const basePath = path.resolve();
export const defaultGenerateDir = path.join(
  basePath,
  blogConfig.default_generate_dir,
);
export const article_generate_dir = path.join(
  basePath,
  blogConfig.article_generate_dir,
);

const generateFileName = (fullPath: string) => {
  const splitFullPath = fullPath.split(/[\\/]/).slice(-2);
  const fileName = splitFullPath[1].split(".")[0];

  return `${splitFullPath[0]}/${fileName}`;
};

type FlagByGetContents = "preview" | "withData";

// 생성된 JSON은 빌드 이후 바뀌지 않으므로 프로덕션에서는 읽은 결과를 요청 간에 재사용한다.
// 개발 중에는 `yarn generate` 재실행 결과가 바로 보이도록 매번 다시 읽는다.
const contentCache = new Map<string, Promise<unknown>>();

function readContent<T>(filePath: string): Promise<T> {
  if (process.env.NODE_ENV !== "production") {
    return fs.readJSON(filePath);
  }

  let content = contentCache.get(filePath);
  if (!content) {
    content = fs.readJSON(filePath);
    contentCache.set(filePath, content);
    content.catch(() => contentCache.delete(filePath));
  }
  return content as Promise<T>;
}

async function getContentByPaths<T>(paths: string[], flag: FlagByGetContents) {
  return await Promise.all(
    paths.map(async (path) => {
      if (flag === "preview") {
        return generateFileName(path);
      }

      return readContent<T>(path);
    }),
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
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Response("This directory does not exist.", { status: 404 });
    }
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
  const filePath = path.resolve(dirPath, `${title}.json`);
  if (!filePath.startsWith(defaultGenerateDir + path.sep)) {
    throw new Response("This file does not exist.", { status: 404 });
  }

  try {
    return await readContent<T>(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Response("This file does not exist.", { status: 404 });
    }
    throw new Response("Failed to load JSON file", { status: 500 });
  }
}
