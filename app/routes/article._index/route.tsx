import { getAllArticle } from "@/api/getArticle";
import { Link, useLoaderData } from "@remix-run/react";
import * as style from "./style.css";
import dayjs from "dayjs";

export const loader = async () => {
  return await getAllArticle();
};

function ArticleList() {
  const articles = useLoaderData<typeof loader>();

  return (
    <div className="root-section">
      <ul>
        {articles.map(({ key, fileName, data }) => {
          return (
            <li key={key} className={style.articleItem}>
              <Link to="/article/react/test" className={style.articleLink}>
                <p className={style.articleName}>
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                </p>
                <span className={style.articleEstRead}>{fileName}</span>
                <span className={style.articleDate}>
                  {dayjs().format("YY. MM. DD.")}
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
