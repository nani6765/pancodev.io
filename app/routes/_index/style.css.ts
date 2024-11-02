import { style } from "@vanilla-extract/css";

export const profile = style({
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  backgroundColor: "wheat",
  marginBottom: "1rem",
  userSelect: "none",
  pointerEvents: "none",
});

export const description = style({
  fontSize: "1rem",
  lineHeight: "1.5rem",
  fontWeight: 200,
  userSelect: "none",
});

export const title = style({
  fontSize: "1.1rem",
  fontWeight: "bold",
  marginBottom: "1.25rem",
});

export const section = style({
  margin: "2rem 0",
});

export const resumeLink = style({
  fontWeight: 400,
  color: "inherit",
  textDecoration: "none",
  selectors: {
    ["&:hover"]: {
      textDecoration: "underline",
    },
    ["&:active"]: {
      textDecoration: "underline",
    },
    ["&:visited"]: {
      color: "inherit",
    },
  },
});

export const linkList = style({
  display: "flex",
  gap: "1rem",
});

export const linkIcon = style({
  border: "1px solid #fff",
  borderRadius: "50%",
  backgroundColor: "#fff",
  width: "24px",
  height: "24px",
});
