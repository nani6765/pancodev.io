import { json, Link, useLoaderData } from "@remix-run/react";
import { small_talk_generate_dir, getSpecificContent } from "@/api/getContent";

import blogConfig from "@/blog.config.json";
import generateMetaTag from "@/function/generateMetaTag";

import codeCSS from "@commonStyle/code.css?url";
import * as styles from "@commonStyle/content.css";
import articleCSS from "@commonStyle/article.css?url";

import type {
  MetaFunction,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { year, title } = params;
  const file = await getSpecificContent<SmallTalk>({
    dirPath: `${small_talk_generate_dir}/${year}`,
    title,
  });

  return json({
    smallTalk: file,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const { smallTalk } = data;
  const { metadata } = smallTalk;
  const { title, description, path } = metadata;

  return generateMetaTag({
    title: [title, blogConfig.title],
    description: description,
    author: blogConfig.author,
    url: `${blogConfig.siteUrl}/${path}`,
  });
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: codeCSS },
  { rel: "stylesheet", href: articleCSS },
];

function SmallTalk() {
  const { smallTalk } = useLoaderData<typeof loader>();
  const { created_at, title, description, prev, next, hasCloseContent } =
    smallTalk.metadata;

  return (
    <div className="root-section">
      <div className={styles.wrapper}>
        <p className={styles.metaData}>{created_at}</p>
        <section>
          <h1>{title}</h1>
          <h4>{description}</h4>
          <div dangerouslySetInnerHTML={{ __html: smallTalk.contentHtml }} />
        </section>
        <Link to="/small_talk" className={styles.goList}>
          목록으로
        </Link>
        {hasCloseContent && (
          <section className="recent-small-talk">
            <ul className={styles.recentList}>
              {prev.content_path && (
                <li className={styles.recentItem}>
                  <Link
                    to={`/small_talk/${prev.content_path}`}
                    className={styles.recentLink}
                  >
                    [이전글] {prev.content_title}
                  </Link>
                </li>
              )}
              {next.content_path && (
                <li className={styles.recentItem}>
                  <Link
                    to={`/small_talk/${next.content_path}`}
                    className={styles.recentLink}
                  >
                    [다음글] {next.content_title}
                  </Link>
                </li>
              )}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

export default SmallTalk;
