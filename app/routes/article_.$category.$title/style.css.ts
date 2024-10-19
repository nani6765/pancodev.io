import { style } from "@vanilla-extract/css";

export const wrapper = style({
  marginBottom: "5rem",
});

export const metaData = style({
  fontSize: "0.75rem",
  lineHeight: "1rem",
});

export const goList = style({
  margin: "2rem 0px",
  display: "flex",
  justifyContent: "flex-end",
});

export const recentTitle = style({
  fontWeight: 400,
});

export const recentList = style({
  paddingLeft: "1rem",
});

export const recentItem = style({
  padding: "0px",
});

export const recentLink = style({
  textDecoration: "none",
  selectors: {
    [`${recentItem}:hover &`]: {
      textDecoration: "underline",
    },
  },
});
