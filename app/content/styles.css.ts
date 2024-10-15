import { style, globalStyle } from "@vanilla-extract/css";

export const header = style({
  margin: "2rem 0px",
  display: "flex",
  gap: "1rem",

  fontWeight: "bold",
  fontSize: "1rem",
});

export const headerLink = style({
  color: "white",
  textDecoration: "none",
  selectors: {
    ["&:hover"]: {
      textDecoration: "underline",
    },
    ["&.active"]: {
      textDecoration: "underline",
    },
  },
});

globalStyle("body", {
  maxWidth: "640px",
  margin: "0 auto",
  color: "white",
  backgroundColor: "#2C2C2C",
});

globalStyle("ul", {
  listStyle: "none",
  margin: 0,
  padding: 0,
});
