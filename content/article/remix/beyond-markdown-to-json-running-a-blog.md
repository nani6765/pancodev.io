---
title: "마크다운 블로그, 그 다음 — 코드 하이라이팅부터 살아있는 컴포넌트까지"
description: A follow-up to my earlier Markdown-to-JSON post. After running this blog for a while, the pipeline grew — this walks through how it now handles code highlighting with rehype-highlight and, more interestingly, how a static Markdown article can host a live, client-only React component (a map, a chart) keyed by its slug.
keywords:
  ["remark", "rehype", "ClientOnly", "dangerouslySetInnerHTML", "블로그"]
category: remix
created_at: 2025-11-15 22:00
---

# 마크다운 블로그, 그 다음 — 코드 하이라이팅부터 살아있는 컴포넌트까지

너무 오랫동안 글을 발행하지 않았다. 초안만 잡아두고 방치한 글이 몇 개고, 그때마다 "다음 주엔 꼭 쓴다"를 반복했다. ~~그 다음 주는 대체 언제 오는가.~~ 그 죄책감을 조금이라도 덜어보고자, 오늘은 거창한 주제 대신 이 블로그가 게시글 마크다운을 어떻게 처리하고 관리하는지 그 일련의 동작을 정리해보려 한다.

사실 [예전에 마크다운을 JSON으로 변환하는 글](/article/remix/how-to-convert-markdown-to-json)을 쓴 적이 있다. `unified`로 파이프라인을 세우고, `gray-matter`로 메타데이터를 뽑고, 변환한 JSON을 remix의 `loader`로 서빙하는 기본 골격까지 다뤘다. 그 뒤로 블로그를 굴리며 이것저것 붙이다 보니 그때의 스크립트와는 꽤 달라졌다. 이 글은 그 "그 다음"의 기록이다. 직접 블로그를 만들어보려는 사람에게 몇 가지 참고가 되었으면 한다.

#### 파이프라인, 다시 보기

예전 글에서는 파일을 읽고, 변환하고, 저장하는 걸 한 함수(`buildMarkdownFiles`) 안에 다 욱여넣었다. 지금은 역할별로 쪼개져 있다. 마크다운 파일을 모아 정렬하는 `prepareSortedMarkdownFiles`, 실제 변환을 담당하는 `generateJsonContent`, 결과를 파일로 쓰는 `writeJsonFile` 정도로 나뉜다. 하는 일 자체는 예전과 같지만, 기능을 하나씩 붙일 때마다 한 함수가 비대해지는 걸 견디기 어려워 손을 댄 결과다. ~~물론 리팩토링의 절반은 그냥 내 마음의 평화를 위한 것이었다.~~

변환의 심장은 여전히 `generateJsonContent` 안의 `processor`다. 여기서 마크다운이 HTML로 바뀐다. 예전 글과 비교했을 때 눈에 띄게 달라진 건 플러그인 체인이 길어졌다는 점이다.

```tsx
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(remarkCallout) // [!note] 를 콜아웃 박스로
  .use(highlight, { prefix: "block" }) // 코드블록 신택스 하이라이팅
  .use(rehypeStringify);
```

`remarkGfm`으로 취소선을, 직접 만든 `remarkCallout`으로 콜아웃 박스를 처리하는 건 [예전 글](/article/remix/how-to-convert-markdown-to-json)에서 다뤘으니 여기선 넘어가자. 이번에 이야기할 건 그 뒤에 붙은 두 가지다. 코드 블록에 색을 입히는 일, 그리고 정적인 글 안에 살아있는 컴포넌트를 심는 일.

#### 코드 블록에 색을 입히기

지금 이 글에서 보고 있는 코드 블록에 색이 입혀져 있는 걸 눈치챘는가. 마크다운을 그냥 HTML로 변환하기만 하면 코드 블록은 `<pre><code>`로 감싸진 밋밋한 검은 텍스트 덩어리가 된다. 언어별로 키워드와 문자열에 색을 입히려면 별도의 처리가 필요하다.

