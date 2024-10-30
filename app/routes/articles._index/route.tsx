import dayjs from "dayjs";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import blogConfig from "@/blog.config.json";
import generateMetaTag from "@/function/generateMetaTag";
import { articleGenerateDir, getContentsInDir } from "@/api/getContent";
import sortingContentsByCreate from "@/function/sortingContentsByCreate";

import * as style from "@app/content/styles.css";

export const meta = () =>
  generateMetaTag({
    title: ["Articles", blogConfig.title],
    description: blogConfig.description,
    author: blogConfig.author,
    url: `${blogConfig.siteUrl}/articles`,
  });

export const loader = async () => {
  const response = await getContentsInDir({ dirPath: articleGenerateDir });
  return json(sortingContentsByCreate(response));
};

function ArticleList() {
  const articles = useLoaderData<typeof loader>();

  return (
    <div className="root-section">
      <ul className={style.contentList}>
        {articles.map(({ metadata }) => {
          const { index, title, category, readingTime, created_at, path } =
            metadata;

          return (
            <li key={index} className={style.contentItem}>
              <Link
                to={`/article/${category}/${path}`}
                className={style.contentLink}
              >
                <p className={style.contentName}>{title}</p>
                <span className={style.contentInfo}>
                  <span>{category}</span> / <span>{readingTime}</span>
                </span>
                <span className={style.contentDate}>
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
