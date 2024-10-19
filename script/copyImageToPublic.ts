import fb from "fast-glob";
import fs from "fs-extra";
import path from "node:path";
import blogConfig from "@/blog.config.json";

const basePath = path.resolve();
const contentDir = path.join(basePath, blogConfig.contentDir);
const destination = path.join("public", "article");

async function copyImageToPublic() {
  const images = await fb.glob(["**/*.png", "**/*.jpg", "**/*.jpeg"], {
    cwd: contentDir,
  });

  await Promise.all(
    images.map(async (image) => {
      await fs.copy(
        path.join(contentDir, image),
        path.join(destination, image)
      );
    })
  );
}

export default copyImageToPublic;
