import { style } from "@vanilla-extract/css";

export const wrapper = style({
  marginBottom: "5rem",
});

export const metaData = style({
  fontSize: "0.75rem",
  lineHeight: "1rem",
});

export const goList = style({
  margin: "2rem 0px 3rem",
  display: "flex",
  justifyContent: "flex-end",
});

export const recentTitle = style({
  fontWeight: 500,
});

export const recentList = style({
  paddingLeft: "1rem",
});

export const recentItem = style({
  padding: "0px",
});

export const recentLink = style({
  fontWeight: 200,
  textDecoration: "none",
  display: "block",

  selectors: {
    [`${recentItem}:hover &`]: {
      textDecoration: "underline",
    },
  },
});

export const nextLink = style([
  recentLink,
  {
    justifySelf: "end",
  },
]);

export const prevLink = style([
  recentLink,
  {
    justifySelf: "start",

    selectors: {
      [`&:has(~ ${nextLink})`]: {
        marginBottom: "1rem",
      },
    },
  },
]);
