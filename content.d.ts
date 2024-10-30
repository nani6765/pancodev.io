declare type Metadata = {
  index: number;
  title: string;
  category: string;
  description: string;
  keywords: string[];
  path: string;
  created_at: string;
  readingTime: string;
  prev_content_path: string;
  next_content_path: string;
};

declare type Content = {
  metadata: Metadata;
  contentHtml: string;
};
