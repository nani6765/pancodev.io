# pancodev.io

프론트엔드 개발자 판다코딩(panco)의 기술 블로그입니다. 마크다운으로 글을 작성하면 빌드 시점에 JSON으로 변환하고, Remix가 이 JSON을 읽어 정적 페이지로 렌더링합니다.

- **Framework**: Remix (Vite 기반) + React 18
- **Styling**: vanilla-extract (`*.css.ts`)
- **Content**: 로컬 마크다운 → 빌드 타임 JSON 변환
- **Deploy**: Vercel
- **Comments**: Giscus

## 핵심 아키텍처

이 프로젝트의 특징은 런타임에 마크다운을 파싱하지 않는다는 점입니다. 대신 빌드/개발 서버 실행 전에 `generate` 스크립트가 모든 마크다운을 HTML이 포함된 JSON으로 미리 변환합니다.

```
content/**/*.md   ──(generate 스크립트)──▶   _generate/**/*.json   ──(Remix loader)──▶   페이지 렌더링
   (원본 글)          remark/rehype 파이프라인       (전처리된 결과물)         fs-extra로 JSON 읽기
```

### 콘텐츠 생성 파이프라인

`yarn generate` (= `script/generate_content.ts`)가 실행하는 흐름입니다.

1. `prepareSortedMarkdownFiles` — `content/` 하위의 `.md`를 재귀 수집하고 `gray-matter`로 front-matter를 분리한 뒤 `created_at` 기준 정렬
2. `generateJsonContent` — `unified` 파이프라인으로 마크다운을 HTML로 변환
   - `remark-parse` → `remark-gfm` → `remark-rehype` → `remarkCallout`(커스텀 플러그인) → `rehype-highlight` → `rehype-stringify`
   - `reading-time`으로 읽기 시간을 계산해 메타데이터에 주입
3. `writeJsonFile` — `_generate/` 하위에 원본과 동일한 디렉토리 구조로 JSON 저장
4. `copyImageToPublic` — `content/` 내 이미지(png/jpg/jpeg)를 `public/`으로 복사

> 프로덕션 빌드(`NODE_ENV === "production"`)에서는 `validatePublicationDate`로 예약 발행일이 지난 글만 생성됩니다.

### 콘텐츠 타입

| 타입        | 원본                          | 생성                  | 라우트                      | 특징                             |
| ----------- | ----------------------------- | --------------------- | --------------------------- | -------------------------------- |
| **article** | `content/article/<category>/` | `_generate/_article/` | `/article/:category/:title` | 카테고리 분류, 읽기 시간, 키워드 |

타입 정의는 루트의 `content.d.ts`(`ArticleMetadata`)에 전역 선언되어 있습니다. `// 빌드과정에서 주입됨` 주석이 붙은 필드는 원본 front-matter가 아니라 생성 파이프라인에서 채워집니다.

> 과거 운영하던 `small_talk`(스몰토크) 콘텐츠는 블로그에서 제외되었으며, 원본 마크다운과 이미지는 루트의 `archive/small_talk/`에 보관되어 있습니다.

## 디렉토리 구조

