# 빌드 · 서빙 · 배포 과정

이 문서는 작성한 마크다운 글이 어떤 로직을 거쳐 콘텐츠(JSON)로 변환되는지, 뷰어(viewer)가 어떻게 구성되는지, 그리고 `main` 브랜치에 반영되었을 때 Vercel이 어떻게 배포하는지까지의 전체 흐름을 정리합니다.

## 전체 그림

```
content/**/*.md
      │  (1) 콘텐츠 생성: yarn generate
      ▼
_generate/_article/**/*.json  +  public/**/이미지 사본
      │  (2) Remix 빌드: remix vite:build
      ▼
build/server + build/client  (SSR 번들 / 정적 자산)
      │  (3) 서빙: Remix loader가 JSON을 읽어 렌더링
      ▼
브라우저에 전달되는 HTML
      │  (4) 배포: main 브랜치 push → Vercel이 위 과정을 실행/호스팅
      ▼
https://www.pancodev.io
```

핵심 불변식은 **"Remix 빌드/서버 실행 전에 항상 콘텐츠 생성이 선행된다"** 는 점입니다. `package.json`의 스크립트가 이를 보장합니다.

```json
"dev": "yarn run generate && remix vite:dev",
"build": "yarn run clear:content && yarn run generate && remix vite:build",
"start": "yarn run generate && remix-serve ./build/server/index.js",
"generate": "npx tsx ./script/generate_content.ts",
"clear:content": "rm -rf _generate"
```

## 1. 콘텐츠화 로직 (마크다운 → JSON)

엔트리포인트는 `script/generate_content.ts`이며, `content/article/`을 입력으로 `buildMarkdownFiles`를 실행하고 이미지를 복사합니다.

### 처리 단계

1. **수집 · 정렬** — `prepareSortedMarkdownFiles`

   - `getFilePathsByExtension`로 `content/article/` 하위 `.md`를 재귀 수집
   - `gray-matter`로 front-matter(metadata)와 본문(content)을 분리
   - `created_at` 오름차순 정렬

2. **예약 발행 필터** — `buildMarkdownFiles`

   - `NODE_ENV === "production"`일 때만 `validatePublicationDate`로 발행 시각이 지난 글만 남김
   - 개발 환경에서는 전체 글을 대상으로 함

3. **마크다운 → HTML 변환** — `generateJsonContent`

   - `unified` 파이프라인: `remark-parse` → `remark-gfm` → `remark-rehype`(`allowDangerousHtml`) → `remarkCallout`(커스텀) → `rehype-highlight`(코드 하이라이트) → `rehype-stringify`
   - `reading-time`으로 읽기 시간을 계산해 메타데이터에 주입
   - `index`, `path`(슬러그)도 함께 주입

4. **JSON 기록** — `writeJsonFile` + `generateOutputFilePath`

   - 입력 경로를 출력 경로로 매핑하며 확장자만 `.md` → `.json`으로 치환
   - 원본과 동일한 디렉토리 구조로 `_generate/_article/` 아래에 저장
   - 파일 형태는 `{ metadata, contentHtml }`

5. **이미지 복사** — `copyImageToPublic`
   - `content/` 아래 `png/jpg/jpeg`를 하위 경로를 유지한 채 `public/`으로 복사

### 산출물 예시

```
content/article/react/react-redux-ecosystem.md
        └─▼
_generate/_article/react/react-redux-ecosystem.json   → { metadata, contentHtml }
```

`_generate`와 `public/article`은 모두 빌드 산출물이라 `.gitignore` 대상입니다. 즉 저장소에는 원본 마크다운만 커밋되고, JSON과 이미지 사본은 배포/실행 시점마다 재생성됩니다.

## 2. 뷰어(Viewer) 구성

Remix의 파일 기반 라우팅으로 페이지가 구성됩니다. 각 라우트의 `loader`가 `_generate`의 JSON을 읽어 화면에 전달합니다. JSON 조회 헬퍼는 `api/getContent.ts`에 있습니다.

| 라우트 파일                             | URL                         | 역할                                                        |
| --------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `app/routes/_index/route.tsx`           | `/`                         | 홈(프로필, 이력서 링크, 소셜 링크). `blog.config.json` 기반 |
| `app/routes/articles._index/route.tsx`  | `/articles`                 | 아티클 목록. 전체 JSON을 읽어 최신순 정렬 후 렌더링         |
| `app/routes/article_.$category.$title/` | `/article/:category/:title` | 아티클 상세. 개별 JSON + 같은 카테고리 최신글 5개           |
| `app/routes/rss[.]xml.tsx`              | `/rss.xml`                  | article 기반 RSS 피드                                       |
| `app/routes/sitemap[.]xml.tsx`          | `/sitemap.xml`              | 전체 콘텐츠 사이트맵                                        |
| `app/routes/robots[.]txt.tsx`           | `/robots.txt`               | robots 규칙                                                 |

### 상세 페이지 렌더링 흐름

`article_.$category.$title/route.tsx`가 대표 패턴입니다.

