import { useCallback, useEffect, useState } from "react";

import NaverSearch from "./NaverSearch";
import useDrawingShortCut from "./useDrawingShortCut";

function NaverMap() {
  const [naverMap, setNaverMap] = useState<naver.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] =
    useState<naver.maps.drawing.DrawingManager | null>(null);
  const mapId = "drawing_naver_map";
  useDrawingShortCut({ drawingManager });

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

  const initialMapEvent = useCallback(() => {
    naver.maps.Event.once(naverMap, "init", () => {
      const newDrawingManager = new naver.maps.drawing.DrawingManager({
        map: naverMap,
        drawingControl: [
          naver.maps.drawing.DrawingMode.HAND,
          naver.maps.drawing.DrawingMode.RECTANGLE,
          naver.maps.drawing.DrawingMode.POLYGON,
        ],
        drawingMode: 0,
        rectangleOptions: {
          fillColor: "#ff0000",
          fillOpacity: 0.5,
          strokeWeight: 3,
          strokeColor: "#ff0000",
        },
        polygonOptions: {
          strokeColor: "#ffd100",
          fillColor: "#ffff00",
          fillOpacity: 0.5,
          strokeWeight: 3,
        },
      });
      setDrawingManager(newDrawingManager);
    });
  }, [naverMap]);

  useEffect(() => {
    if (!naverMap) {
      loadMap();
    } else {
      initialMapEvent();
    }
  }, [naverMap, loadMap, initialMapEvent]);

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
