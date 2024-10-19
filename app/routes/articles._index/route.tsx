import dayjs from "dayjs";
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import blogConfig from "@/blog.config.json";
import { getAllArticles } from "@/api/getArticle";
import generateMetaTag from "@/function/generateMetaTag";
import sortingArticlesByCreate from "@/function/sortingArticlesByCreate";

import * as style from "./style.css";

export const meta = () =>
  generateMetaTag({
    title: ["Articles", blogConfig.title],
    description: blogConfig.description,
    author: blogConfig.author,
    url: `${blogConfig.siteUrl}/articles`,
  });

export const loader = async () => {
  const response = await getAllArticles();
  return json(sortingArticlesByCreate(response));
};

function ArticleList() {
  const articles = useLoaderData<typeof loader>();

  return (
    <div className="root-section">
      <ul>
        {articles.map(({ metadata }) => {
          const { index, title, category, readingTime, created_at, path } =
            metadata;

          return (
            <li key={index} className={style.articleItem}>
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
