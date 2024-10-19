import fs from "fs-extra";
import path from "node:path";

type ListFilesByExtension = {
  dirPath: string;
  arrayOfFiles?: string[];
  ext: string;
};

function getFilePathsByExtension({
  dirPath,
  arrayOfFiles = [],
  ext,
}: ListFilesByExtension) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getFilePathsByExtension({
        dirPath: filePath,
        arrayOfFiles,
        ext,
      });
    } else if (filePath.endsWith(ext)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

export default getFilePathsByExtension;
