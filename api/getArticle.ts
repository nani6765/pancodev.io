import fs from "fs-extra";
import path from "node:path";
import getAllFiles from "../function/getAllFiles";

// JSON 파일이 저장된 디렉터리
const outputDir = path.join(path.resolve(), "data");

const generateFileName = (fullPath: string) => {
  const lastElement = fullPath.split("\\").slice(-1)[0];
  return lastElement.split(".")[0];
};

// Loader 함수
export const test = async () => {
  try {
    // 디렉터리 내 모든 파일 목록 가져오기
    const paths = getAllFiles(outputDir);

    const jsonData = await Promise.all(
      paths.map(async (path) => {
        const fileData = await fs.readJSON(path);
        return {
          fileName: generateFileName(path),
          data: fileData,
        };
      })
    );

    return jsonData;
  } catch (error) {
    throw new Response("Failed to load JSON files", { status: 500 });
  }
};
