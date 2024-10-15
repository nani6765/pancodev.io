import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getFullArticle } from "@/api/getArticle";

export const loader = async () => {
  const articles = json(await getFullArticle());
  return articles;
};

function Home() {
  const articles = useLoaderData<typeof loader>();
  console.log(articles);
  return <div>Home</div>;
}

export default Home;
