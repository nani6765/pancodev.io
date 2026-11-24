import { json } from "@remix-run/node";

import type { LoaderFunctionArgs } from "@remix-run/node";

const NAVER_LOCAL_SEARCH_URL = "https://openapi.naver.com/v1/search/local.json";

// Client Secret이 브라우저로 전달되지 않도록 네이버 검색 API는 서버에서만 호출한다.
export async function loader({ request }: LoaderFunctionArgs) {
  const query = new URL(request.url).searchParams.get("query")?.trim();
  if (!query) {
    throw new Response("query is required", { status: 400 });
  }

  const response = await fetch(
    `${NAVER_LOCAL_SEARCH_URL}?query=${encodeURIComponent(query)}`,
    {
      headers: {
        "X-Naver-Client-Id": import.meta.env.VITE_X_NAVER_CLIENT_ID ?? "",
        "X-Naver-Client-Secret": process.env.X_NAVER_CLIENT_SECRET ?? "",
      },
    },
  );
  if (!response.ok) {
    throw new Response("Naver search failed", { status: 502 });
  }

  const { items } = await response.json();
  if (!items?.[0]) {
    throw new Response("No search result", { status: 404 });
  }

  return json({ x: items[0].mapx, y: items[0].mapy });
}
