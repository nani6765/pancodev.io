import fb from "fast-glob";

type HasFileWithNameParams = {
  dirPath: string;
  name: string;
};

async function hasFileWithName({ dirPath, name }: HasFileWithNameParams) {
  const response = await fb.glob(`${name}`, {
    cwd: dirPath,
  });

  return response.length > 0;
}

export default hasFileWithName;
