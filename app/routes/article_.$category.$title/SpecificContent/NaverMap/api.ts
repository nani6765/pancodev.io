export const getNaverSearchByQuery = async (
  query: string
): Promise<{ x: number; y: number }> => {
  const searchURL = "/openapi-naver/v1/search/local.json";
  const searchHeaders = new Headers();
  searchHeaders.append(
    "X-Naver-Client-Id",
    import.meta.env.VITE_X_NAVER_CLIENT_ID
  );
  searchHeaders.append(
    "X-Naver-Client-Secret",
    import.meta.env.VITE_X_NAVER_CLIENT_SECRET
  );

  const searchResponse = await fetch(`${searchURL}?query=${query}`, {
    method: "GET",
    headers: searchHeaders,
  });
  const searchJson = await searchResponse.json();
  const searchResult = searchJson.items[0];
  const { mapx, mapy } = searchResult;

  return {
    x: mapx,
    y: mapy,
  };
};
