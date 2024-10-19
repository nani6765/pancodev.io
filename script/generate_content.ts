import buildMarkdownFiles from "./buildMarkdownFiles";
import copyImageToPublic from "./copyImageToPublic";

buildMarkdownFiles().catch((error) => {
  console.error(error);
  process.exit(1);
});

copyImageToPublic().catch((error) => {
  console.error(error);
  process.exit(1);
});
