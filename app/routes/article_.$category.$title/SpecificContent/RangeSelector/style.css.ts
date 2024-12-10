import { style } from "@vanilla-extract/css";

export const chartWrapper = style({
  background: "#fff",
  padding: "2rem",
  width: "calc(100% - 4rem)",
  height: "auto",
});

export const chartHeader = style({
  display: "flex",
  color: "black",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 1rem 1rem",
});

export const innerWrapper = style({
  minHeight: "320px",
});

export const inputWrapper = style({
  width: "60px",
  height: "36px",
  borderRadius: "4px",
  position: "relative",
});

export const input = style({
  width: "100%",
  height: "100%",
  padding: "0 0 0 20px",
  borderRadius: "4px",
  border: "1px solid #9ca3af",
  outline: "none",

  selectors: {
    ["&:focus"]: {
      outline: "none",
    },
    ["&::-webkit-inner-spin-button"]: {
      WebkitAppearance: "none",
      margin: 0,
    },
    [" &::-webkit-outer-spin-button"]: {
      WebkitAppearance: "none",
      margin: 0,
    },
  },
});

export const nav = style({
  width: "24px",
  height: "100%",
  position: "absolute",
  right: "-20px",
  top: "0",
  borderRadius: "0 4px 4px 0",
});

export const btn = style({
  cursor: "pointer",
  borderLeft: "1px solid #9ca3af",
  width: "24px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  userSelect: "none",
});

export const upBtn = style([
  btn,
  {
    position: "absolute",
    height: "50%",
    top: "0",
    borderBottom: "1px solid #9ca3af",
    borderRadius: "0 4px 0 0",
  },
]);

export const downBtn = style([
  btn,
  {
    position: "absolute",
    bottom: "-1px",
    height: "50%",
    borderRadius: "0 0 4px 0",
  },
]);
