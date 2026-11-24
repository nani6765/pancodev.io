import { useEffect, useState } from "react";

import MapTool from "./MapTool";
import useDrawingShortCut from "./useDrawingShortCut";
import loadNaverMapScript from "./loadNaverMapScript";
import { mapId, mapOptions, drawingOptions } from "./const";

import * as style from "./style.css";

function NaverMap() {
  const [naverMap, setNaverMap] = useState<naver.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] =
    useState<naver.maps.drawing.DrawingManager | null>(null);
  useDrawingShortCut({ drawingManager: drawingManager });

  useEffect(() => {
    let cancelled = false;

    loadNaverMapScript()
      .then(() => {
        if (cancelled) {
          return;
        }

        const initialMap = new naver.maps.Map(mapId, mapOptions);
        setNaverMap(initialMap);

        naver.maps.Event.once(initialMap, "init_stylemap", () => {
          if (cancelled) {
            return;
          }
          setDrawingManager(
            new naver.maps.drawing.DrawingManager({
              map: initialMap,
              ...drawingOptions,
            })
          );
        });
      })
      .catch(() => {
        // 스크립트를 받지 못하면 지도 영역을 비워 둔다.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={style.mapWrapper} id={mapId}>
      <MapTool naverMap={naverMap} drawingManager={drawingManager} />
    </div>
  );
}

export default NaverMap;
