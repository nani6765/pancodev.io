---
title: Remix SEO 설정을 위한 sitemap, rss, robots
description: This article explains how to set up sitemap, RSS, and robots.txt for a Remix blog. It covers creating dynamic XML and text responses, leveraging Remix's routing capabilities, and ensuring proper content delivery to search engines like Google and naver.
keywords: ["sitemap", "rss", "robots"]
category: remix
path: remix-seo
created_at: 2024-10-03 19:54
---

# Remix SEO 설정을 위한 sitemap, rss, robots

[구글 Search Console](https://search.google.com/search-console/about?hl=ko)과 [네이버 서치어드바이저](https://searchadvisor.naver.com/)에 내 블로그를 등록하고, 내 블로그에 컨텐츠를 알려주기 위하여 sitemap, rss, robots를 등록 할 필요가 있었다. 해당 기능을 제공해주기 위해 가장 처음으로 고려한 것은 [remix-seo](https://www.npmjs.com/package/@balavishnuvj/remix-seo), [remix-sitemap](https://www.npmjs.com/package/remix-sitemap)과 같은 라이브러리의 도입이었다. remix-seo의 경우 3년 전에 업데이트를 마지막으로 더는 관리되고 있는 패키지였기 때문에 선뜻 선택하기 어려웠고, remix-sitemp의 경우 가이드를 확인해보니 굳이 라이브러리를 사용하지 않아도 무관하다고 판단하여 직접 컨텐츠를 제공하기로 결정했다.

#### 기본 IDEA

Remix Routing 규칙 중 [Escaping Special Characters](https://remix.run/docs/en/main/file-conventions/routes#escaping-special-characters)를 확인해보면 대괄호(`[]`)로 감싼 문자열은 특수문자라 하더라도 URL 규칙 중 일부로 사용할 수 있다. 물론 public폴더에 xml파일과 txt파일을 직접 올려 서빙할 수도 있지만 그러면 컨텐츠를 발행할때마다 xml파일을 수정해야 하기에 이 과정을 자동으로 진행해주기 위해 코드 베이스로 컨텐츠가 업데이트되면 해당 파일이 수정될 수 있도록 tsx 파일로 만들 계획이다.

[!note] 생성 할 tsx파일의 위치는 각각 다음과 같다.

- app/routes/sitemap[.]xml.tsx
- app/routes/rss[.]xml.tsx
- app/routes/robots[.]txt.tsx

#### Sitemap

```tsx
export const toXmlSitemap = (urls: string[]) => {
  const urlsAsXml = urls
    .map((url) => `<url><loc>${siteUrl}/${url}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
        <urlset
          xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
        >
          ${urlsAsXml}
        </urlset>
      `.trim();
};
```

사이트맵을 생성하는 로직의 아이디어는 위와 같다. sitemap의 기본적인 프로토콜은 [이 곳](https://www.sitemaps.org/protocol.html)에서 가져욌으며, urlset 표준은 [여기서](https://support.google.com/webmasters/thread/201480844?hl=en&msgid=201536610) 보충하였다. 현재 내가 관리하고 있는 모든 페이지의 url 정보를 담아 이를 sitemap을 위한 xml 태그로 변환시켜주는 로직이다. 이후 [Resource Route 규칙](https://remix.run/docs/en/main/guides/resource-routes)에 따라 파일을 구성하였다.

```tsx
import { LoaderFunction } from "@remix-run/node";

import blogConfig from "@/blog.config.json";
import { getAllArticles } from "@/api/getArticle";

export const loader: LoaderFunction = async () => {
  try {
    const articles = await getAllArticles("preview");
    const sitemap = toXmlSitemap([
      "articles",
      ...articles.map((path) => `article/${path}`),
    ]);
    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    throw new Response("Internal Server Error", { status: 500 });
  }
};

export const toXmlSitemap = (urls: string[]) => {
  const urlsAsXml = urls
    .map((url) => `<url><loc>${blogConfig.siteUrl}/${url}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
        <urlset
          xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
        >
          ${urlsAsXml}
        </urlset>
      `.trim();
};
```

#### RSS

rss를 서빙하는 기본적인 Idea도 Sitemap과 일맥상통한다. 나는 md파일을 json형태의 포맷으로 변경하여 블로그 컨텐츠를 서빙하고 있고, md파일 내부적으로 메타정보를 따로 작성하기에 큰 어려움이 없었다. rss 포맷을 완성하는 것은 [이 블로그 아티클](https://camchenry.com/blog/how-to-add-a-rss-feed-to-a-remix-app)을 참조하여 나의 상황에 맞게 조금 변형하였다.

```tsx
// @see https://camchenry.com/blog/how-to-add-a-rss-feed-to-a-remix-app
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import blogConfig from "@/blog.config.json";
import { getAllArticles } from "@/api/getArticle";

import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const articles = await getAllArticles();

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
```

#### Robots

robots는 위와 비교하면 더욱 단순하다. 위 과정을 통해 sitemap을 만들었기 때문에 그저 remix의 Resource Routing 규칙만 지켜주면 된다.

```tsx
import blogConfig from "@/blog.config.json";

export const loader = () => {
  const robotText = ` 
        User-agent: *
        Allow: /
    
        Sitemap: ${blogConfig.siteUrl}/sitemap.xml
        `;

  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
```

이제 우리의 블로그에서 sitemap, rss, robots를 서빙할 수 있게 되었다.
