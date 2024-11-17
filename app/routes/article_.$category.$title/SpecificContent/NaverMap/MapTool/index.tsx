import MapSearch from "./MapSearch";
import GeoJsonDownload from "./GeoJsonDownload";

import * as style from "../style.css";

type Props = {
  naverMap: naver.maps.Map | null;
  drawingManager: naver.maps.drawing.DrawingManager | null;
};

function MapTool({ naverMap, drawingManager }: Props) {
  return (
    <div className={style.mapTool}>
      {naverMap && <MapSearch naverMap={naverMap} />}
      {drawingManager && <GeoJsonDownload drawingManager={drawingManager} />}
    </div>
  );
}

export default MapTool;
