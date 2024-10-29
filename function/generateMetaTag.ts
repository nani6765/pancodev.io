import { MetaDescriptor } from "@remix-run/node";

type generateMetaTagParams = {
  title: string[];
  description: string;
  author: string;
  url: string;
  keywords?: string[];
  image?: string;
  logo?: string;
};

const DELIMITER = " | ";

function generateMetaTag({
  title,
  description,
  author,
  url,
  keywords = [],
  image = "",
  logo = "",
}: generateMetaTagParams): MetaDescriptor[] {
  const defaultMetaTags = [
    { title: title.join(DELIMITER) },
    metaName("author", author),
    metaName("description", description),
    prefixMeta("og", "type", "website"),
    prefixMeta("og", "title", title[0]),
    prefixMeta("og", "description", description),
    prefixMeta("og", "url", url),
    prefixMeta("twitter", "title", title[0]),
    prefixMeta("twitter", "description", description),
    prefixMeta("twitter", "creator", `@${author}`),
  ];

  const keywordMetaTag =
    keywords.length > 0 ? [metaName("keywords", keywords.join(", "))] : [];

  const imageMetaTag = image
    ? [
        prefixMeta("og", "image", image),
        prefixMeta("twitter", "card", "summary_large_image"),
        prefixMeta("twitter", "image", image),
      ]
    : [];

  const logoMetaTag = logo ? [prefixMeta("og", "logo", logo)] : [];

  return [
    ...defaultMetaTags,
    ...keywordMetaTag,
    ...imageMetaTag,
    ...logoMetaTag,
  ];
}

function metaName(name: string, content: string) {
  return { name, content };
}

function prefixMeta(prefix: string, property: string, content: string) {
  return { property: `${prefix}:${property}`, content };
}

export default generateMetaTag;
