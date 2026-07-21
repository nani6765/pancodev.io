---
title: node_modules는 왜 이 모양인가
description: A deep dive into why node_modules is shaped the way it is, starting from Node's module resolution algorithm and walking through npm's nested trees, the hoisting that flattened them, and the phantom dependencies and doppelgangers that hoisting left behind. It then reads pnpm, Yarn PnP, and Bun as different answers to the same question, with a closer look at how devDependencies tangle into the graph. Written in June 2025 after switching companies from yarn to pnpm.
keywords:
  [
    "node_modules",
    "pnpm",
    "yarn",
    "bun",
    "package manager",
    "devDependencies",
    "hoisting",
  ]
category: develop
created_at: 2025-06-18 23:40
---

# node_modules는 왜 이 모양인가

2025년 3월에 회사를 옮겼다. 개발자가 이직하면 챙길 게 많지만, 손끝이 가장 먼저 배신하는 건 의외로 사소한 데 있었다. 이전 회사에선 `yarn install`이었는데, 지금 회사는 `pnpm install`이다. 처음 며칠은 습관대로 `yarn`을 치고 "command not found"를 보고서야 아 여기 pnpm이었지, 하는 걸 반복했다. ~~손가락은 아직 퇴사를 안 했나 보다.~~

그런데 명령어만 바뀐 게 아니었다. `node_modules` 안을 열어봤더니 풍경이 달랐다. 익숙하던 평평한 폴더 더미 대신 `.pnpm`이라는 처음 보는 디렉토리가 있고, 패키지 폴더들이 죄다 심볼릭 링크로 어딘가를 가리키고 있었다. 같은 자바스크립트 프로젝트인데 왜 이렇게 다르게 생겼지?

생각해보면 나는 지금까지 노드 패키지 매니저를 **내가 고른 적이 없다.** 첫 회사가 yarn을 쓰니 yarn을 썼고, 지금 회사가 pnpm을 쓰니 pnpm을 쓴다. 매일 `install`을 수백 번 치면서도 그게 `node_modules` 안에서 정확히 무슨 일을 벌이는지는 들여다본 적이 없었다. 여러분들은 혹시, 매일 치는 그 `install`이 안에서 뭘 하는지 설명할 수 있는가?

이참에 제대로 파보기로 했다. yarn과 pnpm이, 나아가 bun까지가 서로 다르게 생긴 이유를 이해하려면 결국 하나의 질문으로 돌아가야 했다. **애초에 `node_modules`는 왜 이 모양인가.** 이 글은 그 질문을 따라간 기록이다.

#### node_modules 이전에 — Node는 모듈을 어떻게 찾는가

모든 건 `require`(그리고 `import`)가 모듈을 찾는 방식에서 시작한다. 우리가 `require('lodash')`라고 쓰면 Node는 어떻게 그 `lodash`를 찾아낼까.

