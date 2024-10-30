type JsonFile = {
  filePath: string;
  metadata: {
    [key: string]: any;
  };
  content: string;
};

type Metadata = {
  index: number;
  title: string;
  description: string;
  path: string;
  created_at: string;
};

declare type ArticleMetadata = Metadata & {
  category: string;
  keywords: string[];
  readingTime: string;
};

declare type SmallTalkMetaData = Metadata & {
  prev_content_path: string;
  next_content_path: string;
};

declare type Content = {
  metadata: ArticleMetadata | SmallTalkMetaData;
  contentHtml: string;
};

declare type Article = {
  metadata: ArticleMetadata;
  contentHtml: string;
};

declare type SmallTalk = {
  metadata: SmallTalkMetaData;
  contentHtml: string;
};
