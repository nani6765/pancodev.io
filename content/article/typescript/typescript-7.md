---
title: TypeScript 7.0
description: TypeScript 7.0 Go rewrite analysis - why Go, end of self-hosting, 10x performance, and the journey
keywords: ["TypeScript", "Go", "compiler", "self-hosting", "performance"]
category: typescript
created_at: 2026-04-05 10:00
---

TypeScript 7.0이 Go로 재작성된다는 [뉴스](https://devblogs.microsoft.com/typescript/typescript-native-port/)를 봤다. JavaScript로 만들어진 컴파일러가 Go로 바뀐다니 — 꽤 신선하게 다가왔다. TypeScript의 창시자 Anders Hejlsberg는 C#의 아버지이기도 한데, 정작 C#이 아닌 Go를 선택했다는 점도 흥미롭다. 이번 글에서는 TypeScript 7.0의 변화를 몇 가지 관점에서 살펴보고자 한다.

#### 왜 Go인가

TypeScript 컴파일러는 지금까지 JavaScript(정확히는 TypeScript 자신)로 작성되어 왔다. Node.js 위에서 돌아가는 싱글스레드 기반이었고, 이게 대규모 코드베이스에서는 병목이 됐다. [Microsoft의 공식 발표](https://devblogs.microsoft.com/typescript/typescript-native-port/)에 따르면, 대형 프로젝트에서 개발자들은 "합리적인 에디터 시작 시간"과 "코드 전체를 보는 것" 사이에서 선택해야 했다고 한다.

그래서 네이티브 언어로 포팅하기로 했는데, 여기서 질문이 생긴다. 왜 Go인가?

먼저 Rust가 아닌 이유. TypeScript의 [AST(추상 구문 트리)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)는 순환 참조를 광범위하게 사용한다. Rust의 ownership 모델에서 이걸 다루려면 데이터 구조를 처음부터 다시 설계해야 한다. "포팅"이 아니라 "재작성"이 되는 거다. TypeScript 팀은 재작성이 아닌 포팅을 원했다 — 기존 코드베이스의 구조와 로직을 최대한 유지하면서 언어만 바꾸는 것.

그 다음, C#이 아닌 이유. Anders Hejlsberg가 C#을 만든 사람인데도 Go를 선택한 건 좀 의외다. [GitHub Discussion](https://github.com/microsoft/typescript-go/discussions/411)에서 팀이 밝힌 이유는 이렇다: "Idiomatic Go strongly resembles the existing coding patterns of the TypeScript codebase." Go의 관용적 코드 패턴이 기존 TypeScript 코드베이스와 구조적으로 비슷하다는 거다.

구체적으로 보면:

- Go도 가비지 컬렉션 기반이다. TypeScript 컴파일러가 이미 GC에 의존하고 있으니 메모리 관리 모델이 익숙하다.
- Go는 고루틴과 채널로 병렬 처리를 쉽게 할 수 있다. 멀티스레딩이 목표 중 하나였으니 딱 맞는다.
- Go의 문법이 단순해서 1:1 포팅이 빠르다. Rust처럼 복잡한 타입 시스템을 새로 배울 필요가 없다.

결국 "가장 빠르게 포팅할 수 있으면서 목표한 성능을 낼 수 있는 언어"가 Go였던 셈이다.

#### 셀프호스팅의 종말?

[셀프호스팅](<https://en.wikipedia.org/wiki/Self-hosting_(compilers)>)이란 프로그래밍 언어의 컴파일러를 그 언어 자신으로 작성하는 것을 말한다. C 컴파일러는 C로, Rust 컴파일러는 Rust로, Go 컴파일러는 Go로 작성된다. 이건 단순한 기술적 선택이 아니라 일종의 통과의례 같은 거다 — "우리 언어가 컴파일러를 만들 만큼 충분히 표현력 있다"는 증명이니까.

TypeScript도 2012년 공개 이후 10년 넘게 셀프호스팅 언어였다. TypeScript 컴파일러(`tsc`)는 TypeScript로 작성되어 있었다. 그런데 7.0에서 이 전통을 버렸다. ~~버렸다기보다는 내팽개쳤다고 해야 하나.~~

이게 무슨 의미일까?

솔직히 좀 복잡한 감정이다. 셀프호스팅은 언어의 성숙도를 상징하는 측면이 있다. TypeScript가 그걸 포기했다는 건, 상징적 의미보다 실용적 성능을 택했다는 뜻이다. 10배 빠른 컴파일러를 위해 "우리 언어로 우리 컴파일러를 만든다"는 자부심을 내려놓은 거다.

한편으로는 이해가 된다. TypeScript는 결국 JavaScript로 트랜스파일되는 언어다. 네이티브 바이너리를 만들 수 있는 언어가 아니니까, 성능 한계가 명확하다. 셀프호스팅을 고집하면서 사용자들이 느린 빌드 시간에 고통받는 것보다는, 실용적 선택을 한 게 맞을 수도 있다.

그래도 뭔가 씁쓸하긴 하다. 언어가 자기 자신을 컴파일할 수 있다는 건 꽤 아름다운 개념인데.

#### 10배 빠르다는데, 그래서 뭐가 달라지나

숫자부터 보자. [TypeScript 7.0 공식 발표](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)에 나온 벤치마크다:

| 프로젝트   | TS 6.0 | TS 7.0 | 배수  |
| ---------- | ------ | ------ | ----- |
| VS Code    | 77.8s  | 7.5s   | 10.4x |
| Playwright | 11.1s  | 1.2s   | 9.3x  |
| TypeORM    | 17.5s  | 1.8s   | 9.7x  |

빌드 시간만 빨라지는 게 아니다. 에디터 경험도 달라진다. VS Code 코드베이스를 열었을 때, 첫 번째 에러가 표시되기까지 걸리는 시간이 17.5초에서 1.3초로 줄었다고 한다. 13배 빠른 거다.

실제 사례도 있다:

- [Slack](https://bsky.app/profile/slack.engineering/post/3lry3ml3qok2f): CI 타입체킹 시간이 7.5분에서 1.25분으로. 머지 큐 시간이 40% 감소.
- Canva: 에디터에서 첫 에러 표시까지 58초 → 4.8초.
- Microsoft News Services 팀: 월 400시간의 CI 빌드 대기 시간 절약.

메모리 사용량도 6%~26% 감소했다.

병렬 처리도 가능해졌다. `--checkers` 플래그로 타입체킹 워커 수를 조절할 수 있고, `--builders` 플래그로 프로젝트 레퍼런스 빌드를 병렬화할 수 있다. 기본값은 `--checkers 4`인데, 대형 코드베이스에서는 `--checkers 8`로 올리면 더 빨라진다고 한다.

그래서 개발자 입장에서 뭐가 달라지나?

- **빌드 시간**: CI/CD 파이프라인이 빨라진다. PR 올리고 기다리는 시간이 줄어든다.
- **에디터 반응성**: 자동완성, find-all-references, 에러 표시가 즉각적으로 뜬다.
- **대규모 코드베이스**: 예전에는 "에디터가 버벅여서 로컬에서 타입체킹 안 하고 CI에 맡긴다"는 얘기가 있었는데, 이제 로컬에서도 가능해진다.

물론 아직 7.0을 직접 써보진 않았다. 숫자는 인상적인데, 실제로 내 프로젝트에서 체감이 될지는 모르겠다. 내가 다루는 코드베이스가 VS Code급은 아니니까.

#### TypeScript의 여정

마지막으로 TypeScript의 역사를 간략히 짚어보자.

- **2012년 10월**: TypeScript 0.8 공개. Anders Hejlsberg가 이끄는 Microsoft 프로젝트로 시작. 내부 개발 2년 후 세상에 나왔다.
- **2014년**: TypeScript 1.0 릴리즈. 이때부터 본격적으로 채택이 늘기 시작.
- **2016년**: TypeScript 2.0. `strictNullChecks` 같은 중요한 기능 추가.
- **2020년**: TypeScript 4.0. 템플릿 리터럴 타입 등.
- **2022년 10월**: [TypeScript 10주년](https://devblogs.microsoft.com/typescript/ten-years-of-typescript/).
- **2025년 3월**: Go 포팅 [발표](https://devblogs.microsoft.com/typescript/typescript-native-port/). 프로젝트 코드네임 "Corsa". 기존 코드베이스는 "Strada"라고 불린다.
- **2025년 8월**: TypeScript가 GitHub에서 가장 많이 사용되는 언어로 등극. Python을 제치고 월간 263만 컨트리뷰터.
- **2026년 3월**: TypeScript 6.0. JavaScript 기반 마지막 메이저 버전.
- **2026년 7월**: TypeScript 7.0 GA.

10년이 넘는 시간 동안 TypeScript는 "JavaScript의 타입 버전" 정도로 시작해서, 이제는 프론트엔드 개발의 사실상 표준이 됐다. 그리고 7.0에서 가장 큰 아키텍처 변화를 맞이했다.

---

아직 7.0을 직접 써보진 않았다. 하지만 이 전환이 의미하는 바는 꽤 크다고 생각한다. 성능을 위해 셀프호스팅이라는 전통을 포기하고, 10년 넘게 쌓아온 코드베이스를 다른 언어로 포팅하는 건 쉬운 결정이 아니었을 거다.

"10배 빠르다"는 숫자가 실제로 내 일상에 얼마나 영향을 줄지는 써봐야 알겠지만, 적어도 방향성은 명확해 보인다. TypeScript 팀은 대규모 코드베이스에서의 개발자 경험을 진지하게 고민하고 있고, 그 결과물이 7.0이다.

나중에 실제로 써보고 체감기를 남겨봐야겠다.
