import fb from "fast-glob";

type GetAllFilesParams = {
  dirPath: string;
  name: string;
};

async function hasFileWithName({ dirPath, name }: GetAllFilesParams) {
  const response = await fb.glob(`${name}`, {
    cwd: dirPath,
  });

  return response.length > 0;
}

export default hasFileWithName;
