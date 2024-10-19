import { style } from "@vanilla-extract/css";

export const articleList = style({
  position: "relative",
});

export const articleItem = style({
  marginBottom: "2rem",
  cursor: "pointer",
});

export const articleLink = style({
  color: "inherit",
  textDecoration: "none",

  display: "grid",
  gridTemplateAreas: `
    "name date"
    "info info"
  `,
  columnGap: "1rem",
  rowGap: "0.25rem",

  selectors: {
    "&:visited": {
      color: "inherit",
    },
    "&:hover": {
      color: "inherit",
    },
    "&:active": {
      color: "inherit",
    },
  },
});

export const articleName = style({
  gridArea: "name",
  whiteSpace: "break-spaces",
  wordBreak: "keep-all",
  selectors: {
    [`${articleItem}:hover &`]: {
      textDecoration: "underline",
    },
  },
});

export const articleDate = style({
  gridArea: "date",
  color: "#c6c6c6",
});

export const articleInfo = style({
  gridArea: "info",
  fontSize: "0.75rem",
  color: "#c6c6c6",
});
