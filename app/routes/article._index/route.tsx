import dayjs from "dayjs";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getAllArticles } from "@/api/getArticle";
import * as style from "./style.css";

export const loader = async () => {
  const response = await getAllArticles();
  return json(response);
};

function ArticleList() {
  const articles = useLoaderData<typeof loader>();

  return (
    <div className="root-section">
      <ul>
        {articles.map(({ key, data }) => {
          const { metadata } = data;
          const { title, category, readingTime, created_at, path } = metadata;

          return (
            <li key={key} className={style.articleItem}>
              <Link
                to={`/article/${category}/${path}`}
                className={style.articleLink}
              >
                <p className={style.articleName}>{title}</p>
                <span className={style.articleInfo}>
                  <span>{category}</span> / <span>{readingTime}</span>
                </span>
                <span className={style.articleDate}>
                  {dayjs(created_at).format("YYYY-MM-DD")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ArticleList;
