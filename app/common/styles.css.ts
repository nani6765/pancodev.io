import { style } from "@vanilla-extract/css";

export const header = style({
  margin: "2rem 0px",
  padding: "0px",
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
  listStyle: "none",

  fontWeight: "bold",
  fontSize: "1rem",
});

export const headerItem = style({
  listStyle: "none",
  padding: "0px",
});

export const headerLink = style({
  color: "white",
  textDecoration: "none",
  selectors: {
    ["&:hover"]: {
      textDecoration: "underline",
    },
    ["&:active"]: {
      textDecoration: "underline",
    },
  },
});
