import fs from "fs-extra";
import path from "node:path";

const ensureDirectoryExistence = async (filePath: string) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    await fs.mkdirSync(dirname, { recursive: true });
  }
};

const writeJsonFile = async ({
  outputFilePath,
  metadata,
  contentHtml,
}: {
  outputFilePath: string;
  metadata: { [key: string]: any };
  contentHtml: string;
}) => {
  await ensureDirectoryExistence(outputFilePath);

  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(
      {
        metadata,
        contentHtml,
      },
      null,
      2
    )
  );
};

export default writeJsonFile;
