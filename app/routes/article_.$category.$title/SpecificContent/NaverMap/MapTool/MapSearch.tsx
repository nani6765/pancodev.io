import { useRef, useState } from "react";

import { getNaverSearchByQuery } from "../api";
import { insertDotByPosition } from "../function";

import type { KeyboardEvent } from "react";

type Props = {
  naverMap: naver.maps.Map;
};

function MapSearch({ naverMap }: Props) {
  // 요청 중 여부는 화면에 그리지 않고 중복 요청 방지에만 쓰므로 ref에 둔다.
  const isLoadingRef = useRef(false);
  const [query, setQuery] = useState("");

  const moveMapCenterByMapPosition = ({ x, y }: { x: number; y: number }) => {
    const newPosition = new naver.maps.LatLng({ x, y });
    naverMap.setCenter(newPosition);
  };

  const callSearchApiWhenEnterDown = async (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    const canFetch = !isLoadingRef.current && naverMap;
    if (e.code !== "Enter" || !query.trim() || !canFetch) {
      return;
    }

    try {
      isLoadingRef.current = true;
      const { x, y } = await getNaverSearchByQuery(query);
      moveMapCenterByMapPosition({
        x: insertDotByPosition(x, 3),
        y: insertDotByPosition(y, 2),
      });
    } catch {
      alert("무료 사용량이 초과되었습니다.");
      setQuery("");
    } finally {
      isLoadingRef.current = false;
    }
  };

  return (
    <input
      disabled={!naverMap}
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={callSearchApiWhenEnterDown}
    />
  );
}

export default MapSearch;