[Node의 모듈 해석 알고리즘](https://nodejs.org/api/modules.html#loading-from-node_modules-folders)은 생각보다 단순하고, 동시에 이 글 전체의 뿌리다. 경로가 아닌 이름(`lodash`처럼)으로 모듈을 요청하면, Node는 **현재 파일이 위치한 디렉토리의 `node_modules`를 먼저 보고, 없으면 부모 디렉토리의 `node_modules`, 또 없으면 그 부모의 `node_modules`를 파일시스템 루트까지 거슬러 올라가며 찾는다.** 공식문서의 의사코드로 보면 이렇다.

```
// NODE_MODULES_PATHS(START) 의 핵심
1. let PARTS = path split(START)
2. let DIRS = []
3. START의 경로를 뒤에서부터 훑으며
   각 단계마다 "<경로>/node_modules" 를 후보에 쌓는다
4. 그 후보들을 위에서 아래로(=가까운 곳부터) 뒤진다
```

이 "위로 타고 올라가며 찾는다"는 규칙 하나가 `node_modules`의 모든 것을 결정한다. 내 코드 바로 옆 `node_modules`에 있으면 쓸 수 있고, 없으면 상위로 올라가다 처음 만나는 걸 쓴다. 뒤집어 말하면, **패키지를 어느 깊이의 `node_modules`에 심느냐가 곧 "누가 그 패키지를 볼 수 있는가"를 정한다는 뜻이다.** 패키지 매니저들이 벌이는 모든 씨름은 결국 이 배치 문제로 환원된다.

#### 중첩의 시대 — npm v2와 그 붕괴

초기 npm(v2까지)의 대답은 정직했다. package.json에 적힌 의존성 트리를 **그대로 파일시스템에 새겼다.** 내 앱이 `a`와 `b`를 쓰고, `a`는 `c@1.0.0`을, `b`는 `c@2.0.0`을 쓴다면 이렇게 생겼다.

```
node_modules
├── a
│   └── node_modules
│       └── c   (1.0.0)
└── b
    └── node_modules
        └── c   (2.0.0)
```

우아한 점이 있다. `a`가 `require('c')`를 하면 바로 옆 `node_modules/c`(1.0.0)를 찾고, `b`는 자기 옆의 `c`(2.0.0)를 찾는다. 위에서 본 해석 규칙 덕에 **버전 충돌이 구조적으로 존재하지 않는다.** 각자 자기 것을 본다.

문제는 이 우아함이 규모를 못 견딘다는 거였다. 의존성의 의존성의 의존성이 겹겹이 쌓이면 트리는 무섭게 깊어진다. 같은 버전의 `c`가 트리 곳곳에서 수십 번 중복 설치돼 디스크를 잡아먹었고, 무엇보다 경로가 미친 듯이 길어졌다. `node_modules/a/node_modules/b/node_modules/c/...`가 끝없이 이어지면서, [Windows의 260자 경로 길이 제한](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation)에 걸려 설치 자체가 깨지는 일이 벌어졌다. ~~자바스크립트 생태계가 윈도우 탐색기한테 진 순간이다.~~

#### hoisting — 문제를 풀며 낳은 새 문제

npm v3는 이 지옥을 **평탄화(hoisting)**로 풀었다. 중첩해서 깊게 쌓는 대신, 가능한 한 많은 패키지를 최상위 `node_modules` 하나로 끌어올리는 것이다. 앞의 예시는 이렇게 바뀐다.

```
node_modules
├── a
├── b
├── c   (1.0.0)   ← 최상위로 끌어올려짐(hoisted)
└── b/node_modules
    └── c (2.0.0) ← 충돌하는 버전만 어쩔 수 없이 중첩
```

`c@1.0.0`을 맨 위로 올려두면, 해석 규칙상 `a`도 위로 올라가다 이걸 찾고 내 앱도 이걸 찾는다. 한 벌만 있으면 되니 중복이 줄고 트리도 얕아진다. 충돌하는 `c@2.0.0`만 예외적으로 `b` 밑에 남는다. 훌륭한 해법처럼 보였고, 실제로 오래 잘 썼다.

그런데 평탄화는 공짜가 아니었다. 최상위로 끌어올린다는 건 **선언하지도 않은 패키지가 내 손에 닿는 곳에 놓인다는 뜻**이기도 하다. 여기서 두 가지 고질병이 나온다.

첫째는 [phantom dependency(유령 의존성)](https://rushjs.io/pages/advanced/phantom_deps/)다. 내 package.json에는 `lodash`를 적은 적이 없는데, 어떤 의존성이 `lodash`를 쓰는 바람에 그게 최상위로 hoisting됐다. 그럼 내 코드에서 `require('lodash')`가 **그냥 된다.** 문제는 이게 순전히 운이라는 거다. 그 중간 의존성이 다음 버전에서 lodash를 끊거나 다른 걸로 갈아타면, 선언한 적 없던 내 `lodash`는 예고 없이 사라진다. 선언과 실제 사용이 어긋나 있는데 지금 당장은 동작하니 아무도 모른다.

둘째는 [doppelganger(도플갱어)](https://rushjs.io/pages/advanced/npm_doppelgangers/)다. 충돌하는 버전은 중첩으로 남는다고 했는데, 그 결과 같은 패키지가 트리 여기저기에 여러 벌 설치될 수 있다. 싱글톤을 기대한 라이브러리(대표적으로 리액트)가 두 벌 로드되면 `Invalid hook call` 같은 걸로 터진다. 겪어본 사람은 안다. 이게 얼마나 사람을 미치게 하는지.

게다가 "최대한 끌어올린다"는 규칙은 **설치 순서와 트리 모양에 따라 결과가 달라진다.** 같은 package.json인데 누가 먼저 설치됐냐에 따라 최상위에 올라오는 버전이 달라질 수 있다는 것. 이 비결정성을 잡으려고 등장한 게 lockfile이다. `package-lock.json`, `yarn.lock`은 "이번에 실제로 이렇게 깔았다"는 스냅샷을 박제해서, 다음 사람도 똑같은 트리를 얻게 만든다. 애초에 배치 규칙이 결정적이었다면 필요 없었을 장치인 셈이다.

#### 가장 얽힌 매듭 — dependency의 종류와 devDependencies

여기까지가 "패키지를 어디에 두는가"의 이야기였다면, 이제 "무엇을 의존성으로 볼 것인가"라는 더 얽힌 매듭으로 들어가자. package.json은 의존성을 한 종류로 두지 않는다. [공식 스펙](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)상 최소 네 갈래다.

- `dependencies` — 런타임에 실제로 필요한 것.
- `devDependencies` — 개발/빌드할 때만 필요하고, 배포된 결과물엔 없어도 되는 것(테스트 러너, 번들러, 타입 정의 등).
- `peerDependencies` — "내가 직접 설치하진 않지만, 나를 쓰는 쪽이 이 버전을 갖고 있어야 한다"는 요구. 리액트 플러그인 계열이 대표적이다.
- `optionalDependencies` — 없어도 설치 실패로 치지 않는 것.

깔끔해 보이지만, **hoisting과 만나는 순간 이 경계가 흐려진다.** 위에서 봤듯 평탄화는 dependencies든 devDependencies든 가리지 않고 최상위 `node_modules`로 끌어올린다. 파일시스템에 올라온 뒤에는 이게 런타임용인지 개발용인지 표시가 남지 않는다. 그러니 devDependencies에 있는 패키지를 런타임 코드에서 `import`해도 로컬에선 멀쩡히 돌아간다. phantom dependency의 dev 버전인 셈이다.

이게 왜 위험한가. 배포 빌드에서 `npm install`에 [`--omit=dev`](https://docs.npmjs.com/cli/v10/commands/npm-install)(예전의 `--production`)를 주면 devDependencies는 트리에서 잘려나간다. 로컬에선 hoisting 덕에 잘 잡히던 그 import가, devDependencies가 제거된 프로덕션 환경에선 `Cannot find module`로 터진다. "내 컴퓨터에선 되는데요"의 절반은 여기서 나온다고 생각한다.

`peerDependencies`는 또 다른 얽힘을 만든다. 라이브러리 A가 `react@^17`을 peer로 요구하는데 내 앱은 `react@18`을 쓴다면, npm은 이 모순을 자동으로 못 풀고 [`ERESOLVE`](https://docs.npmjs.com/cli/v10/commands/npm-install) 에러를 뱉는다. `--legacy-peer-deps`나 `--force`로 억지로 넘기는 그 순간, 우리는 사실 "peer 제약을 무시하고 알아서 하겠다"에 서명하는 거다. 그래서 결국 다시 doppelganger나 싱글톤 깨짐으로 돌아온다.

정리하면 이렇다. **의존성의 "종류"는 개념적으로 명확한데, `node_modules`라는 평평한 물리적 배치가 그 개념을 담아내지 못한다.** 개념과 구현 사이의 이 틈이, 우리가 dependency에 데는 마찰의 상당 부분을 만들어낸다. 그리고 바로 이 지점이, 다음 세대 매니저들이 각자 다르게 손을 댄 곳이다.

#### 다시 묻기 — 각 매니저는 이 질문에 어떻게 답하는가

지금까지의 이야기는 "hoisting은 깊이를 얕게 만들었지만 경계를 흐렸다"로 요약된다. pnpm, Yarn PnP, Bun은 이 문제를 놓고 서로 다른 답을 내놓는다. 같은 질문, 다른 대답이다.

**pnpm — 격리로 되돌리되, 중복은 없앤다.** [pnpm](https://pnpm.io/motivation)은 hoisting을 포기한다. 대신 두 가지를 결합한다. 하나는 전역 **content-addressable store**다. 패키지의 실제 파일은 디스크의 단 한 곳(`~/.pnpm-store`)에 내용 기반으로 저장되고, 각 프로젝트의 `node_modules`에는 그 원본을 가리키는 하드링크만 놓인다. 그래서 같은 패키지를 프로젝트 수십 개가 써도 디스크엔 한 벌뿐이다. 다른 하나는 **심볼릭 링크로 만든 중첩 구조**다. [pnpm의 node_modules 레이아웃](https://pnpm.io/symlinked-node-modules-structure)을 열어보면 이렇게 생겼다.

```
node_modules
├── .pnpm
│   ├── foo@1.0.0
│   │   └── node_modules
│   │       ├── foo -> <store>/foo         (하드링크된 실제 파일)
│   │       └── bar -> ../../bar@2.0.0/...  (foo가 의존하는 것만 링크)
│   └── bar@2.0.0
│       └── node_modules
│           └── bar -> <store>/bar
└── foo -> .pnpm/foo@1.0.0/node_modules/foo
```

핵심은 최상위 `node_modules`에 **내가 직접 선언한 패키지만** 심볼릭 링크로 노출된다는 점이다. `foo`가 쓰는 `bar`는 `.pnpm` 안쪽에만 있고 최상위엔 안 보인다. 그러니 선언 안 한 `bar`를 내 코드에서 `require`하면 **못 찾는다.** hoisting이 우연히 허용하던 phantom dependency가 구조적으로 막히는 것이다. 회사를 옮기고 내가 본 그 `.pnpm` 디렉토리와 심볼릭 링크 더미는, 알고 보니 "선언한 것만 볼 수 있게 하겠다"는 설계의 얼굴이었다.

**Yarn Berry(PnP) — node_modules를 아예 없앤다.** [Yarn의 Plug'n'Play](https://yarnpkg.com/features/pnp)는 더 급진적이다. 문제의 근원이 `node_modules`를 파일시스템에 펼치는 것 자체라면, 그걸 안 만들면 되지 않나. Yarn PnP는 의존성을 zip 아카이브로 캐시에 두고, "어떤 패키지의 어떤 버전이 어디 있는지"를 `.pnp.cjs`라는 조회 파일 하나로 관리한다. Node의 모듈 해석을 이 파일이 가로채서, 파일시스템을 뒤지는 대신 상수 시간에 정확한 위치를 되돌려준다. `node_modules`를 훑는 I/O가 사라지니 설치도 실행도 빨라지고, 캐시를 저장소에 커밋하면 설치 단계 자체를 건너뛰는 [zero-install](https://yarnpkg.com/features/caching)도 가능해진다. 대가는 있다. `node_modules`가 실재한다고 가정하고 짠 도구들과 부딪힌다. 근본을 바꾸면 근본에 기대던 것들과 싸우게 되는 법이다.

**Bun — 판을 다시 짜되, 익숙함은 지킨다.** [Bun](https://bun.sh/docs/cli/install)의 초점은 속도다. 자체 구현한 installer로 npm 레지스트리에서 받아 설치하는데, 전역 캐시와 하드링크로 중복을 줄이는 건 pnpm과 결이 비슷하다. 다만 배치 자체는 익숙한 `node_modules`를 유지해 호환성 마찰을 줄이는 쪽을 택했다. 흥미로운 건 lockfile이다. Bun은 원래 성능을 위해 바이너리 `bun.lockb`를 썼는데, 이게 git diff에서 안 읽힌다는 원성이 컸다. 그래서 [2025년 1월 Bun 1.2](https://bun.com/blog/bun-lock-text-lockfile)부터 사람이 읽고 diff할 수 있는 텍스트 기반 `bun.lock`을 기본으로 되돌렸다. 성능과 사람의 편의 사이에서 결국 사람 쪽으로 한 발 온 셈이다.

[!note] 이 글의 버전 기준은 2025년 6월이다. Node는 24가 current, 22가 LTS이고, pnpm 10, Yarn 4(Berry), Bun은 1.2.15 즈음이다. 패키지 매니저는 워낙 빨리 움직이니 읽는 시점의 최신 문서를 함께 확인하길 권한다.

[!note] 2026년 7월에 다시 읽으며 덧붙인다 — 이 글을 쓴 뒤 1년 사이 생태계의 무게중심이 "패키지를 어디에 두는가"에서 "그 안에서 무엇이 실행되게 둘 것인가"로 옮겨간 느낌이다. [break] 잇단 공급망 공격 끝에 npm 12가 의존성의 설치 스크립트(`preinstall`/`install`/`postinstall`)를 기본 차단하는 쪽으로 방향을 틀었는데, 결국 `node_modules`를 채우는 과정 그 자체가 공격 표면이라는 인식이 자리잡은 것이다. 이건 배치의 문제와는 또 다른 결이라, 따로 한 편이 필요할 것 같다.

#### 고른 적 없는 도구를 이해한다는 것

파고들기 전으로 돌아가 보면, 나는 이 도구들을 "고른" 적이 없었다. 회사가 셋업해둔 걸 그냥 따랐을 뿐이고, `install` 한 줄이 `node_modules` 안에서 벌이는 일에 대해선 놀랍도록 무지했다. yarn과 pnpm이 다르게 생긴 걸 보고도, 그게 왜인지 궁금해하지 않았다.

그래서 이 글은 "그러니 pnpm을 써라" 같은 결론으로 가지 않는다. ~~그런 글은 이미 인터넷에 넘친다.~~ 넷을 다 파보고 내가 얻은 건 정답 목록이 아니라, 하나의 관점이었다. `node_modules`의 중첩도, npm의 hoisting도, pnpm의 심볼릭 링크도, Yarn PnP의 `.pnp.cjs`도, 결국 **"이름으로 요청된 모듈을 어디서 찾을 것인가"라는 같은 질문에 대한 서로 다른 대답**이라는 것. 각자 무언가를 얻으려고 무언가를 내려놓았다. 평탄화는 깊이를 얻고 경계를 잃었고, PnP는 속도를 얻고 호환성과 싸운다.

무엇이 최선인지는 아직 못 정하겠다. 프로젝트 규모, 모노레포 여부, 팀이 감당할 마찰의 총량에 따라 답이 갈릴 것이고, 그건 내가 여기서 단정할 수 있는 게 아니다. 다만 확실해진 것 하나는 있다. 나는 이제 `pnpm install`을 칠 때 그게 무슨 일을 하는지 안다. 관습적으로, 회사가 정해준 대로 써오던 도구를 이번 기회에 내 것으로 이해하게 됐다는 것. 도구를 고르는 안목은 결국 그 도구가 무슨 문제를 풀고 있는지를 아는 데서 나온다고 믿는다. 이 글이 여러분의 `node_modules`를 한 번 열어보게 만들었다면, 그걸로 충분하다.
