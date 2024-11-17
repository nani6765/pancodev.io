import { downloadBlobFile } from "../function";

type Property = Record<string, number | boolean | string>;
type Coordinate = [number, number];

type FeatureGeoJson = naver.maps.GeoJSON & {
  features: {
    type: string;
    properties?: Property;
    geometry: {
      type: string;
      coordinates: Coordinate[][][];
      mantle_properties?: Property;
      properties?: Property;
    };
  }[];
};

type Props = {
  drawingManager: naver.maps.drawing.DrawingManager;
};

function GeoJsonDownload({ drawingManager }: Props) {
  const convertLayerToGeoJSON = () => {
    const currentLayer = drawingManager.getDrawings();
    if (Object.keys(currentLayer).length < 1) {
      alert("사용자가 그린 드로잉이 없습니다.");
    }

    try {
      const geoJson = drawingManager.toGeoJson() as FeatureGeoJson;
      const removeProperty = geoJson.features.map(({ type, geometry }) => ({
        type,
        geometry: {
          type: geometry.type,
          coordinates: geometry.coordinates,
        },
      }));
      const blob = new Blob([JSON.stringify(removeProperty)], {
        type: "application/json",
      });
      downloadBlobFile(blob, "drawings_GeoJson.json");
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("알 수 없는 이유로 다운로드에 실패하였습니다.");
      }
    }
  };

  return <button onClick={convertLayerToGeoJSON}>GeoJSON 다운</button>;
}

export default GeoJsonDownload;
