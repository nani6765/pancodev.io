import { useState } from "react";
import { getNaverSearchByQuery } from "./api";
import { insertDotByPosition } from "./function";

import type { KeyboardEvent } from "react";

type Props = {
  naverMap: naver.maps.Map;
};

function NaverSearch({ naverMap }: Props) {
  const [isLoading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const moveMapCenterByMapPosition = ({ x, y }: { x: number; y: number }) => {
    const newPosition = new naver.maps.LatLng({ x, y });
    naverMap.setCenter(newPosition);
  };

  const callSearchApiWhenEnterDown = async (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    const canFetch = !isLoading && naverMap;
    if (e.code !== "Enter" || !query.trim() || !canFetch) {
      return;
    }

    try {
      setLoading(true);
      const { x, y } = await getNaverSearchByQuery(query);
      moveMapCenterByMapPosition({
        x: insertDotByPosition(x, 3),
        y: insertDotByPosition(y, 2),
      });
    } catch {
      setQuery("");
    } finally {
      setLoading(false);
    }
  };

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
