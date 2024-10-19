declare type Metadata = {
  index: number;
  title: string;
  category: string;
  description: string;
  keywords: string[];
  path: string;
  created_at: string;
  readingTime: string;
};

declare type Article = {
  metadata: Metadata;
  contentHtml: string;
};
