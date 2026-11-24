# pancodev.io

프론트엔드 개발자 판다코딩(panco)의 기술 블로그입니다. → https://www.pancodev.io

마크다운으로 글을 쓰면 빌드 시점에 HTML이 담긴 JSON으로 변환하고, Remix loader가 그 JSON을 읽어 페이지를 렌더링합니다. 런타임에는 마크다운을 파싱하지 않습니다.

| 구분      | 사용 기술                                                       |
| --------- | --------------------------------------------------------------- |
| Framework | Remix 2 (Vite 플러그인) + React 18                              |
| Styling   | vanilla-extract (`*.css.ts`) + 일부 전역 CSS                    |
| Content   | 로컬 마크다운 → unified(remark/rehype) → JSON                   |
| 클라이언트 렌더링 | mermaid(다이어그램), Chart.js, 네이버 지도 API           |
| 댓글/분석 | Giscus, Google Analytics(gtag)                                  |
| Deploy    | Vercel (`main` push → Production)                               |

## 빠른 시작

```bash
yarn install
yarn dev        # generate 실행 후 개발 서버 (http://localhost:3000)
```

| 스크립트             | 동작                                                     |
| -------------------- | -------------------------------------------------------- |
| `yarn dev`           | `generate` → `remix vite:dev`                            |
| `yarn build`         | `clear:content` → `generate` → `remix vite:build`        |
| `yarn start`         | `generate` → `remix-serve ./build/server/index.js`       |
| `yarn generate`      | 마크다운 → JSON 변환과 이미지 복사만 실행                |
| `yarn clear:content` | `_generate/` 삭제                                        |

`dev`/`build`/`start` 모두 실행 전에 `generate`가 먼저 돕니다. 개발 서버는 마크다운 변경을 감지하지 않으므로, 글을 수정한 뒤에는 서버를 다시 띄우거나 `yarn generate`를 실행해야 반영됩니다.

## 아키텍처

```
content/article/<category>/*.md
        │  yarn generate (script/generate_content.ts)
        ▼
_generate/_article/<category>/*.json   +   public/article/**/이미지 사본
        │  Remix loader (api/getContent.ts, fs-extra로 JSON 읽기)
        ▼
SSR HTML  →  브라우저에서 mermaid / 지도 / 차트를 추가로 렌더링
```

### 콘텐츠 생성 파이프라인

1. `prepareSortedMarkdownFiles` — `content/article/` 하위 `.md`를 재귀 수집하고 `gray-matter`로 front-matter를 분리한 뒤 `created_at` 오름차순 정렬
2. 예약 발행 필터 — `NODE_ENV === "production"`일 때만 `validatePublicationDate`로 발행 시각(KST 기준)이 지난 글만 남김
3. `generateJsonContent` — 마크다운을 HTML로 변환하고 `index`, `path`(파일명 slug), `readingTime`을 메타데이터에 주입
   - `remark-parse` → `remark-gfm` → `remark-rehype`(`allowDangerousHtml`) → `remarkCallout`(커스텀) → `rehype-highlight` → `rehype-stringify`
4. `writeJsonFile` — 원본과 같은 디렉토리 구조로 `_generate/_article/`에 `{ metadata, contentHtml }` 저장
5. `copyImageToPublic` — `content/` 아래 png/jpg/jpeg를 같은 하위 경로로 `public/`에 복사 (예: `public/article/react/image/...`)

`_generate/`와 `public/article/`은 빌드 산출물이라 git에 커밋하지 않습니다.

### 클라이언트 전용 렌더링

빌드 결과 HTML에 포함되지 않고 브라우저에서 `ClientOnly`로 마운트되는 요소입니다.

- **Mermaid** (`article_.$category.$title/Mermaid.tsx`) — 본문의 `code.language-mermaid` 블록을 찾아 SVG로 교체합니다. 블록이 있을 때만 `import("mermaid")`를 실행합니다.
- **SpecificContent** — 글 slug를 키로 특정 글에만 인터랙티브 컴포넌트를 붙입니다.
  - `guidance-naver-map-and-drawing-manager` → 네이버 지도 + 그리기 도구
  - `x-axis-range-selector` → Chart.js X축 범위 선택기

### 라우트

| 파일                                    | URL                         | 역할                                              |
| --------------------------------------- | --------------------------- | ------------------------------------------------- |
| `app/routes/_index/`                    | `/`                         | 홈 (프로필, 이력서, 소셜 링크)                    |
| `app/routes/articles._index/`           | `/articles`                 | 전체 아티클 목록 (최신순)                         |
| `app/routes/article_.$category.$title/` | `/article/:category/:title` | 아티클 상세 + 같은 카테고리 최신글 5개 + Giscus   |
| `app/routes/rss[.]xml.tsx`              | `/rss.xml`                  | RSS 피드                                          |
| `app/routes/sitemap[.]xml.tsx`          | `/sitemap.xml`              | 사이트맵                                          |
| `app/routes/robots[.]txt.tsx`           | `/robots.txt`               | robots 규칙                                       |
| `app/routes/api.naver-search.tsx`      | `/api/naver-search`         | 네이버 지역 검색 프록시 (지도 글의 장소 검색용)   |

## 디렉토리 구조

