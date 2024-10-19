import { useLoaderData, useParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getAllArticlePath } from "@/api/getArticle";

export async function loader({ params }: LoaderFunctionArgs) {
  const { category, doc } = params;
  return await getAllArticlePath();
}

function Article() {
  const { category, doc } = useParams();
  const articles = useLoaderData<typeof loader>();
  console.log(articles);

  return (
    <div>
      {articles.map(({ data }) => (
        <article dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
      ))}
    </div>
  );
}

export default Article;