```
pancodev.io/
├── app/                        # Remix 애플리케이션
│   ├── root.tsx                # 루트 레이아웃 (NavBar, ErrorBoundary, 폰트/파비콘 링크)
│   ├── global.css, reset.css
│   ├── common/                 # 공용 컴포넌트
│   │   ├── NavBar.tsx
│   │   ├── DocHead.tsx         # <head> 메타
│   │   ├── Giscus.tsx          # 댓글 위젯
│   │   ├── faviconLinks.ts
│   │   └── style/              # 공용 vanilla-extract 스타일 (content/list/article/code)
│   └── routes/                 # 파일 기반 라우팅
│       ├── _index/                        # 홈 (/)
│       ├── articles._index/               # 아티클 목록 (/articles)
│       ├── article_.$category.$title/     # 아티클 상세
│       │   └── SpecificContent/           # 글 안에 삽입되는 인터랙티브 컴포넌트
│       │       ├── NaverMap/              #  - 네이버 지도 + 그리기 도구
│       │       └── RangeSelector/         #  - 차트 x축 범위 선택기
│       ├── rss[.]xml.tsx                   # RSS 피드
│       ├── sitemap[.]xml.tsx               # 사이트맵
│       └── robots[.]txt.tsx                # robots.txt
│
├── api/
│   └── getContent.ts           # 생성된 JSON 조회 (목록/개별/미리보기)
│
├── function/                   # 런타임 공용 유틸
│   ├── getFilePathsByExtension.ts   # 확장자 기준 재귀 파일 수집
│   ├── generateMetaTag.ts           # SEO 메타 태그 생성
│   ├── hasFileWithName.ts
│   └── sortingContentsByCreate.ts
│
├── script/                     # 빌드 타임 콘텐츠 생성
│   ├── generate_content.ts     # 엔트리포인트
│   ├── buildMarkdownFiles.ts   # 디렉토리 단위 변환 오케스트레이션
│   ├── copyImageToPublic.ts    # 이미지 → public 복사
│   └── function/
│       ├── prepareSortedMarkdownFiles.ts
│       ├── generateJsonContent.ts      # unified 마크다운→HTML 변환
│       ├── remarkPlugins.ts            # remarkCallout 커스텀 플러그인
│       ├── generateOutputFilePath.ts
│       ├── validatePublicationDate.ts
│       └── writeJsonFile.ts
│
├── content/                    # 원본 마크다운 (article/)
├── _generate/                  # 생성된 JSON (빌드 산출물, git 무시 대상)
├── public/                     # 정적 자산 (이미지, 폰트, 아이콘, 파비콘)
├── archive/                    # 블로그에서 제외된 보관 콘텐츠 (small_talk 원본)
├── util/dayjs.helper.ts
│
├── blog.config.json            # 블로그 전역 설정 (제목, 경로, 링크, 프로필 등)
├── content.d.ts                # 콘텐츠/메타데이터 전역 타입 선언
├── vite.config.ts              # Vite + Remix + vanilla-extract + 네이버 프록시
├── vercel.json                 # Vercel rewrites (네이버 API 프록시)
└── tsconfig.json               # 경로 별칭 (@/, @app/, @commonStyle/)
```

## 데이터 흐름 (라우트 예시)

`article_.$category.$title/route.tsx`가 대표적인 패턴을 보여줍니다.

- `loader`는 `getSpecificContent`로 해당 글 JSON을, `getContentsInDir`로 같은 카테고리 글 목록을 읽어 최근글 5개를 함께 반환
- `meta`는 `generateMetaTag`로 SEO 태그를 구성
- 본문은 `dangerouslySetInnerHTML`로 미리 만들어진 `contentHtml`을 그대로 렌더링
- 지도/차트 같은 인터랙티브 요소는 `SpecificContent`에서 `ClientOnly`로 클라이언트에서만 마운트

## 설정 포인트

- **경로 별칭** (`tsconfig.json`): `@/*`(루트), `@app/*`(app), `@commonStyle/*`(공용 스타일)
- **네이버 지도 API 프록시**: 개발은 `vite.config.ts`의 `/openapi-naver`, 배포는 `vercel.json`의 rewrite로 처리
- **블로그 메타 정보**: 제목/설명/작성자/소셜 링크/네비게이션 경로는 모두 `blog.config.json`에서 관리

## 개발 / 빌드

```bash
yarn dev      # generate 실행 후 개발 서버 (http://localhost:3000)
yarn build    # _generate 초기화 → generate → 프로덕션 빌드
yarn start    # generate 실행 후 프로덕션 서버 구동
yarn generate # 마크다운 → JSON 변환만 단독 실행
```

핵심은 `dev`/`build`/`start` 모두 실행 전에 `generate`가 선행된다는 점입니다. 즉 마크다운 원본을 수정하면 서버를 다시 띄워 콘텐츠를 재생성해야 반영됩니다.
