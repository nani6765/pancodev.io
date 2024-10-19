declare type Metadata = {
  title: string;
  category: string;
  path: string;
  created_at: string;
  readingTime: string;
};

declare type Article = {
  metadata: Metadata;
  contentHtml: string;
};
