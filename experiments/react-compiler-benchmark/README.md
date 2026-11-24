# React Compiler 벤치마크

[「React Compiler 이후, 리렌더링 최적화는 누구의 일인가」](https://www.pancodev.io/article/react/react-compiler-and-re-rendering) 글의 측정 코드와 원시 결과다.

같은 컴포넌트 10,000개를 렌더링하고, 컴포넌트마다 `level + 1`개의 객체를 배열에 넣는다. 메모이제이션 방식별로 첫 렌더링 시간과 리렌더링 시간, 렌더링 후 남은 JS 힙 크기를 잰다.

## 비교하는 방식

| variant | 컴포넌트 | 설명 |
| --- | --- | --- |
| `normal` | `BenchmarkNormal` | 메모이제이션 없음 |
| `memo` | `BenchmarkMemo` | 계산만 `useMemo`로 캐시 |
| `memoJsx` | `BenchmarkMemoJsx` | 계산과 반환 JSX를 각각 `useMemo`로 캐시 |
| `compiler` | `BenchmarkCompiler` | `normal`과 같은 소스에 `"use memo"`를 붙여 React Compiler로 컴파일 |

컴파일러는 `compilationMode: "annotation"`으로 켜서 `BenchmarkCompiler`만 컴파일한다. 부모 `App`은 컴파일하지 않는다.

## 측정 방법

- 프로덕션 빌드를 headless Chrome에서 연다.
- 첫 렌더링은 `flushSync(() => root.render(<App />))` 앞뒤의 `performance.now()` 차이다.
- 리렌더링은 부모의 `count` 상태를 올리는 `flushSync`를 5번 실행해 각각 잰다. 1회차는 다른 회차보다 일관되게 느려서 2~5회차 중앙값을 따로 낸다.
- 측정이 끝난 뒤 `gc()`를 호출하고 `performance.memory.usedJSHeapSize`를 읽는다. Chrome을 `--js-flags=--expose-gc --enable-precise-memory-info`로 실행한다.
- `level`은 1, 100, 1000, 5000이다. 라운드마다 새 브라우저 컨텍스트에서 재고, 변형 순서를 돌려 가며 10라운드를 실행한다. 표의 값은 중앙값이다.

## 실행

Chrome이 `/Applications/Google Chrome.app`에 설치되어 있어야 한다. 다른 경로면 `bench.mjs`의 `executablePath`를 바꾼다.

```sh
npm ci
npm run build
npm run bench                                                  # normal, memo, compiler
VARIANTS=memo,memoJsx,compiler OUT=results-jsx.json npm run bench   # JSX 캐시 비교
```

`ROUNDS` 환경 변수로 라운드 수를 바꾼다(기본 10). 결과는 `results.json`(또는 `OUT`)에 원시 측정값과 요약을 함께 쓰고, 터미널에 요약 표를 출력한다.

## 글에 쓴 결과

- `results.json`: `normal`, `memo`, `compiler` 측정 (10라운드)
- `results-jsx.json`: `memo`, `memoJsx`, `compiler` 측정 (10라운드, 별도 실행)

측정 환경은 Apple M4, macOS, headless Chrome, React 19.3.1, babel-plugin-react-compiler 1.0.0이다. 절대 시간은 기기마다 다르므로 방식 간 비율을 비교한다.
