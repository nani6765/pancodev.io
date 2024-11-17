import { style } from "@vanilla-extract/css";

export const mapWrapper = style({
  width: "100%",
  height: "400px",
  position: "inherit",
});

export const mapTool = style({
  position: "absolute",
  top: "10px",
  left: "10px",
  zIndex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});
