import dayjs from "dayjs";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import blogConfig from "@/blog.config.json";
import generateMetaTag from "@/function/generateMetaTag";
import { article_generate_dir, getContentsInDir } from "@/api/getContent";
import sortingContentsByCreate from "@/function/sortingContentsByCreate";

import * as style from "@commonStyle/list.css";

export const loader = async () => {
  const response = await getContentsInDir<Article>({
    dirPath: article_generate_dir,
  });
  return json(sortingContentsByCreate(response));
};

export const meta = () =>
  generateMetaTag({
    title: ["Articles", blogConfig.title],
    description: blogConfig.article_description,
    author: blogConfig.author,
    url: `${blogConfig.siteUrl}/articles`,
  });

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
