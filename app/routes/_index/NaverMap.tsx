import { useCallback, useEffect, useState } from "react";
import NaverSearch from "./NaverSearch";

function NaverMap() {
  const [naverMap, setNaverMap] = useState<naver.maps.Map | null>(null);
  const mapId = "drawing_naver_map";

  const loadMap = useCallback(() => {
    const mapOptions: naver.maps.MapOptions = {
      zoom: 15,
      zoomControl: true,
      zoomControlOptions: {
        style: naver.maps.ZoomControlStyle.LARGE,
        position: naver.maps.Position.TOP_RIGHT,
      },
      maxZoom: 19,
      tileSpare: 5,
      mapTypeId: naver.maps.MapTypeId.NORMAL,
      mapTypeControl: true,
    };

    const newNaverMap = new naver.maps.Map(mapId, mapOptions);
    setNaverMap(newNaverMap);
  }, []);

  useEffect(() => {
    if (!naverMap) {
      loadMap();
    }
  }, [naverMap, loadMap]);

  return (
    <div
      id={mapId}
      style={{ width: "100%", height: "400px", position: "inherit" }}
    >
      {naverMap && <NaverSearch naverMap={naverMap} />}
    </div>
  );
}

export default NaverMap;
