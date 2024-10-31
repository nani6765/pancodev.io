import { style } from "@vanilla-extract/css";

export const contentList = style({
  position: "relative",
});

export const contentItem = style({
  marginBottom: "2rem",
  cursor: "pointer",
});

export const contentLink = style({
  color: "inherit",
  textDecoration: "none",

  display: "grid",
  gridTemplateAreas: `
      "name date"
      "info info"
    `,
  gridTemplateColumns: "8fr 2fr",
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

export const contentName = style({
  gridArea: "name",
  whiteSpace: "break-spaces",
  wordBreak: "keep-all",
  selectors: {
    [`${contentItem}:hover &`]: {
      textDecoration: "underline",
    },
  },
});

export const contentDate = style({
  gridArea: "date",
  color: "#c6c6c6",
  textAlign: "right",
});

export const contentInfo = style({
  gridArea: "info",
  fontSize: "0.75rem",
  color: "#c6c6c6",
  wordBreak: "keep-all",
});