---
title: "React Compiler 이후, 리렌더링 최적화는 누구의 일인가"
description: "Two years ago I wrote that useMemo is usually not worth it, based on a benchmark of initial render and re-render cost. With React Compiler 1.0 memoizing components automatically, I re-ran the same benchmark with React 19.3 and the compiler. Manual useMemo still loses on small components, but compiled code re-renders faster at every size tested because it also caches the returned JSX and lets React bail out of the child. The initial render penalty remains, and it comes from the memory the cache retains, not from comparing dependencies."
keywords: ["React Compiler", "useMemo", "memoization", "re-rendering", "benchmark", "React 19"]
category: react
created_at: 2026-11-24 17:00
---

# React Compiler 이후, 리렌더링 최적화는 누구의 일인가

2024년 7월, 이 블로그에 처음 올린 글의 제목은 [「여러분들은 리랜더링 최적화는 얼마나 중요하게 여기시나요?」](https://www.pancodev.io/article/react/importance-of-re-rendering-optimization)였습니다. 다른 사람의 벤치마크를 인용해 "대부분의 경우 `useMemo`를 쓰지 않는 편이 낫고, 리렌더링보다 첫 렌더링이 더 중요하다"고 썼죠. 그 뒤로 리렌더링 가이드를 [번역](https://www.pancodev.io/article/react/react-re-renders-guide-everything-all-at-once)했고, Render와 Commit 중 어느 쪽이 비싼지 [살펴보다가](https://www.pancodev.io/article/react/reflections-on-react-re-rendering) 결론을 내지 못하고 마무리했습니다.

그 사이 React Compiler가 2025년 10월에 1.0으로 정식 출시됐습니다. 컴파일러가 빌드할 때 메모이제이션 코드를 넣으므로, React 공식 문서도 새 코드에서는 메모이제이션을 컴파일러에 맡기라고 권합니다. 그렇다면 2년 전에 제가 쓴 "`useMemo`를 함부로 쓰지 말자"는 말은 이제 어떻게 되는 걸까요? 컴파일러가 모든 컴포넌트에 메모이제이션을 넣는다면, 제가 경계했던 비용을 모든 컴포넌트가 치르게 되는 건 아닐까요?

그래서 같은 벤치마크로 다시 측정했습니다. 이 글에서는 컴파일러가 실제로 어떤 코드를 만드는지 보고, 2년 전 벤치마크를 React 19.3과 React Compiler로 다시 잰 결과를 공유합니다.

결론부터 적으면, 수동 `useMemo`는 작은 컴포넌트에서 여전히 손해였지만 컴파일러는 측정한 모든 크기에서 리렌더링 시간을 줄였습니다. 첫 렌더링은 컴파일러도 느려졌고, 그 원인은 제가 짐작한 의존성 비교보다 캐시가 보관하는 메모리 쪽으로 보입니다.

## 컴파일러가 만드는 코드

측정 전에 컴파일러가 만드는 코드부터 보겠습니다. 아래는 2년 전 벤치마크와 같은 모양의 컴포넌트입니다. `level`만큼 객체를 만들어 배열에 넣고, 배열 길이를 화면에 씁니다.

```jsx
function Benchmark({ level }) {
  const complexObject = { values: [] };
  for (let i = 0; i <= level; i++) {
    complexObject.values.push({ mytest: "mytest" });
  }
  return (
    <div>
      Benchmark level: {level} ({complexObject.values.length})
    </div>
  );
}
```

`babel-plugin-react-compiler` 1.0.0으로 빌드하면 이렇게 바뀝니다. 실제 빌드 결과에서 import 경로와 JSX 런타임 호출만 읽기 쉽게 정리했습니다.

```jsx
function Benchmark(t0) {
  const $ = _c(5);
  const { level } = t0;

  let complexObject;
  if ($[0] !== level) {
    complexObject = { values: [] };
    for (let i = 0; i <= level; i++) complexObject.values.push({ mytest: "mytest" });
    $[0] = level;
    $[1] = complexObject;
  } else {
    complexObject = $[1];
  }

  let t1;
  if ($[2] !== complexObject.values.length || $[3] !== level) {
    t1 = <div>Benchmark level: {level} ({complexObject.values.length})</div>;
    $[2] = complexObject.values.length;
    $[3] = level;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  return t1;
}
```

`_c(5)`는 컴포넌트마다 칸이 5개인 캐시 배열을 하나 만듭니다. `$[0]`과 `$[1]`에는 `level`과 계산 결과(`complexObject`)를, `$[2]`와 `$[3]`에는 JSX를 만들 때 쓴 입력값을, `$[4]`에는 JSX를 저장합니다. 나머지는 손으로 작성하던 `useMemo`와 같은 일을 합니다. 입력값(`level`)이 이전과 같으면 저장해 둔 결과를 꺼내고, 다르면 다시 계산해서 저장합니다.

다만 계산 결과(`complexObject`)뿐 아니라 반환하는 JSX(`t1`)까지 캐시합니다. 저는 `useMemo`로 JSX를 감싸 본 적이 거의 없습니다. 또 값마다 Hook을 하나씩 호출하지 않고 배열 하나를 칸으로 나눠 쓰며, 의존성 배열과 콜백 함수도 만들지 않습니다. 이 차이가 측정 결과에 어떻게 나타나는지는 아래에서 확인합니다.

## 2년 전 벤치마크 재측정

2년 전 글이 인용한 벤치마크는 [「Should You Really Use useMemo in React?」](https://medium.com/swlh/should-you-use-usememo-in-react-a-benchmarked-analysis-159faf6609b7)([한국어 번역](https://github.com/yeonjuan/dev-blog/blob/master/JavaScript/should-you-really-use-usememo.md))입니다. 같은 컴포넌트를 10,000개 렌더링하고, 복잡도(코드의 `level`, 이하 n)를 1, 100, 1000, 5000으로 바꿔 가며 첫 렌더링과 리렌더링 시간을 쟀습니다. 부모의 `count` 상태를 올리면 리렌더링이 일어납니다.

이번에도 이 구성은 그대로 따랐습니다. 다만 원본을 다시 읽어 보니 그대로 재현할 수 없는 부분이 있어서 몇 가지를 바꿨습니다.

| 항목 | 원본 | 이번 측정 |
| --- | --- | --- |
| 루프 본문 | `push({ 'mytest' })` (객체가 아니라 블록 문이라 `undefined`가 들어감) | `push({ mytest: "mytest" })` |
| 계산 결과 사용 | 화면에 쓰지 않음 | 배열 길이를 화면에 씀 (결과를 버리는 코드로 최적화되지 않도록) |
| 빌드 모드 | 명시되지 않음 (독자 지적 후 프로덕션으로 다시 쟀다고만 언급) | 프로덕션 빌드 |
| 측정 방법 | `<Profiler>`의 `onRender` (집계 방식 불명) | `flushSync`로 렌더링을 동기 실행하고 앞뒤 `performance.now()` 차이 |
| 반복 | 몇 번 실행했다고만 언급 | 10라운드, 매번 새 브라우저 컨텍스트, 중앙값 |

같은 컴포넌트를 세 방식으로 작성했습니다.

- 없음: 메모이제이션 없이 매번 계산합니다.
- `useMemo`: 계산만 `useMemo`로 감쌉니다. 2년 전 벤치마크의 그 코드입니다.
- 컴파일러: "없음"과 같은 소스에 `"use memo"`를 붙여 컴파일러가 처리하게 합니다. 컴파일러는 `compilationMode: "annotation"`으로 켜서 이 컴포넌트만 컴파일했습니다. 세 방식의 차이를 벤치마크 컴포넌트 하나로 좁히려는 선택이고, 부모까지 포함해 앱 전체를 컴파일한 경우는 측정하지 않았습니다.

환경은 Apple M4, headless Chrome, React 19.3.1, babel-plugin-react-compiler 1.0.0입니다. 첫 렌더링은 10,000개를 처음 그리는 시간이고, 리렌더링은 2~5회차의 중앙값입니다. 측정 시간에는 Render 단계와 Commit 단계가 모두 들어 있습니다.

1회차 리렌더링은 모든 방식에서 2~5회차보다 느렸습니다. n=1 "없음"을 예로 들면 1회차가 13.2ms, 2~5회차가 4.5ms입니다. 원인은 확인하지 않았고, 1회차까지 넣어 다섯 번 전체의 중앙값으로 계산해도 방식 간 순서는 같았습니다.

측정 코드와 원시 결과는 [GitHub](https://github.com/nani6765/pancodev.io/tree/main/experiments/react-compiler-benchmark)에 올려 두었습니다. 같은 측정은 이렇게 해 볼 수 있습니다.

1. `experiments/react-compiler-benchmark`에서 `npm ci`로 의존성을 설치합니다.
2. `npm run build`로 프로덕션 빌드를 만듭니다.
3. `npm run bench`를 실행합니다. Chrome이 `/Applications/Google Chrome.app`에 있어야 하고, 다른 경로면 `bench.mjs`의 `executablePath`를 바꿉니다.
4. 터미널에 요약 표가 나오고 `results.json`에 원시 값이 저장됩니다. 절대 시간은 기기마다 다르지만, n=5000에서 `useMemo`와 컴파일러의 리렌더링이 "없음"보다 20배 이상 짧고 첫 렌더링은 2배 이상 길면 같은 경향입니다.

| n | 방식 | 첫 렌더링 | 리렌더링 |
| --- | --- | --- | --- |
| 1 | 없음 | 17.8ms | 4.5ms |
| 1 | `useMemo` | 18.7ms (+5%) | 4.9ms (+9%) |
| 1 | 컴파일러 | 18.9ms (+6%) | 2.6ms (−43%) |
| 100 | 없음 | 21.4ms | 8.0ms |
| 100 | `useMemo` | 25.9ms (+21%) | 5.8ms (−28%) |
| 100 | 컴파일러 | 26.3ms (+23%) | 3.3ms (−59%) |
| 1000 | 없음 | 44.7ms | 27.5ms |
| 1000 | `useMemo` | 115.1ms (+158%) | 6.2ms (−78%) |
| 1000 | 컴파일러 | 96.7ms (+117%) | 3.3ms (−88%) |
| 5000 | 없음 | 146.6ms | 130.1ms |
| 5000 | `useMemo` | 668.2ms (+356%) | 5.9ms (−95%) |
| 5000 | 컴파일러 | 445.5ms (+204%) | 3.7ms (−97%) |

괄호 안은 반올림 전 중앙값으로 계산한 "없음" 대비 증감입니다. 라운드 간 편차는 대체로 작았습니다. 예를 들어 n=5000 컴파일러의 첫 렌더링은 10번 중 가운데 절반이 437~453ms 안에 들어왔습니다. 10번째 라운드에서만 867.6ms가 나왔고, 중앙값에는 영향이 없었습니다.

리렌더링과 첫 렌더링을 나눠서 보겠습니다.

## 작은 컴포넌트에서도 리렌더링이 빨라진 이유

`useMemo` 행만 보면 2년 전 결론이 그대로 맞습니다. n=1에서 `useMemo`는 리렌더링이 9% 느립니다. 계산이 가벼우면 의존성을 비교하는 비용이 계산 비용보다 크다는 이야기였죠.

그런데 컴파일러 행은 다릅니다. n=1에서도 리렌더링이 43% 빠릅니다. 처음에는 캐시 배열이 `useMemo`보다 가벼워서라고 생각했습니다. 하지만 n=1이면 줄일 계산이 거의 없어서, 그것만으로는 4.5ms가 2.6ms로 줄어든 것을 설명할 수 없었습니다.

그래서 앞에서 본 JSX 캐시를 의심했습니다. 확인하려고 `useMemo`로 계산과 JSX를 둘 다 감싼 버전을 만들어 같은 조건에서 다시 쟀습니다.

```jsx
function BenchmarkMemoJsx({ level }) {
  const complexObject = useMemo(() => {
    /* 위와 같은 루프 */
  }, [level]);
  return useMemo(
    () => <div>Benchmark level: {level} ({complexObject.values.length})</div>,
    [level, complexObject],
  );
}
```

| n | 계산만 `useMemo` | 계산 + JSX `useMemo` | 컴파일러 |
| --- | --- | --- | --- |
| 1 | 4.8ms | 2.9ms | 2.6ms |
| 100 | 5.5ms | 3.4ms | 3.2ms |

(리렌더링 2~5회차 중앙값. 세 열 모두 이 비교를 위해 별도로 실행한 값이라 위 표와 조금 다릅니다.)

JSX까지 손으로 캐시하니 컴파일러와 거의 같아졌습니다. 리렌더링이 빨라진 이유는 캐시 방식이 아니라 **무엇을 캐시하느냐**였습니다.

그럼 JSX를 캐시하면 왜 빨라질까요? 컴포넌트가 이전과 같은 JSX 객체를 반환하면, 그 안의 `<div>` fiber가 받는 props 객체도 이전과 같은 객체입니다. React는 [`beginWork`](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js)에서 이 경우를 가장 먼저 확인합니다.

```js
// packages/react-reconciler/src/ReactFiberBeginWork.js (일부 생략)
if (current !== null) {
  const oldProps = current.memoizedProps;
  const newProps = workInProgress.pendingProps;

  if (oldProps !== newProps || hasLegacyContextChanged()) {
    didReceiveUpdate = true;
  } else {
    const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(current, renderLanes);
    if (!hasScheduledUpdateOrContext && (workInProgress.flags & DidCapture) === NoFlags) {
      // No pending updates or context. Bail out now.
      didReceiveUpdate = false;
      return attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
    }
    /* ... */
  }
}
```

props가 같은 객체이고 예약된 업데이트도 없으면, React는 그 fiber의 Render 단계를 건너뜁니다(bailout). 매번 새 JSX를 만드는 "없음"과 "계산만 `useMemo`"는 이 조건을 통과하지 못해서 `<div>`와 그 자식을 매번 다시 비교합니다.

[세 번째 글](https://www.pancodev.io/article/react/reflections-on-react-re-rendering)에서 저는 "Commit을 동반하지 않는 Render는 무시해도 되는가?"를 고민했습니다. 컴파일러를 쓰면 이 질문의 전제가 달라집니다. Render가 비싼지 따지기 전에, 같은 JSX를 반환해서 Render 단계를 건너뛰게 합니다. Commit 단계는 원래 바뀐 내용이 없으면 DOM을 수정하지 않으므로, 컴파일러가 줄이는 것은 Render 단계의 작업입니다.

## 첫 렌더링이 느려지는 원인

첫 렌더링에서는 컴파일러도 느립니다. n=1000에서 117%, n=5000에서 204% 느립니다. 2년 전 원본 벤치마크도 n=1000에서 183%, n=5000에서 545% 느리다고 했으니, 방향은 같습니다.

저는 처음에 이 차이가 의존성 비교나 캐시 배열을 만드는 비용이라고 생각했습니다. 그런데 n=1에서는 차이가 4~6%밖에 안 되고, n이 커질수록 차이가 급격히 커집니다. 비교 비용이라면 n과 상관없이 일정해야 하죠. 그래서 렌더링이 끝난 뒤 GC를 한 번 실행하고, 남아 있는 JS 힙 크기를 쟀습니다.

| n | 없음 | `useMemo` | 컴파일러 |
| --- | --- | --- | --- |
| 1 | 19.6MB | 22.2MB | 18.0MB |
| 100 | 19.6MB | 42.0MB | 37.8MB |
| 1000 | 19.6MB | 223.1MB | 218.9MB |
| 5000 | 19.6MB | 1,038.6MB | 1,034.4MB |

"없음"은 n이 커져도 19.6MB 그대로입니다. 매번 만든 배열은 길이를 화면에 쓴 뒤 참조가 사라지므로 GC가 회수합니다. 반면 `useMemo`와 컴파일러는 다음 렌더링에서 다시 쓰려고 배열을 캐시에 보관합니다. 컴포넌트 10,000개가 각각 객체 5,001개짜리 배열을 보관하므로 약 1GB가 됩니다.

V8의 GC는 금방 참조가 사라지는 객체를 적은 비용으로 회수하지만, 오래 남는 객체는 다른 메모리 영역으로 옮겨서 관리합니다. 첫 렌더링이 늘어난 폭이 보관한 메모리 크기를 따라 커지므로, 원인은 의존성 비교보다 보관 비용으로 추정합니다. 컴파일러도 같은 데이터를 보관하므로, 이 비용은 컴파일러를 켜도 사라지지 않습니다.

설명하지 못한 결과도 있습니다. n=5000에서 컴파일러의 첫 렌더링(445.5ms)이 `useMemo`(668.2ms)보다 빠릅니다. 보관하는 메모리는 거의 같습니다. JSX 비교용 별도 실행에서도 JSX까지 `useMemo`로 감싼 버전은 646.8ms로 `useMemo`(654.7ms)에 가까웠고, 컴파일러는 426.5ms였습니다. `useMemo`는 렌더링할 때마다 콜백 함수와 의존성 배열을 새로 만들고, 컴파일러 코드는 그러지 않으니 그 차이가 아닐까 추측하지만, 이번 측정으로는 확인하지 못했습니다.

## 2년 전 결론과 비교

| 2년 전 생각 | 이번에 확인한 것 |
| --- | --- |
| 가벼운 값에 `useMemo`를 쓰면 오히려 손해다 | 수동 `useMemo`는 여전히 그렇다(n=1에서 리렌더링 +9%). 컴파일러는 JSX까지 캐시해서 가벼운 컴포넌트도 리렌더링이 빨라진다(−43%). |
| 메모이제이션은 첫 렌더링을 느리게 한다 | 여전히 그렇다. 컴파일러도 마찬가지다. 원인은 비교보다 캐시가 보관하는 메모리로 추정한다. |
| 리렌더링보다 첫 렌더링이 중요하다 | 여전히 그렇다고 생각한다. 다만 이제 "메모이제이션을 쓸지 말지"가 아니라 "무엇이 캐시에 남는지"를 보는 문제가 됐다. |
| Render와 Commit 중 어느 쪽이 비싼가 | 아직 모른다. 다만 컴파일러는 같은 JSX를 반환해서 Render 단계를 건너뛰는 방식을 쓴다. |

## 리렌더링 최적화에서 개발자의 일

이제 어디에 메모이제이션을 넣을지는 컴파일러가 판단합니다. 손으로 작성할 때보다 촘촘하게, JSX까지 캐시합니다. 2년 전처럼 `useMemo`마다 "이 정도 계산이면 감쌀 만한가?"를 따질 일은 많이 줄었습니다.

하지만 캐시가 보관하는 메모리 비용은 그대로입니다. 컴파일러는 캐시할 수 있는 값을 캐시하므로, 컴포넌트가 큰 데이터를 만들면 그 데이터는 컴포넌트가 언마운트될 때까지 메모리에 남습니다. 목록 아이템 수천 개가 각자 무거운 파생 데이터를 만드는 구조라면, 컴파일러 설정이 아니라 구조를 바꾸는 편이 낫습니다. 파생 데이터를 상위에서 한 번만 만들거나, 아이템이 필요한 값만 받게 하는 식으로요.

그래서 리렌더링 최적화에서 개발자의 일은 Hook을 어디에 넣을지 고르는 일에서, 무엇이 캐시에 남는지 보고 상태와 데이터를 어디에 둘지 정하는 일로 옮겨 갔다고 생각합니다. 그 판단의 근거는 여전히 측정입니다. 이번에도 힙 크기를 재기 전에는 원인을 의존성 비교로 잘못 짚고 있었습니다.

컴파일러를 켠 뒤 기존 `useMemo`를 일부러 지울 필요는 없습니다. 컴파일러는 손으로 넣은 메모이제이션을 그대로 둡니다. 대신 목록 아이템마다 큰 배열이나 객체를 만드는 컴포넌트가 있다면, 컴파일러를 켜기 전과 후의 렌더링 시간과 힙 크기를 재서 이 글의 표처럼 비교해 보세요.

2년 전 글 끝에 "그 최적화가 본인이 판단해도 되는 것인지 다시 생각해 보자"고 썼습니다. 이제 판단의 일부는 컴파일러가 맡습니다. 그래도 무엇을 캐시에 남길지와 그것이 실제로 느린지는 여전히 개발자가 측정해서 확인해야 한다고 생각합니다.

## 이 실험의 한계

이 결과는 n=1~5000, 부모를 컴파일하지 않은 구성, 계산 결과를 화면에 쓰는 컴포넌트 한 종류에서만 확인했습니다.

- 같은 컴포넌트 10,000개, 아이템당 객체 5,001개는 실제 화면에서 보기 드문 규모입니다. 이보다 작은 화면에서 차이가 얼마나 되는지는 재지 않았습니다.
- Apple M4 한 대의 headless Chrome에서 잰 값입니다. 절대 시간보다는 방식 간 비율을 봐 주세요.
- 앱 전체를 컴파일한 경우는 측정하지 않았으므로, 그 구성에서는 결과가 달라질 수 있습니다.
- 2년 전에 번역한 [리렌더링 가이드](https://www.pancodev.io/article/react/react-re-renders-guide-everything-all-at-once)의 패턴(상태 내려 보내기, Context 쪼개기 등)이 컴파일러와 함께 어떻게 달라지는지는 다루지 못했습니다.

## 참고 자료

- [React Compiler 소개 - react.dev](https://react.dev/learn/react-compiler/introduction)
- [React Compiler 설치 - react.dev](https://react.dev/learn/react-compiler/installation)
- [compilationMode - react.dev](https://react.dev/reference/react-compiler/compilationMode)
- [preserve-manual-memoization - react.dev](https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization)
- [ReactFiberBeginWork.js - facebook/react](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js)
- [Should You Really Use useMemo in React? A Benchmarked Analysis](https://medium.com/swlh/should-you-use-usememo-in-react-a-benchmarked-analysis-159faf6609b7) / [한국어 번역](https://github.com/yeonjuan/dev-blog/blob/master/JavaScript/should-you-really-use-usememo.md)
- [측정 코드와 원시 결과 - nani6765/pancodev.io](https://github.com/nani6765/pancodev.io/tree/main/experiments/react-compiler-benchmark)
