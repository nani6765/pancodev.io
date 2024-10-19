// @see https://ericnish.io/blog/sitemap-xml-with-remix
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