방법은 크게 둘이다. 브라우저에서 클라이언트 사이드로 하이라이팅하거나(대표적으로 [Prism](https://prismjs.com/), [highlight.js](https://highlightjs.org/)), 빌드 타임에 미리 색을 입혀 마크업으로 박아버리거나. 나는 이미 빌드 타임에 마크다운을 JSON으로 변환하고 있으니 후자가 자연스러웠다. 그 변환 과정에 하이라이팅까지 얹으면 클라이언트는 완성된 마크업만 받으면 되니까.

그래서 [rehype-highlight](https://github.com/rehypejs/rehype-highlight)를 체인에 추가했다. 이 플러그인은 rehype(HTML을 다루는 단계) 트리를 순회하며 코드 블록을 파싱해 토큰마다 `class`를 붙여준다.

```tsx
.use(highlight, { prefix: "block" })
```

`prefix: "block"` 옵션을 준 이유가 있다. `rehype-highlight`는 기본적으로 `hljs-`라는 접두사로 클래스를 다는데, 내가 쓰는 다른 스타일이나 클래스명과 섞이는 게 싫어서 접두사를 `block`으로 바꿨다. 이렇게 붙은 클래스에 실제 색을 입히는 건 결국 CSS의 몫이다. `rehype-highlight`는 색을 정해주지 않는다. 어떤 토큰에 어떤 class가 붙는지만 정해주고, 그 class에 무슨 색을 줄지는 [highlight.js가 제공하는 테마 CSS](https://github.com/highlightjs/highlight.js/tree/main/src/styles) 중 하나를 골라 얹거나 직접 쓰면 된다. 나는 마음에 드는 테마 하나를 가져와 접두사만 맞춰 쓰고 있다.

#### 정적 글에 살아있는 컴포넌트 심기

여기서부터가 이 글을 쓰게 된 진짜 이유다. 이 블로그의 글은 전부 빌드 타임에 HTML 문자열로 변환된 정적 컨텐츠다. remix에서는 이 문자열을 이렇게 그린다.

```tsx
<article dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
```

[`dangerouslySetInnerHTML`](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)은 이름 그대로 위험한 녀석이지만, 내가 직접 쓴 마크다운을 내가 변환한 결과라 신뢰할 수 있으니 여기선 감수하고 쓴다. 문제는 이렇게 그린 컨텐츠는 그냥 죽은 마크업이라는 점이다. 그런데 [네이버 지도로 도형을 그리는 글](/article/react/guidance-naver-map-and-drawing-manager)이나 [차트의 x축 범위를 조절하는 글](/article/react/x-axis-range-selector)처럼, 어떤 글은 글 안에서 독자가 직접 만져볼 수 있는 인터랙티브 데모가 있어야 설득력이 산다. 정적 마크다운 문자열 안에 살아있는 React 컴포넌트를 어떻게 끼워넣을 것인가?

내가 택한 방법은 단순하다. 본문은 본문대로 그리되, 특정 slug를 가진 글에 한해 그 아래에 컴포넌트를 따로 붙이는 것이다. slug를 키로 컴포넌트를 매핑해두면 된다.

```tsx
// SpecificContent/index.tsx
export default function Component({ path }: Props) {
  const componentMap = {
    "guidance-naver-map-and-drawing-manager": <NaverMap />,
    "x-axis-range-selector": <RangeSelector />,
  };

  return (
    <div id="specific_content">
      {path in componentMap ? componentMap[path] : null}
    </div>
  );
}
```

여기서 `path`는 글의 slug다. 지도 데모가 필요한 글의 slug라면 `<NaverMap />`이, 차트 글이라면 `<RangeSelector />`가 렌더링되고, 매핑에 없는 대부분의 평범한 글은 아무것도 붙지 않고 `null`로 지나간다. 새로운 인터랙티브 글을 쓰고 싶으면 컴포넌트를 만들어 이 맵에 한 줄 추가하면 된다.

그런데 함정이 하나 있다. 지도나 차트 같은 컴포넌트는 `window`나 브라우저 API에 의존하는 클라이언트 전용 코드다. remix는 기본적으로 서버에서 먼저 렌더링을 시도하는데, 서버엔 `window`가 없으니 그대로 두면 터진다. 그래서 [`remix-utils`의 `ClientOnly`](https://github.com/sergiodxa/remix-utils#clientonly)로 감싸 클라이언트에서만 그려지도록 했다.

```tsx
<article dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
<ClientOnly fallback={null}>
  {() => <SpecificContent path={article.metadata.path} />}
</ClientOnly>
```

`ClientOnly`는 서버 렌더링 시점엔 `fallback`(여기선 `null`)을 그리고, 하이드레이션이 끝난 클라이언트에서만 실제 컴포넌트를 그린다. 덕분에 정적으로 뽑아둔 본문 HTML 바로 아래에, 필요한 글에서만 살아 움직이는 컴포넌트가 붙는다. 같은 방식으로 [Mermaid](https://mermaid.js.org/) 다이어그램도 클라이언트에서만 그리도록 처리해뒀다. 마크다운은 어디까지나 죽은 문자열인데, 그 옆에 살아있는 섬을 하나 띄우는 셈이다.

#### 마치며

정리하고 보니 대단한 기술은 아니다. 빌드 타임에 색을 입히고, slug로 컴포넌트를 매핑하고, 클라이언트 전용 렌더링으로 감싸는 것. 다만 "정적 마크다운 블로그"와 "인터랙티브 데모"라는, 언뜻 안 어울리는 두 요구를 어떻게든 한 페이지에 욱여넣으려다 나온 나름의 타협점이다. 더 우아한 방법도 분명 있을 것이다. 마크다운 안에 컴포넌트를 직접 쓰는 [MDX](https://mdxjs.com/) 같은 선택지도 있었지만, 이미 굴러가는 변환 파이프라인을 크게 뜯고 싶지 않아 지금의 방식에 안착했다.

블로그를 직접 만들어 굴린다는 건 이런 자잘한 결정의 누적이다. 남이 만든 정답을 가져다 쓰는 게 아니라, 내 컨텐츠와 내 게으름에 맞는 구조를 그때그때 타협해 쌓아가는 일. 이 글이 비슷한 걸 만들어보려는 누군가에게 작은 참고라도 되었길 바란다. 그리고 나에게는, 다음 글까지 이렇게 오래 걸리지 않겠다는 다짐이 되었길. ~~이 다짐이 몇 번째인지는 세지 않기로 한다.~~
