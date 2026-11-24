import dayjs from "dayjs";

function sortingContentsByCreate(contents: Article[]) {
  return [...contents].sort((prev, next) =>
    dayjs(next.metadata.created_at).diff(dayjs(prev.metadata.created_at), "days")
  );
}

export default sortingContentsByCreate;
