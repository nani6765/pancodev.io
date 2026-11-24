export const getNaverSearchByQuery = async (
  query: string
): Promise<{ x: number; y: number }> => {
  const searchResponse = await fetch(
    `/api/naver-search?query=${encodeURIComponent(query)}`
  );
  if (!searchResponse.ok) {
    throw new Error("Failed to search");
  }

  return searchResponse.json();
};
