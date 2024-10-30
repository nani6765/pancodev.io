//@see https://camchenry.com/blog/how-to-add-a-rss-feed-to-a-remix-app
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import blogConfig from "@/blog.config.json";
import { articleGenerateDir, getContentsInDir } from "@/api/getContent";

import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  /**
   * article이 구독되었을 경우에만 RSS업데이트
   */
  const articles = await getContentsInDir({ dirPath: articleGenerateDir });

  const rss = generateRss({
    title: blogConfig.title,
    description: blogConfig.description,
    link: blogConfig.siteUrl,
    entries: articles.map(({ metadata }) => ({
      title: metadata.title,
      link: `${blogConfig.siteUrl}/article/${metadata.category}/${metadata.path}`,
      pubDate: dayjs(metadata.created_at).utc().format(),
      description: metadata.description,
      author: blogConfig.author,
      guid: `${blogConfig.siteUrl}/article/${metadata.category}/${metadata.path}`,
    })),
  });

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=2419200",
    },
  });
};

type RssEntry = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  author: string;
  guid: string;
};

export function generateRss({
  description,
  entries,
  link,
  title,
}: {
  title: string;
  description: string;
  link: string;
  entries: RssEntry[];
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${title}</title>
      <description>${description}</description>
      <link>${link}</link>
      <language>en-us</language>
      <ttl>60</ttl>
      <atom:link href="https://YOUR_SITE_HERE.com/rss.xml" rel="self" type="application/rss+xml" />
      ${entries
        .map(
          (entry) => `
        <item>
          <title><![CDATA[${entry.title}]]></title>
          <description><![CDATA[${entry.description}]]></description>
          <pubDate>${entry.pubDate}</pubDate>
          <link>${entry.link}</link>
          ${entry.guid ? `<guid isPermaLink="false">${entry.guid}</guid>` : ""}
        </item>`
        )
        .join("")}
    </channel>
  </rss>`;
}
