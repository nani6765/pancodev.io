export const mapId = "drawing_naver_map";

export const mapOptions: naver.maps.MapOptions = {
  zoom: 15,
  zoomControl: true,
  zoomControlOptions: {
    style: 1,
    position: 3,
  },
  maxZoom: 19,
  tileSpare: 5,
  mapTypeId: "normal",
  mapTypeControl: true,
};

const rectangleOptions = {
  fillColor: "#ff0000",
  fillOpacity: 0.5,
  strokeWeight: 3,
  strokeColor: "#ff0000",
};

const polygonOptions = {
  strokeColor: "#ffd100",
  fillColor: "#ffff00",
  fillOpacity: 0.5,
  strokeWeight: 3,
};

export const drawingOptions = {
  drawingControl: [
    0, // naver.maps.drawing.DrawingMode.HAND,
    1, // naver.maps.drawing.DrawingMode.RECTANGLE,
    5, // naver.maps.drawing.DrawingMode.POLYGON,
  ],
  drawingMode: 0,
  rectangleOptions: rectangleOptions,
  polygonOptions: polygonOptions,
};