1. `loader`가 URL 파라미터(`category`, `title`)로 `getSpecificContent`를 호출해 해당 JSON을 읽음
2. 같은 카테고리 글 목록을 `getContentsInDir`로 읽어 현재 글을 제외한 최신 5개를 함께 반환
3. `meta`가 `generateMetaTag`로 SEO/OG 태그 생성 (`title`, `description`, `keywords` 활용)
4. 본문은 미리 생성된 `contentHtml`을 `dangerouslySetInnerHTML`로 렌더링. 서두에는 `category / readingTime / created_at(YYYY-MM-DD HH:mm)`을 표시
5. 지도/차트 등 인터랙티브 요소는 `SpecificContent`에서 `ClientOnly`로 감싸 클라이언트에서만 마운트
6. mermaid 다이어그램은 `Mermaid` 컴포넌트가 `ClientOnly`로 클라이언트에서 렌더링 (아래 참고)
7. `VITE_SHOW_GISCUS === "show"`일 때 Giscus 댓글 위젯 노출

### Mermaid 다이어그램 렌더링 (클라이언트 전용)

빌드 파이프라인은 mermaid를 처리하지 않는다. `rehype-highlight`가 `mermaid`를 모르는 언어로 흘려보내 `contentHtml`에는 `<pre><code class="block language-mermaid">…</code></pre>` 코드블록만 남는다. 실제 도형 변환은 브라우저에서 일어난다.

- `app/routes/article_.$category.$title/Mermaid.tsx`가 `article pre code.language-mermaid` 블록을 찾아 `mermaid.render()`로 SVG를 만들고 원본 `<pre>`를 교체한다.
- `import("mermaid")`는 **블록이 존재할 때만** 실행된다. 빌드 시 mermaid는 별도 청크로 코드 스플리팅되며, 다이어그램 없는 글에는 로드되지 않는다.
- 블로그가 다크 테마(`#2c2c2c`)라 `theme: "dark"`로 초기화한다.
- `contentKey`(아티클 slug)를 effect 의존성으로 두어, 글 사이를 이동할 때 새 본문 기준으로 다시 렌더링한다.
- 트레이드오프: SSR 시점에는 코드블록으로 보였다가 클라이언트에서 SVG로 치환되므로 초기 깜빡임이 있고, JS 비활성 환경에서는 mermaid 소스 텍스트가 노출된다.

### 공통 레이아웃

- `app/root.tsx` — 전역 레이아웃. `NavBar`, 폰트/파비콘/RSS 링크, `ErrorBoundary`(404 등) 포함
- `app/common/` — `NavBar`, `DocHead`, `Giscus` 등 공용 컴포넌트
- 스타일은 vanilla-extract(`*.css.ts`)로 작성

## 3. 로컬 실행 방법

```bash
yarn dev     # generate 후 개발 서버 (http://localhost:3000)
yarn build   # _generate 초기화 → generate → 프로덕션 빌드
yarn start   # generate 후 프로덕션 서버 구동
```

- 개발 서버 포트는 `3000` (`vite.config.ts`)
- 네이버 지도 오픈 API는 개발 시 `/openapi-naver` 프록시(`vite.config.ts`)로 우회

## 4. Vercel 배포 (main 브랜치)

### 트리거

이 프로젝트는 Vercel의 Git 연동으로 배포됩니다.

- `main` 브랜치에 push/merge → **Production 배포**
- 그 외 브랜치 push나 PR → **Preview 배포** (커밋별 미리보기 URL)

### 배포 시 일어나는 일

1. Vercel이 커밋을 받아 의존성을 설치하고 프로젝트 빌드를 실행합니다. 이때 `package.json`의 `build` 스크립트가 실행되며, 순서상 **`clear:content` → `generate` → `remix vite:build`** 가 이어집니다.
   - 즉 콘텐츠 JSON 생성과 이미지 복사가 **배포 빌드 시점에** 이루어집니다. 저장소에 JSON을 커밋하지 않아도 되는 이유입니다.
2. 빌드 결과(`build/server`, `build/client`)를 기반으로 Remix 앱이 서버리스 함수 + 정적 자산 형태로 호스팅됩니다.
3. `vercel.json`의 rewrite 규칙이 적용됩니다.
   ```json
   {
     "rewrites": [
       {
         "source": "/openapi-naver/:path*",
         "destination": "https://openapi.naver.com/:path*"
       }
     ]
   }
   ```
   개발 환경의 Vite 프록시와 동일한 경로를 프로덕션에서도 재현하기 위한 설정입니다.
4. 배포가 완료되면 프로덕션 도메인(`https://www.pancodev.io`)에 반영됩니다.

### 환경 변수

빌드/런타임에서 참조하는 값은 Vercel 프로젝트 설정의 Environment Variables에 등록해야 합니다. 코드에서 확인되는 항목:

- `NODE_ENV` — `production`일 때 예약 발행 필터가 활성화됨 (Vercel Production 빌드에서 자동 설정)
- `X_NAVER_CLIENT_SECRET` — 상세 라우트 loader에서 클라이언트로 전달되는 네이버 API용 값
- `VITE_SHOW_GISCUS` — `"show"`일 때 Giscus 댓글 노출

> 실제 배포 트리거 브랜치, 빌드 커맨드 오버라이드, 환경 변수 값 등은 Vercel 대시보드 설정에 따라 달라질 수 있습니다. 저장소에서 확인 가능한 사실(빌드 스크립트 체인과 `vercel.json`)을 기준으로 정리했습니다.

## 요약

1. 글은 마크다운으로 커밋 → 빌드 시 `generate`가 JSON + 이미지 사본을 생성
2. Remix loader가 JSON을 읽어 목록/상세/피드/사이트맵을 렌더링
3. `main` push → Vercel이 `build` 스크립트(=generate 포함)를 실행하고 호스팅 → 프로덕션 반영