```
pancodev.io/
├── app/                         # Remix 애플리케이션
│   ├── root.tsx                 # 루트 레이아웃 (NavBar, ErrorBoundary, 폰트/파비콘/RSS 링크)
│   ├── global.css, reset.css
│   ├── common/                  # NavBar, DocHead(GA 스크립트), Giscus, 공용 스타일
│   └── routes/                  # 파일 기반 라우팅 (위 표 참고)
│       └── article_.$category.$title/
│           ├── Mermaid.tsx
│           └── SpecificContent/ # NaverMap/, RangeSelector/
├── api/getContent.ts            # 생성된 JSON 조회 (목록 / 개별 / slug 미리보기)
├── function/                    # 런타임·빌드 공용 유틸 (파일 수집, 메타 태그, 정렬)
├── script/                      # 빌드 타임 콘텐츠 생성
│   ├── generate_content.ts      # 엔트리포인트
│   ├── buildMarkdownFiles.ts
│   ├── copyImageToPublic.ts
│   └── function/                # 수집·변환·저장·발행일 검증·remarkCallout
├── util/dayjs.helper.ts
│
├── content/article/<category>/  # 원본 마크다운과 이미지 (image/<slug>/)
├── archive/small_talk/          # 블로그에서 제외한 과거 스몰토크 원본
├── docs/                        # 프로젝트 문서 (아래 참고)
├── public/                      # 정적 자산 (아이콘, 폰트, 파비콘, 프로필)
│
├── .claude/skills/, .kiro/skills/  # 글쓰기 보조 에이전트 스킬 (explore-topic, write-article)
├── AGENT.md                     # 코딩 에이전트 공통 지침
│
├── blog.config.json             # 제목, 작성자, 경로, 홈 소개, 링크, 네비게이션
├── content.d.ts                 # ArticleMetadata / Article 전역 타입
├── vite.config.ts               # Remix + vanilla-extract + tsconfig paths, /openapi-naver 프록시 (현재 앱 코드에서는 미사용)
├── vercel.json                  # /openapi-naver rewrite (현재 앱 코드에서는 미사용)
└── tsconfig.json                # 경로 별칭 @/*, @app/*, @commonStyle/*
```

## 글 작성 요약

- 위치: `content/article/<category>/<slug>.md` — 폴더명이 카테고리, 파일명이 URL slug입니다.
- front-matter: `title`, `description`, `keywords`, `category`, `created_at`(`YYYY-MM-DD HH:mm`, KST)
- 이미지: `content/article/<category>/image/<slug>/`에 두고 상대 경로로 참조
- 확장 문법: `[!note]` 콜아웃, ` ```mermaid ` 다이어그램
- `created_at`을 미래 시각으로 두면 프로덕션에서는 그 시각 이후 빌드부터 노출됩니다. 로컬에서는 필터 없이 모두 보입니다.

자세한 규칙은 [아티클 작성 가이드](./docs/writing-articles.md)를 참고하세요.

## 환경 변수

로컬은 `.env`(git 무시 대상), 배포는 Vercel 프로젝트 설정에 등록합니다.

| 변수                    | 사용 위치                        | 용도                                  |
| ----------------------- | -------------------------------- | ------------------------------------- |
| `VITE_GA_TRACKING_ID`   | `app/common/DocHead.tsx`         | Google Analytics 측정 ID              |
| `VITE_NCP_CLIENT_ID`    | `NaverMap/loadNaverMapScript.ts` | 네이버 지도 JS API 키 (`ncpKeyId`)    |
| `VITE_X_NAVER_CLIENT_ID`| `app/routes/api.naver-search.tsx` | 네이버 검색 Open API Client ID        |
| `X_NAVER_CLIENT_SECRET` | `app/routes/api.naver-search.tsx` | 네이버 검색 Open API Client Secret    |
| `VITE_SHOW_GISCUS`      | 아티클 상세 route                | `"show"`일 때만 Giscus 댓글 노출      |
| `VITE_DATA_REPO_ID`     | `app/common/Giscus.tsx`          | Giscus repo ID                        |
| `VITE_DATA_CATEGORY_ID` | `app/common/Giscus.tsx`          | Giscus category ID                    |

`NODE_ENV`는 별도로 설정하지 않습니다. 프로덕션 빌드에서 `production`으로 잡히며, 이때 예약 발행 필터가 동작합니다.

## 배포

Vercel Git 연동을 사용합니다. `main`에 push하면 Production, 그 외 브랜치와 PR은 Preview로 배포됩니다. 배포 빌드에서 `yarn build`가 실행되므로 JSON 생성과 이미지 복사도 매번 새로 이뤄집니다. 네이버 검색 Open API는 `/api/naver-search` 서버 라우트가 호출하며 Client Secret은 서버에서만 사용합니다. `vite.config.ts`와 `vercel.json`의 `/openapi-naver` 프록시 설정은 남아 있지만 앱 코드에서는 더 이상 쓰지 않습니다.

## 문서

| 문서                                           | 내용                                                       |
| ---------------------------------------------- | ---------------------------------------------------------- |
| [docs/index.md](./docs/index.md)               | 문서 목록                                                  |
| [docs/writing-articles.md](./docs/writing-articles.md) | 폴더 구조, front-matter, 이미지, 콜아웃, mermaid, 체크리스트 |
| [docs/build-and-deploy.md](./docs/build-and-deploy.md) | 생성 파이프라인, 라우트 구성, Vercel 배포 흐름        |
| [docs/article-index.md](./docs/article-index.md) | 발행된 전체 글 목록 (카테고리·연도별)                    |
