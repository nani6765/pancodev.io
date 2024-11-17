import { useCallback, useEffect, useRef } from "react";

import MapTool from "./MapTool";
import useDrawingShortCut from "./useDrawingShortCut";
import { mapId, mapOptions, polygonOptions, rectangleOptions } from "./const";

import * as style from "./style.css";

function NaverMap() {
  const naverMap = useRef<naver.maps.Map | null>(null);
  const drawingManager = useRef<naver.maps.drawing.DrawingManager | null>(null);
  useDrawingShortCut({ drawingManager: drawingManager.current });

  const loadMap = useCallback(() => {
    const newNaverMap = new naver.maps.Map(mapId, mapOptions);
    naverMap.current = newNaverMap;
  }, []);

  useEffect(() => {
    naver.maps.onJSContentLoaded = function () {
      const newDrawingManager = new naver.maps.drawing.DrawingManager({
        map: naverMap.current,
        drawingControl: [
          naver.maps.drawing.DrawingMode.HAND,
          naver.maps.drawing.DrawingMode.RECTANGLE,
          naver.maps.drawing.DrawingMode.POLYGON,
        ],
        drawingMode: 0,
        rectangleOptions: rectangleOptions,
        polygonOptions: polygonOptions,
      });
      drawingManager.current = newDrawingManager;
    };

    if (!naverMap.current) {
      loadMap();
    }
  }, [naverMap.current, loadMap]);

  return (
    <div className={style.mapWrapper} id={mapId}>
      {naverMap && <MapTool naverMap={naverMap.current} />}
    </div>
  );
}

export default NaverMap;
