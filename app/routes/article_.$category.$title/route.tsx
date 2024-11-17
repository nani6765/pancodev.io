import { json, Link, useLoaderData } from "@remix-run/react";
import {
  article_generate_dir,
  getContentsInDir,
  getSpecificContent,
} from "@/api/getContent";

import blogConfig from "@/blog.config.json";
import SpecificContent from "./SpecificContent";
import generateMetaTag from "@/function/generateMetaTag";
import sortingContentsByCreate from "@/function/sortingContentsByCreate";

import codeCSS from "@commonStyle/code.css?url";
import * as styles from "@commonStyle/content.css";
import articleCSS from "@commonStyle/article.css?url";

import type {
  MetaFunction,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import Giscus from "@/app/common/Giscus";

export async function loader({ params }: LoaderFunctionArgs) {
  const { category, title } = params;
  const dirPath = `${article_generate_dir}/${category}`;
  const file = await getSpecificContent<Article>({ dirPath, title });
  const categoryFiles = await getContentsInDir<Article>({
    dirPath,
  });

  const currentIndex = file.metadata.index;
  return json({
    article: file,
    recentFiles: sortingContentsByCreate(categoryFiles)
      .filter((v) => v.metadata.index !== currentIndex)
      .slice(0, 5),
    category,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const { category, article } = data;
  const { metadata } = article;
  const { title, description, path, keywords } = metadata;

  return generateMetaTag({
    title: [title, blogConfig.title],
    description: description,
    author: blogConfig.author,
    url: `${blogConfig.siteUrl}/${category}/${path}`,
    keywords: [category, ...keywords],
  });
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: codeCSS },
  { rel: "stylesheet", href: articleCSS },
];

function Content() {
  const { article, recentFiles, category } = useLoaderData<typeof loader>();

  return (
    <div className="root-section">
      <div className={styles.wrapper}>
        <p className={styles.metaData}>
          category : <strong>{article.metadata.category}</strong>
          <span> / </span>
          <span>{article.metadata.readingTime}</span>
        </p>
        <article dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
        <SpecificContent path={article.metadata.path} />
        {import.meta.env.VITE_SHOW_GISCUS === "show" && <Giscus />}
        <Link to="/articles" className={styles.goList}>
          목록으로
        </Link>
        {recentFiles.length > 0 && (
          <section className="recent-category">
            <strong>{category} 카테고리의 최신글</strong>
            <ul className={styles.recentList}>
              {recentFiles.map(({ metadata }) => (
                <li key={metadata.index} className={styles.recentItem}>
                  <Link
                    to={`/article/${category}/${metadata.path}`}
                    className={styles.recentLink}
                  >
                    {metadata.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

export default Content;
