import { json, Link, useLoaderData } from "@remix-run/react";
import { smallTalkGenerateDir, getSpecificContent } from "@/api/getContent";

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

export async function loader({ params }: LoaderFunctionArgs) {
  const { title } = params;
  const file = await getSpecificContent({
    dirPath: smallTalkGenerateDir,
    title,
  });

  return json({
    smallTalk: file,
  });
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: codeCSS },
  { rel: "stylesheet", href: articleCSS },
];

function SmallTalk() {
  const { smallTalk } = useLoaderData<typeof loader>();

  return (
    <div className="root-section">
      <div className={styles.wrapper}>
        <article dangerouslySetInnerHTML={{ __html: smallTalk.contentHtml }} />
        <Link to="/small_talk" className={styles.goList}>
          목록으로
        </Link>
      </div>
    </div>
  );
}

export default SmallTalk;
