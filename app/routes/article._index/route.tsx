import { getAllArticlePath } from "@/api/getArticle";
import { useLoaderData } from "@remix-run/react";
import * as style from "./style.css";
import dayjs from "dayjs";

export const loader = async () => {
  return await getAllArticlePath();
};

function ArticleList() {
  const articles = useLoaderData<typeof loader>();
  console.log(articles);

  return (
    <div className="root-section">
      <ul>
        {articles.map(({ key, fileName, data }) => {
          return (
            <li key={key} className={style.ArticleItem}>
              <p className={style.ArticleName}>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Voluptatum aliquid, saepe dolore quam aspernatur cumque corrupti
                velit labore sapiente ex totam ipsum doloribus earum veritatis
                commodi reiciendis! Facilis, fuga maiores.
              </p>
              <span className={style.ArticleEstRead}>{fileName}</span>
              <span className={style.ArticleDate}>
                {dayjs().format("YY. MM. DD.")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ArticleList;
