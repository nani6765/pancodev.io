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
  fontWeight: 400,
  userSelect: "none",
});
