import dayjs from "dayjs";

function sortingArticlesByCreate(articles: Article[]) {
  return articles.sort((prev, next) => {
    const prevCreatedAt = dayjs(prev.metadata.created_at);
    const nextCreatedAt = dayjs(next.metadata.created_at);

    if (prevCreatedAt.diff(nextCreatedAt, "days") > 0) {
      return 1;
    }

    if (prevCreatedAt.diff(nextCreatedAt, "days") < 0) {
      return -1;
    }

    return 0;
  });
}

export default sortingArticlesByCreate;
