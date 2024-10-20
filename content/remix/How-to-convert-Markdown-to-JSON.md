---
title: Node환경에서 Markdown파일을 JSON으로 변환하는 방법 For Remix
description: In a Node environment, convert Markdown to JSON using Remix loaders with unifiedjs and gray-matter. Parse Markdown, extract metadata, and transform content to HTML, then serve the JSON via Remix loaders.
keywords: ["remix", "마크다운", "변환"]
category: remix
path: How-to-convert-Markdown-to-JSON
created_at: 2024-10-20 16:40
---

# Node환경에서 Markdown파일을 JSON으로 변환하는 방법 For Remix

Remix는 서버사이드 동적 컨텐츠를 처리하기 위해 `loader` 라는 함수를 제공한다. `loader` 는 서버에서 GET HTTP 요청을 처리하는 데 사용되어 다른 소스로부터 데이터를 가져올 수 있다. Vercel의 Hobby 요금제(Free)에서 서버사이드의 Read요청이 지원되기 때문에 Remix를 통하여 블로그를 만들기로 계획하였다. [2023 State of React](https://2023.stateofreact.com/en-US/libraries/)에서 Astro 다음으로 가장 높은 만족도를 보였던 Remix에서 마크다운 파일을 서빙하는 방법에 대해 알아보자.

MD파일을 직접 파싱 라이브러리를 통해 사용하는 방법도 있지만, [unifiedjs](https://unifiedjs.com)를 통해 MD파일을 JSON포맷으로 변경하여 이를 `loader` 를 통해 보여줄 계획이다. 이후 프로젝트를 build할 때, 특정 폴더에 담긴 MD파일을 JSON파일로 변환해주는 스크립트를 실행하여 컨텐츠를 준비한다.

```bash
yarn add gray-matter remark remark-rehype rehype-stringify
(optional) yarn add -D tsx
(optional) yarn add  fast-glob fs-extra remark-gfm hastscript unist-util-visit reading-time
```

`gray-matter` 는 MD파일에서 Meta Data를 파싱하기 위한 라이브러리이다. 해당 라이브러리를 통해 MD파일에서 Meta Data를 추출하고, Meta Data 내부에 블로그 게시글에 대한 전반적인 정보를 기입할 계획이다. `remark` 는 MD파일을 파싱하기 위해 사용할 라이브러리이고, 이 파싱된 데이터를 `remark-rehype` 을 통해 HTML구문으로 변경해준다. 이후 마지막으로 `rehype-stringify` 로 직렬화를 진행해주면 MD파일을 HTML구문으로 변경하고, 그 데이터를 JSON 포멧으로 저장할 수 있다.

`tsx` 는 typescript로 생성될 스크립트 파일을 Node환경에서 실행시켜주기 위해 설치하였다. `fs-glob` 과 `fs-extra` 는 보다 빠른 속도로 파일을 다루기 위해 설치하였다. `remark` 는 필요에 따라 여러 플러그인을 추가할 수 있다. 나는 ~~취소선~~을 지원해주고자 `remark-gfm` 을 추가로 설치하였고, 커스텀 플러그인을 제작하기 위해 `hastscript` 와 `unist-util-visit` 도 추가적으로 설치해주었다. `reading-time` 은 문서의 텍스트 양을 기반으로 예상 읽을 시간을 추정해주는 라이브러리인데, Meta 데이터에 이를 추가해주고자 설치하였다.

```tsx
import fs from "fs-extra";
import path from "node:path";

import matter from "gray-matter";
import { unified } from "unified";
// import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
// import readingTimeGenerator from "reading-time";

const basePath = path.resolve();
const contentDir = path.join(basePath, "content");
const outputDir = path.join(basePath, "_generate");

async function buildMarkdownFiles() {
  const files = getFiles(contentDir); // psedo code

  const processor = unified()
    .use(remarkParse)
    // .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileContent = fs.readFileSync(file, "utf-8");
    const { data: metadata, content } = matter(fileContent);

    const processedContent = await processor.process(content);
    const contentHtml = processedContent.toString();
    // const readingTime = readingTimeGenerator(contentHtml);

    const relativePath = path.relative(contentDir, file);
    const outputFilePath = path.join(
      outputDir,
      `${relativePath.replace(/\.md$/, ".json")}`
    );

    const output = {
      metadata: {
        ...metadata,
        index: i,
        // readingTime: readingTime.text,
      },
      contentHtml,
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
  }
}

buildMarkdownFiles().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

기본적인 사용방법이다. 만약 MD파일이 root디렉토리를 기준으로 ‘content/react/How_to_use_useEffect.md’ 와 같은 경로로 저장되어 있다면, `_generate/react/How_to_use_useEffect.json`의 경로로 저장되도록 설계하였다. 이를 통해 중간에 저장되는 폴더명 (지금의 예시에서는 react)이 카테고리의 역할을 담당할 수 있도록 확장할 계획이다. 위 코드에서 쉐도 코드로 작성된 `getFiles` 가 프로젝트에 존재하는 모든 MD파일을 가져오는 역할을 담당하는 데 이 부분도 마저 구현해보자.

```tsx
import fs from "fs-extra";
import path from "node:path";

type ListFilesByExtension = {
  dirPath: string;
  arrayOfFiles?: string[];
  ext: string;
};

function getFilePathsByExtension({
  dirPath,
  arrayOfFiles = [],
  ext,
}: ListFilesByExtension) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getFilePathsByExtension({
        dirPath: filePath,
        arrayOfFiles,
        ext,
      });
    } else if (filePath.endsWith(ext)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

export default getFilePathsByExtension;
```

추후 확장성을 위해 특정 확장자의 파일만 선택하기 위하여 `ext` 라는 인자를 추가하였다. `ext` 로 넘겨받은 값에 해당하는 파일만 선택될 수 있도록 설계하였고, content폴더에 저장된 폴더 구조 그대로 \_generate 폴더로 이관하기 위하여 재귀적으로 폴더 계층을 모두 탐색할 수 있도록 구상하였다.

```tsx
import getFilePathsByExtension from "@/function/getFilePathsByExtension";
/* ... */

async function buildMarkdownFiles() {
  const files = getFilePathsByExtension({ dirPath: contentDir, ext: "md" });

  const processor = unified()
    .use(remarkParse)
    // .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify);

  /* ... */
  fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
}

/* ... */
```

이제 `files` 에는 `contentDir` 에 존재하는 모든 `.md` 파일의 path가 배열 형태로 저장되어 있다. 이후 이전에 구현하였던 `processor` 를 통하여 마크다운 파일의 컨텐츠를 메타데이터와 본문으로 구분하고, 본문의 경우는 HTML로 변환한다. 그 데이터를 JSON형태로 변환되는 과정을 거치게 될 것이다. 다만 `writeFileSync` 를 통해 파일을 저장하고자 할 때, 만약 존재하지 않는 폴더라면 ENOENT에러가 발생하게 된다. 그걸 방지하기 위하여 파일을 저장하기 이전에 폴더가 생성될 필요가 있다면, 폴더를 생성하는 로직을 추가할 필요성이 있다.

```tsx
function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

async function buildMarkdownFiles() {
  const files = getFilePathsByExtension({ dirPath: contentDir, ext: "md" });

  /* ... */
  ensureDirectoryExistence(outputFilePath);
  fs.writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
}

/* ... */
```

만약 현재 저장하고자 하는 경로의 이름을 가진 폴더가 없다면, 그 경로로 폴더를 생성해주는 `ensureDirectoryExistence` 를 추가하였다. 이후 tsx를 통해 스크립트를 실행해주면 목표하고자 한 바를 이룰 수 있다.

```json
  "scripts": {
    "dev": "yarn run generate && remix vite:dev",
    "build": "yarn run clear:content && yarn run generate && remix vite:build",
    "start": "remix-serve ./build/server/index.js",
    "generate": "npx tsx ./script/generate_content.ts",
    "clear:content": "rm -rf _generate"
  },
```

이 과정까지만 해도 만족할만한 결과를 얻을 수 있겠지만, 실제 변환된 컨텐츠를 확인해보면 여러 공식문서에 지원해주는 취소선, 콜아웃과 같은 기능을 구현해주고자 하는 욕심이 생길 수 있다. 만약 그러한 욕심이 생긴다면 파일을 변환해주는 과정에서 적절하게 플러그인을 추가해주면 된다. 현재 지원되는 플러그인 목록은 [이 곳](https://unifiedjs.com/explore/)에서 확인할 수 있다.

```tsx
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(remarkCallout)
  .use(rehypeStringify);
```

나는 `remarkGfm` 을 통해 “~~”으로 감싸져 있는 컨텐츠를 `del` tag로 변환해주는 과정을 추가해주었으며, ~~(이 것 말고도 다른 기능도 제공해주지만, 내 컨텐츠에선 이것만 필요했다.)~~ Note로 시작하는 컨텐츠를 콜아웃으로 만들어주는 `remarkCallout` 이라는 커스텀 플러그인도 만들었다.

<aside>
💡

콜아웃을 만들어주는 플러그인도 현재 라이브러리로 나와있는 [reamark-callout-directives](https://github.com/Microflash/remark-callout-directives)를 사용해도 되지만 나는 주로 노션으로 문서 작업을 하기에, 노션 느낌이 나도록 콜아웃을 커스터마이징하고 싶어서, 직접 만들기로 선택하였다.

</aside>

```tsx
import { visit } from "unist-util-visit";
import { h } from "hastscript";
import classNames from "classnames";

import type { Root, ElementContent, Text } from "hast";

type RemarkCalloutOptions = {
  prefix?: string;
  className?: string;
  hasEmoji?: boolean;
  emoji?: string;
};

export function remarkCallout(options: RemarkCalloutOptions = {}) {
  const {
    prefix = "[!note]",
    className = "callout",
    hasEmoji = true,
    emoji = "💡",
  } = options;

  return function (tree: Root) {
    const isCalloutElement = (element: ElementContent) =>
      element && element.type === "text" && element.value.startsWith(prefix);

    const makeNewClassName = (originClassName: string) =>
      classNames(originClassName, className, { hasEmoji });

    const emojiElement = h("span.emoji", [emoji]);
    const makeCalloutContentElement = (parentChildren: ElementContent[]) =>
      h("p", [...parentChildren]);

    visit(tree, "element", function (node) {
      if (isCalloutElement(node.children[0])) {
        const firstChild = node.children[0] as Text;
        firstChild.value = firstChild.value.replace(prefix, "");
        const originClassName = node.properties["class"];

        node.tagName = hasEmoji ? "div" : "p";
        node.properties = {
          ...node.properties,
          class: makeNewClassName(String(originClassName)),
        };

        if (hasEmoji) {
          node.children = [
            emojiElement,
            makeCalloutContentElement(node.children),
          ];
        } else {
          node.children = [makeCalloutContentElement(node.children)];
        }
      }
    });
  };
}
```

remark의 커스텀 플러그인을 만들기 위한 기본적인 방법은 [이 곳](https://unifiedjs.com/learn/guide/create-a-rehype-plugin/)에서, tree에서 내가 원하는 컨텐츠만 선택하여 사용할 수 있도록 하는 `visit` 의 사용법은 [이 곳](https://www.npmjs.com/package/unist-util-visit#visittree-test-visitor-reverse)에서 보충하자. 내가 만드는 태그들의 포멧은 `rehypeStringify` 가 컨텐츠를 잘 직렬화할 수 있도록 `hastscript` 를 통해 생성해주었다.

사용법은 간단하다. 콜아웃의 형태 그대로 HTML만으로 구현해주기에는 무리가 있으니, CSS와 결합하여야 하는데 콜아웃을 감싸고 있는 div태그에 class를 부여하는 것으로 해결 할 예정이다. 그리고 어떠한 컨텐츠가 콜아웃으로 변환될 것인지 판단할 필요가 있었고, 위 코드에서는 prefix로 시작되는 text 컨텐츠를 콜아웃으로 변환해주는 기능을 담당한다. 이것들과 이모지의 유무등 여러 옵션들을 인자로 받아 변경할 수 있도록 설계하였다.

`isCalloutElement` 를 통해 콜아웃으로 변경할 element를 선택하고, 그 element가 가지고 있는 값에서 prefix로 사용된 값을 제거한다. 이후 element의 부모 (p태그가 될 것이다.)의 className에 필요로 한 값을 부여하고, 원래 부모가 가지고 있던 모든 children들을 p태그에 담아 새롭게 부모의 children으로 등록해주면 내가 원하는 영역의 컨텐츠를 내가 원하는 className으로 감쌀 수 있다.

```css
.callout {
  padding: 1rem;
  background: rgba(135, 131, 120, 0.15);
  border-radius: 4px;

  display: flex;
  gap: 1rem;
}

.callout p {
  margin: 0;
}

.callout .emoji {
  margin-top: 4px;
}
```

이제 할 일은 간단하다. 우리가 만든 JSON 포멧의 파일을 remix에서 `loader`를 통해 가져오기만 하면 된다. 먼저, 지금까지의 과정은 MD파일을 JSON 포멧으로 변경하는 것에 불과하기 때문에, `loader` 에서 JSON 포멧의 파일을 가져오도록 만드는 작업이 필요하다. 만약 파일 목록을 보여주는 페이지라면 이전에 개발하였던 `getFilePathsByExtension` 를 확장해도 좋을 것이고, 특정 파일이 가져오는 것이 목표라면 아래처럼 사용해볼 수 있을 것 같다.

```tsx
import fs from "fs-extra";
import path from "node:path";

const outputDir = path.join(basePath, "_generate");

type HasFileWithNameParams = {
  dirPath: string;
  name: string;
};

async function hasFileWithName({ dirPath, name }: HasFileWithNameParams) {
  const response = await fb.glob(`${name}`, {
    cwd: dirPath,
  });

  return response.length > 0;
}

type GetSpecificArticleParams = {
  category: string;
  title: string;
};

export async function getSpecificArticle({
  category,
  title,
}: GetSpecificArticleParams) {
  try {
    const hasFile = await hasFileWithName({
      dirPath: `_generate/${category}`,
      name: `${title}.json`,
    });
    if (!hasFile) {
      throw new Error("no File");
    }
    const path = `${outputDir}/${category}/${title}.json`;
    const fileData: Article = await fs.readJSON(path);
    return fileData;
  } catch (error) {
    if (error instanceof Error && error.message === "no File") {
      throw new Response("This file does not exist.", { status: 500 });
    }
    throw new Response("Failed to load JSON file", { status: 500 });
  }
}
```

```tsx
import { json, Link, useLoaderData } from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

import * as styles from "./style.css";
import articleCSS from "./article.css?url";

export async function loader({ params }: LoaderFunctionArgs) {
  const { category, title } = params;
  const file = await getSpecificArticle({ category, title });

  return json({
    article: file,
    category,
  });
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: articleCSS },
];

function Article() {
  const { article, category } = useLoaderData<typeof loader>();

  return (
    <div className="root-section">
      <div className={styles.wrapper}>
        <p className={styles.metaData}>
          category : <strong>{article.metadata.category}</strong>
          <span> / </span>
          <span>{article.metadata.readingTime}</span>
        </p>
        <article dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
        <Link to="/articles" className={styles.goList}>
          목록으로
        </Link>
      </div>
    </div>
  );
}

export default Article;
```

`getSpecificArticle`의 동작은 파일 path를 인자로 받아 그 path에 파일이 존재하는지 `hasFileWithName`로 확인하고, 존재한다면 파일을 읽어 return하도록 설계하였다. remox에서는 이를 `loader` 로 읽어 사용한다. 안에 내용을 확인해보면 `file` 내부에 `metadata` 로 Markdown의 메타데이터가, `contentHtml` 으로 마크다운 안의 내용이 HTML로 변환되어 저장된 것을 확인할 수 있다. 파일의 고유한 path를 가져오는 방법은 사용자에게 먼저 파일의 목록을 보여주고, 그것을 선택하면 해당 페이지를 보여주는 방법으로 [route 구조를 설계](https://remix.run/docs/en/main/discussion/routes)하면 될 것이다. 다음에는 remix에서 SEO를 위한 sitemap, rss, robots를 구상하는 방법에 대해 정리하고자 한다.
