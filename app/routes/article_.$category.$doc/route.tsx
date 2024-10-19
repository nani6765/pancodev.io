import { useParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { category, doc } = params;
  return null;
}

function Article() {
  const { category, doc } = useParams();
  console.log("category : ", category);
  console.log("doc : ", doc);
  return <div>Article</div>;
}

export default Article;
