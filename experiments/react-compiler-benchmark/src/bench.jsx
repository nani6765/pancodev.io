import { useMemo } from "react";

// 원본 글의 루프는 `push({ 'mytest' })`로 적혀 있어 실제로는 undefined를 넣는다.
// 의도대로 객체를 넣고, 컴파일러가 결과를 버리지 못하도록 길이를 화면에 쓴다.
export function BenchmarkNormal({ level }) {
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

export function BenchmarkMemo({ level }) {
  const complexObject = useMemo(() => {
    const result = { values: [] };
    for (let i = 0; i <= level; i++) {
      result.values.push({ mytest: "mytest" });
    }
    return result;
  }, [level]);
  return (
    <div>
      Benchmark level: {level} ({complexObject.values.length})
    </div>
  );
}

// 컴파일러처럼 계산 결과와 JSX를 둘 다 손으로 캐시한 버전.
export function BenchmarkMemoJsx({ level }) {
  const complexObject = useMemo(() => {
    const result = { values: [] };
    for (let i = 0; i <= level; i++) {
      result.values.push({ mytest: "mytest" });
    }
    return result;
  }, [level]);
  return useMemo(
    () => (
      <div>
        Benchmark level: {level} ({complexObject.values.length})
      </div>
    ),
    [level, complexObject],
  );
}

export function BenchmarkCompiler({ level }) {
  "use memo";
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
