import dayjs from "dayjs";
import fs from "fs-extra";
import matter from "gray-matter";

import getFilePathsByExtension from "@/function/getFilePathsByExtension";

const prepareSortedMarkdownFiles = (inputPath: string) => {
  const filePaths = getFilePathsByExtension({ dirPath: inputPath, ext: "md" });
  const files = filePaths.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: metadata, content } = matter(fileContent);
    return {
      filePath,
      metadata,
      content,
    };
  });

  const sortFilesByCreatedAt = files.sort(
    ({ metadata: prevMetaData }, { metadata: nextMetaData }) => {
      const prevCreatedAt = dayjs(prevMetaData["created_at"] ?? "");
      const nextCreatedAt = dayjs(nextMetaData["created_at"] ?? "");
      return prevCreatedAt.isAfter(nextCreatedAt) ? 1 : -1;
    }
  );

  return sortFilesByCreatedAt;
};

export default prepareSortedMarkdownFiles;
