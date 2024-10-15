import { json } from "@remix-run/node";
import { test } from "../../../api/getArticle";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  const articles = json(await test());
  return articles;
};

function Home() {
  const articles = useLoaderData<typeof loader>();
  console.log(articles);
  return <div>Home</div>;
}

export default Home;
