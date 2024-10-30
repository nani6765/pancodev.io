import { json, Link, useLoaderData } from "@remix-run/react";
import { getContentsByCategory, getSpecificContent } from "@/api/getContent";

import codeCSS from "./code.css?url";
import * as styles from "./style.css";
import articleCSS from "./article.css?url";
import blogConfig from "@/blog.config.json";
import generateMetaTag from "@/function/generateMetaTag";

import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import sortingArticlesByCreate from "@/function/sortingArticlesByCreate";

export async function loader({ params }: LoaderFunctionArgs) {
  const { category, title } = params;
  const file = await getSpecificContent({ category, title });
  const categoryFiles = await getContentsByCategory(category);

  const currentIndex = file.metadata.index;
  return json({
    article: file,
    recentFiles: sortingArticlesByCreate(categoryFiles)
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
