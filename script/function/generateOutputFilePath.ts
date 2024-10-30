import path from "node:path";

const generateOutputFilePath = ({
  filePath,
  inputPath,
  outputPath,
}: {
  filePath: string;
  inputPath: string;
  outputPath: string;
}) => {
  const relativePath = path.relative(inputPath, filePath);
  const outputFilePath = path.join(
    outputPath,
    `${relativePath.replace(/\.md$/, ".json")}`
  );
  return outputFilePath;
};

export default generateOutputFilePath;
