import { style, globalStyle } from "@vanilla-extract/css";

export const header = style({
  marginTop: "2rem",
  display: "flex",
  gap: "1rem",

  fontWeight: "bold",
  fontSize: "1rem",
});

export const headerItem = style({
  cursor: "pointer",
});

globalStyle("body", {
  maxWidth: "640px",
  margin: "0 auto",
  color: "white",
  backgroundColor: "#003153",
});

globalStyle("ul", {
  listStyle: "none",
});
