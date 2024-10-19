import fs from "fs-extra";
import path from "node:path";

type GetAllFilesParams = {
  dirPath: string;
  arrayOfFiles?: string[];
  exp: string;
};

function getAllFiles({ dirPath, arrayOfFiles = [], exp }: GetAllFilesParams) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles({ dirPath: filePath, arrayOfFiles, exp });
    } else if (filePath.endsWith(exp)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

export default getAllFiles;
