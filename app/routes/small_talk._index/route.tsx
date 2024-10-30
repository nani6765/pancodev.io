import dayjs from "dayjs";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import blogConfig from "@/blog.config.json";
import generateMetaTag from "@/function/generateMetaTag";
import sortingContentsByCreate from "@/function/sortingContentsByCreate";
import { smallTalkGenerateDir, getContentsInDir } from "@/api/getContent";

import * as style from "@app/content/styles.css";

export const meta = () =>
  generateMetaTag({
    title: ["Articles", blogConfig.title],
    description: blogConfig.description,
    author: blogConfig.author,
    url: `${blogConfig.siteUrl}/small_talk`,
  });

export const loader = async () => {
  const response = await getContentsInDir({ dirPath: smallTalkGenerateDir });
  return json(sortingContentsByCreate(response));
};

function SmallTalkList() {
  const smallTalks = useLoaderData<typeof loader>();
  console.log(smallTalks);
  return (
    <div className="root-section">
      <ul className={style.contentList}>
        {smallTalks.map(({ metadata }) => {
          const { index, title, category, description, created_at, path } =
            metadata;

          return (
            <li key={index} className={style.contentItem}>
              <Link
                to={`/article/${category}/${path}`}
                className={style.contentLink}
              >
                <p className={style.contentName}>{title}</p>
                <span className={style.contentInfo}>{description}</span>
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

export default SmallTalkList;
