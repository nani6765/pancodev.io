import { style } from "@vanilla-extract/css";

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
