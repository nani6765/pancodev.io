---
title: "Firebase로 Next 프로젝트 배포하기 : page router / next-auth / next-i18next"
description: This article provides a step-by-step guide for deploying a Next.js project to Firebase Hosting, covering essential points when migrating from Vercel. It details compatibility considerations for using Next Page Router and next-auth, setting up Firebase hosting, and handling configurations for libraries like next-i18next and tanstack-query DevTools to ensure a seamless deployment process.
keywords: ["firebase", "hosting", "next-auth", "next-i18next"]
category: next
created_at: 2024-08-25 10:25
---

# Firebase로 Next 프로젝트 배포하기 : page router / next-auth / next-i18next

회사에서 vercel로 배포중인 프로젝트를 firebase로 배포환경을 변경해야 할 일이 생겼다. 우리 회사는 원래 firebase와 gcp를 사용하고 있었기에 관리포인트 일원화가 목적이다. 처음에는 단순히 배포환경만 변경해주면 끝날 일 같았으나, 생각보다 vercel에서 자동으로 관리해주느 포인트가 많았기에 시행착오를 겪었다. 이에 firebase로 next app을 배포할 시 유의할 점을 정리해보고자 한다.

#### Using Firebase Hosting (not App Hosting)

next와 같은 풀스텍 웹 앱을 배포하기 위해 firebase에서는 [app hosting](https://firebase.google.com/docs/app-hosting/get-started)을 지원해준다. 허나 글을 작성하는 지금 기준으로 아직 preview release 상태이다. 내용을 읽어보면 GA와 관련한 문제인 것 같지만 지금 작업하고자 하는 프로젝트가 회사의 핵심 프로젝트이라 선뜻 선택하기 어려웠다. 이에 아직 preview release인 app hosting을 사용하지 않고 firebase hosting을 선택하기로 결정했다.

#### Using Page Router

next app router + next-auth + firebase hosting 환경에서 next-auth가 동작하지 않는 것을 확인했다. firebase-functions에서 next-routing을 못 읽는 것으로 추정되는데, api/auth/session 요청에 503 timeout에러가 발생했다. 해당 환경에서 해결방법을 강구했으면 좋았겠지만 찾지 못하였고 next page router를 사용하기로 결정했다.

#### Dependency Version

본 게시글에서 주요 라이브러리의 버전은 다음과 같다.

```
- firebase-tools@13.13.3
- next@13.4.12 ~ 14.2.4
- next-auth@^4.24.7
- react@^18 ~ ^18.3.0
- react-dom@^18 ~ ^18.3.0
- "i18next": "^23.14.0"
- "next-i18next": "^15.3.0"
- "react-i18next": "^15.0.0"
```

[firebase의 Integrate Next.js 문서](https://firebase.google.com/docs/hosting/frameworks/nextjs)를 확인해보면 firebase-tools@13.13.3 기준 지원되는 Next 버전은 13.4.7까지 이나, 해당 Next 버전에서 Next-image의 `fetchPriority` 에러가 발생한다. 해당 에러는 개발 환경에서만 발생하며, Next 14.2.4 버전에서 해결되었다. 물론 개발환경에만 발생하는 에러이기에 신경쓰지 않아도 되지만 image 태그를 Jest등의 테스트 코드로 확인할 때 해당 에러로 인해 실패하는 번거로움이 있었다. 편의를 위해 Next 버전을 올려서 사용하였고 배포에 문제가 없음을 확인했다. 아무래도 Next 14에서 등장한 새로운 기능들이 아직 firebase에서 지원을 안해주고 있는 것으로 추정하는데 정확히 어떤 feature가 지원되지 않는 것 까지는 분석하지 못했다. 혹시 본인의 프로젝트가 배포에 실패하고 next 버전이 높다면 공식문서가 지정하는 곳까지 next 버전을 낮춰서 사용해보자.

#### Setup Firebase

위에서 설명한 package가 설치되어 있고, 본인의 next app이 있다고 가정하고 firebase를 setup하는 과정부터 진행하겠다. 먼저 **firebase.json**파일을 생성하여 hosting 설정을 해주어야 한다.

```json
{
  "hosting": {
    "source": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "frameworksBackend": {
      "region": "asia-east1", // user-region
      "memory": "512MiB" // important
    }
  }
}
```

만약 staging, production과 같이 배포환경을 두개 이상 가지고 있을 경우 `hosting` 을 배열로 변경하고 target에 **.firebaserc**에서 설정 할 project alias를 추가해주면 된다.

```json
{
  "hosting": [
    {
      "target": "staging"
      /* ... */
    },
    {
      "target": "production"
      /* ... */
    }
  ]
}
```

다음으론 firebase project 세팅인 **.firebaserc**이다. firebase-id, firebase-hosting-id에 각각 본인의 firebase ID와 firebase hosting을 생성했을 때에 확인할 수 있는 firebase hosting id를 기입하면 된다. 이 두 정보는 본인의 firebase console에서 확인할 수 있다.

```json
{
  "projects": {
    "default": "firebase-id", // default
    "production": "firebase-prodction-id", // prodction alias
    "staging": "firebase-staging-id" // staging alias
  },
  "targets": {
    "firebase-staging-id": {
      "hosting": {
        "firebase-hosting-id": [
          "firebase-hosting-alias"
        ]
      }
    },
    "firebase-prodction-id": {
      "hosting": {
	      /* ... */
      }
    }
  },
```

#### Next-Auth : Cookie Setting

firebase에서는 `__session` 으로 지정된 쿠키만 [server-front간 전송을 지원](https://firebase.google.com/docs/hosting/manage-cache)해준다. 문서를 보고 오해할 수 있는데 쿠키 이름이 `__session` 으로 prefix되어야 하는 것이 아니라 반드시 `__session` 이어야 한다. 따라서 firebase hosting환경에서 유저가 custom하게 server-front간 공유할 수 있는 쿠키 데이터는 한개인데, 만약 next-auth를 사용하고 있다면 `sessionToken` 에게 이 자리를 양보해주어야 한다.

```json
// your-project/api/auth/[...nextauth].ts

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  httpOnly: 'not localhost', // pseudo code
  secure: 'not localhost', // pseudo code
};

/* ... */
  cookies: {
    // NOTE: https://next-auth.js.org/configuration/options#cookies
    sessionToken: {
      name: `__session`,
      options: COOKIE_OPTIONS,
    }
  },
/* ... */
```

next-auth의 `sessionToken` 을 next-server에게 전송해주어야 하는 이유는 기본적으로 next-auth의 session을 관리하기 위해서도 필요하지만 next-auth 내부에서 access token을 재발급받는 로직에서 `sessionToken` 값이 없다면 재발급을 수행하지 못하기 때문이다. 여기서 [CSRF 공격](https://portswigger.net/web-security/csrf)을 방지하기 위해 사용되는 csrf-token이 생각날 수 있다. [next-auth의 api문서](https://next-auth.js.org/getting-started/rest-api)를 확인해보면 로그아웃, 로그인과 같은 `POST` 요청에서 csrf-token이 필요하다고 명시되어 있다. 다만 [configuration option](https://next-auth.js.org/configuration/options)을 확인해보면 `cookies` 에 대한 설정은 optional이기에 따로 명시하지 않아도 무방하다.

[!note] csrf-token에 대한 추가적인 설정 없이 로그인, 로그아웃, access token 재발급이 정상적으로 이루어짐을 확인했다. 다만, firebase hosting 특성 상 서버의 도메인과 클라이언트의 도메인이 다른값으로 분리되기에 same Site에 위배된다. 이에 csrf-token이 공유되지 못한다면 CSRF의 위험성이 남아있다. 이 내용은 조금 더 추가적인 실험을 거친 후 보충하도록 하겠다.

#### Error: next-i18next was unable to find a user config

i18next를 사용하고 있다면 배포 시 위와 같은 에러를 마주칠 수 있다. 이는 [next.config.js를 firebase가 가져오지 못하기 때문](https://github.com/firebase/firebase-tools/issues/5607)으로 next-i18next-config.js파일을 public 폴더로 이관하고 그에 따른 path 변경 사항을 next.config.js에 반영한다. 이후 **I18NEXT_DEFAULT_CONFIG_PATH**를 본인의 환경변수에 추가하면 next.config.js를 firebase에게 넘겨줄 수 있다.

```
// .env

I18NEXT_DEFAULT_CONFIG_PATH="./public/next-i18next.config.js"
```

#### Tanstack-query Dev tools

서문에서 따로 언급은 하지 않았지만 대부분의 프로젝트에서 tanstack query를 사용하고 그에 따른 dev-tool을 사용한다고 생각한다. (아니라면 SWR과 같은 데이터 패칭을 사용하거나, 사용하지 않는다면 이 단락은 넘어가도 무방하다.) [tanstack-query 공식문서](https://tanstack.com/query/v4/docs/framework/react/devtools)를 확인해보면 dev-tools는 배포시 제거된다고 나와있으나, firebase hosting 환경에선 제거되지 않고 에러가 발생한다. 이에 `@tanstack/react-query-devtools`는 로컬환경에서만 가져올 수 있도록 코드를 수정할 필요가 있다. 아래 코드에서 ‘not localhost’는 pseudo code다.

```tsx
import dynamic from "next/dynamic";
import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools
    ),
  {
    ssr: false,
  }
);
function Providers({ children }: React.PropsWithChildren) {
  const [client] = useState(new QueryClient());
  return (
    <QueryClientProvider client={client}>
      {children}
      {"not localhost" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
export default Providers;
```

이렇게 하면 프로젝트의 code 단에서 할 수 있는 세팅은 마무리 되었다. 이제 firebase hosting을 생성하면 자동으로 생성되는 gcp 프로젝트에서 조금의 세팅을 마치고 본인의 CI/CD에 통합하면 된다. 다음 Post에서는 그 과정을 알아보겠다.
