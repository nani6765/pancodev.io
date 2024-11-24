import { useCallback, useEffect, useState } from "react";

import MapTool from "./MapTool";
import useDrawingShortCut from "./useDrawingShortCut";
import { mapId, mapOptions, drawingOptions } from "./const";

import * as style from "./style.css";

function NaverMap() {
  const [naverMap, setNaverMap] = useState<naver.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] =
    useState<naver.maps.drawing.DrawingManager | null>(null);
  useDrawingShortCut({ drawingManager: drawingManager });

  useEffect(() => {
    if (!naverMap) {
      const initialMap = new naver.maps.Map(mapId, mapOptions);
      setNaverMap(initialMap);
    } else if (naverMap && !drawingManager) {
      naver.maps.Event.once(naverMap, "init_stylemap", () => {
        const newDrawingManager = new naver.maps.drawing.DrawingManager({
          map: naverMap,
          ...drawingOptions,
        });
        setDrawingManager(newDrawingManager);
      });
    }
  }, [drawingManager, naverMap]);

  return (
    <div className={style.mapWrapper} id={mapId}>
      <MapTool naverMap={naverMap} drawingManager={drawingManager} />
    </div>
  );
}

export default NaverMap;
