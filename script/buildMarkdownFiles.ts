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

  for (let index = 0; index < files.length; index++) {
    const { filePath, metadata: originMetadata } = files[index];

    if (
      process.env.NODE_ENV === "production" &&
      !validatePublicationDate(originMetadata["created_at"])
    ) {
      console.log("filePath : ", filePath);
      return;
    }

    const { contentHtml, metadata } = await generateJsonContent({
      files,
      index,
    });

    console.log("can i generated? : ", filePath);

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
