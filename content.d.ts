type JsonFile = {
  filePath: string;
  metadata: {
    [key: string]: any;
  };
  content: string;
};

type Metadata = {
  index: number; // 빌드과정에서 주입됨
  title: string;
  description: string;
  path: string; // 빌드과정에서 주입됨
  created_at: string;
};

declare type ArticleMetadata = Metadata & {
  category: string;
  keywords: string[];
  readingTime: string; // 빌드과정에서 주입됨
};

declare type Content = {
  metadata: ArticleMetadata;
  contentHtml: string;
};

declare type Article = {
  metadata: ArticleMetadata;
  contentHtml: string;
};
