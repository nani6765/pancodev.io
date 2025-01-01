import dayjs from "dayjs";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";

import blogConfig from "@/blog.config.json";
import generateMetaTag from "@/function/generateMetaTag";
import sortingContentsByCreate from "@/function/sortingContentsByCreate";
import { small_talk_generate_dir, getContentsInDir } from "@/api/getContent";

import * as style from "@commonStyle/list.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const currentYear = dayjs().year();
  const selectedYear = Number(new URL(request.url).searchParams.get("year"));
  if (!selectedYear) {
    return redirect(`/small_talk?year=${currentYear}`);
  }

  const response = await getContentsInDir<SmallTalk>({
    dirPath: `${small_talk_generate_dir}/${selectedYear ?? currentYear}`,
  });

  return json({
    smallTalks: sortingContentsByCreate(response),
    currentYear,
    selectedYear,
  });
};

export const meta = () =>
  generateMetaTag({
    title: ["Articles", blogConfig.title],
    description: blogConfig.small_talk_description,
    author: blogConfig.author,
    url: `${blogConfig.siteUrl}/small_talk`,
  });

function SmallTalkList() {
  const { smallTalks, currentYear, selectedYear } =
    useLoaderData<typeof loader>();

  const yearList = Array.from(
    new Array(currentYear - blogConfig.small_talk_start + 1),
    (_, index) => currentYear - index
  );

  return (
    <div className="root-section">
      <ul className={style.yearLinkList}>
        {yearList.map((year) => (
          <li className={style.yearLinkItem} key={year}>
            <Link
              to={`?year=${year}`}
              className={
                year === selectedYear ? style.disabledYearLink : style.yearLink
              }
            >
              {year}
            </Link>
          </li>
        ))}
      </ul>
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
