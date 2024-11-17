import * as style from "../style.css";
import MapSearch from "./MapSearch";

type Props = {
  naverMap: naver.maps.Map;
};

function MapTool({ naverMap }: Props) {
  return (
    <div className={style.mapTool}>
      <MapSearch naverMap={naverMap} />
    </div>
  );
}

export default MapTool;
