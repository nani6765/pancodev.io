import writeJsonFile from "./function/writeJsonFile";
import generateJsonContent from "./function/generateJsonContent";
import generateOutputFilePath from "./function/generateOutputFilePath";
import validatePublicationDate from "./function/validatePublicationDate";
import prepareSortedMarkdownFiles from "./function/prepareSortedMarkdownFiles";

const buildMarkdownFiles = async ({
  inputPath,
  outputPath,
}: {
  inputPath: string;
  outputPath: string;
}) => {
  const files: JsonFile[] = prepareSortedMarkdownFiles(inputPath);
  const generateFiles = files.filter(
    ({ metadata }) =>
      process.env.NODE_ENV === "production" &&
      !validatePublicationDate(metadata["created_at"])
  );

  for (let index = 0; index < generateFiles.length; index++) {
    const { filePath } = files[index];

    const { contentHtml, metadata } = await generateJsonContent({
      files,
      index,
    });

    await writeJsonFile({
      outputFilePath: generateOutputFilePath({
        filePath,
        inputPath,
        outputPath,
      }),
      metadata,
      contentHtml,
    });
  }
};

export default buildMarkdownFiles;
