import dayjs from "dayjs";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import blogConfig from "@/blog.config.json";
import generateMetaTag from "@/function/generateMetaTag";
import sortingContentsByCreate from "@/function/sortingContentsByCreate";
import { small_talk_generate_dir, getContentsInDir } from "@/api/getContent";

import * as style from "@commonStyle/list.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const year = new URL(request.url).searchParams.get("year");

  const response = await getContentsInDir<SmallTalk>({
    dirPath: `${small_talk_generate_dir}/${year ?? 2024}`,
  });

  return json(sortingContentsByCreate(response));
};

export const meta = () =>
  generateMetaTag({
    title: ["Articles", blogConfig.title],
    description: blogConfig.small_talk_description,
    author: blogConfig.author,
    url: `${blogConfig.siteUrl}/small_talk`,
  });

function SmallTalkList() {
  const smallTalks = useLoaderData<typeof loader>();

  return (
    <div className="root-section">
      <ul className={style.contentList}>
        {smallTalks.map(({ metadata }) => {
          const { index, title, description, created_at, path } = metadata;

          return (
            <li key={index} className={style.contentItem}>
              <Link
                to={`/small_talk/${dayjs(created_at).format("YYYY")}/${path}`}
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
