---
title: React 19 릴리즈
description: 이번 업데이트에선 Actions, useOptimistic, use 및 Server Components와 같은 새로운 기능들이 포함되어 있다.
created_at: 2024-12-08 16:40
---

2024년 4월 Beta 버전을 발표한 데에 이어서 [지난 5일 React 19버전이 RC로 출시](https://react.dev/blog/2024/12/05/react-19)되었다. 이제 `npm`을 통해 react 19버전을 설치하여 사용해볼 수 있다. **이번 업데이트에선 Actions, useOptimistic, use 및 Server Components와 같은 새로운 기능들이 포함되어 있다.** ~~개인적으로는 React Reconciler가 experimental package에서 벗어나길 기다리고 있다.~~

1. Actions는 대기 중인 상태, 오류, 양식 및 낙관적인 업데이트를 자동으로 관리해주는 역할을 수행할 수 있다. 이제까지 수동으로 진행했던 loading, error와 같은 동작 처리를 `useTransition`을 통해 비동기 트렌지션을 관리할 수 있게 되었다.
2. `useOptimistic`로 낙관적 업데이트를 처리할 수 있다. 비동기 요청을 기다리지 않고 최종 상태를 성공했다고 가정하고 먼저 업데이트 하는 것이다. `useOptimistic`는 낙관적인 업데이트를 수행하고, 업데이트가 완료되거나 오류가 발생하면 다시 최초값으로 회귀한다.
3. 이러한 액션을 쉽게 처리할 수 있는 `useActionState`도 같이 등장하였다. 이 Actions로 양식을 자동으로 제출하기 위해 <form>, <input>, <button> 요소의 action 및 formAction 프로퍼티로 함수를 전달하는 기능이 추가되었다.
4. 이와 연계하여 같이 등장한 `useFormStatus`는 form이 context 제공자인 것처럼 상위 <form>의 상태를 읽어 하위 요소에게 상태를 전달해줄 수 있다.
5. 랜더링에서만 새로운 리소스를 읽을 수 있는 `use`훅이 등장하였다. `use` API는 훅과 유사하게 랜더링에서만 호출할 수 있지만 조건부로 호출할 수 있다.
6. 정적 사이트 생성을 위한 `prerender`, `prerenderToNodeStream`가 추가되었다. Node.js Streams 및 Web Streams와 같은 스트리밍 환경에서서 React 트리를 정적 HTML로 사전 랜더링할 수 있게 되었다.
7. 서버컴포넌트와 서버액션도 등장하였다. 서버 컴포넌트는 클라이언트 애플리케이션과 별도의 환경에서 렌더링될 수 있으며, 빌드 타임 또는 요청 시 실행된다. 클라이언트 컴포넌트가 서버에서 비동기 함수를 실행하도록 돕는 서버 액션이 추가되었고, "use server"를 통해 지시할 수 있다.
8. `ref`를 prop으로 전달할 수 있게 되었고 이에 따라 `forwardRef`는 제거 될 예정이다.
9. 기타 문서 메타데이터, 스타일시트, 비동기 스크립트등의 지원이 확대되었다.

React 생태계에서 SSR 및 정적 사이트 생성을 위해서는 React가 아닌 다른 프레임워크/라이브러리 선택이 반 필수적이었다. 이번 업데이트로 SSR 및 정적 사이트 생성이 강화되었고, 클라이언트-서버 간 로직 분리가 더욱 명확해졌다. [tanstack-query](https://tanstack.com/query/latest)나 [swr](https://swr.vercel.app/ko)과 같은 데이터 패칭 라이브러리에서 제공해주던 로딩과 에러처리도 react에서 간결하게 작업할 수 있게 되었다.
