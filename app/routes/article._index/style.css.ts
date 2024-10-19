import { style } from "@vanilla-extract/css";

export const ArticleList = style({
  position: "relative",
});

export const ArticleItem = style({
  marginBottom: "2rem",
  cursor: "pointer",

  display: "grid",
  gridTemplateAreas: `
    "name date"
    "estRead estRead"
  `,
  columnGap: "1rem",
  rowGap: "0.25rem",
});

export const ArticleName = style({
  gridArea: "name",
  whiteSpace: "break-spaces",
  wordBreak: "keep-all",
  selectors: {
    [`${ArticleItem}:hover &`]: {
      textDecoration: "underline",
    },
  },
});

export const ArticleDate = style({
  gridArea: "date",
  color: "#c6c6c6",
});

export const ArticleEstRead = style({
  gridArea: "estRead",
  fontSize: "0.75rem",
  color: "#c6c6c6",
});
