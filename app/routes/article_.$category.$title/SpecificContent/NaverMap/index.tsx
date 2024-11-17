import { useCallback, useEffect, useState } from "react";

import MapTool from "./MapTool";
import useDrawingShortCut from "./useDrawingShortCut";
import { mapId, mapOptions, polygonOptions, rectangleOptions } from "./const";

import * as style from "./style.css";

function NaverMap() {
  const [naverMap, setNaverMap] = useState<naver.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] =
    useState<naver.maps.drawing.DrawingManager | null>(null);
  useDrawingShortCut({ drawingManager: drawingManager });

  const loadMap = useCallback(() => {
    const newNaverMap = new naver.maps.Map(mapId, mapOptions);
    setNaverMap(newNaverMap);
  }, []);

  useEffect(() => {
    naver.maps.onJSContentLoaded = function () {
      const newDrawingManager = new naver.maps.drawing.DrawingManager({
        map: naverMap,
        drawingControl: [
          naver.maps.drawing.DrawingMode.HAND,
          naver.maps.drawing.DrawingMode.RECTANGLE,
          naver.maps.drawing.DrawingMode.POLYGON,
        ],
        drawingMode: 0,
        rectangleOptions: rectangleOptions,
        polygonOptions: polygonOptions,
      });
      setDrawingManager(newDrawingManager);
    };

    if (!naverMap) {
      loadMap();
    }
  }, [loadMap, naverMap]);

  return (
    <div className={style.mapWrapper} id={mapId}>
      <MapTool naverMap={naverMap} drawingManager={drawingManager} />
    </div>
  );
}

export default NaverMap;
