import { useState } from "react";
import type { KeyboardEvent } from "react";

type Props = {
  naverMap: naver.maps.Map;
};

function NaverSearch({ naverMap }: Props) {
  const moveMapCenterByMapPosition = ({ x, y }: { x: number; y: number }) => {
    const newPosition = new naver.maps.LatLng({ x, y });
    naverMap.setCenter(newPosition);
  };

  const insertDotByPosition = (input: number, position: number) => {
    const withDot =
      `${input}`.slice(0, position) + "." + `${input}`.slice(position);
    return Number(withDot);
  };

  const callSearchApiWhenEnterDown = async (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    const canFetch = !isLoading && naverMap;
    if (e.code !== "Enter" || !query.trim() || !canFetch) {
      return;
    }
    setLoading(true);
    try {
      const searchHeaders = new Headers();
      searchHeaders.append("X-Naver-Client-Id", "cMVZP9FOgL4vZYA53Q_d");
      searchHeaders.append("X-Naver-Client-Secret", "taYKAkMQYZ");

      const searchURL = "/openapi-naver/v1/search/local.json";
      const searchResponse = await fetch(`${searchURL}?query=${query}`, {
        method: "GET",
        headers: searchHeaders,
      });
      const searchJson = await searchResponse.json();
      const searchResult = searchJson.items[0];
      const { mapx, mapy } = searchResult;

      moveMapCenterByMapPosition({
        x: insertDotByPosition(mapx, 3),
        y: insertDotByPosition(mapy, 2),
      });
    } catch (err) {
      console.log(err);
      setQuery("");
    } finally {
      setLoading(false);
    }
  };

  const [isLoading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <input
      type="text"
      style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={callSearchApiWhenEnterDown}
    />
  );
}
export default NaverSearch;
