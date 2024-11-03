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
  console.log("files : ", files);

  for (let index = 0; index < files.length; index++) {
    const { filePath, metadata: originMetadata } = files[index];

    if (
      process.env.NODE_ENV === "production" &&
      !validatePublicationDate(originMetadata["created_at"])
    ) {
      return;
    }

    try {
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
    } catch (err) {
      console.log(err);
    }
  }
};

export default buildMarkdownFiles;
