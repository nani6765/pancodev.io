import { useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { BenchmarkNormal, BenchmarkMemo, BenchmarkMemoJsx, BenchmarkCompiler } from "./bench.jsx";

const COMPONENTS = {
  normal: BenchmarkNormal,
  memo: BenchmarkMemo,
  memoJsx: BenchmarkMemoJsx,
  compiler: BenchmarkCompiler,
};

const params = new URLSearchParams(location.search);
const variant = params.get("variant") ?? "normal";
const level = Number(params.get("level") ?? 1);
const instances = Number(params.get("instances") ?? 10000);
const rerenders = Number(params.get("rerenders") ?? 5);

let bump;

function App() {
  const [count, setCount] = useState(0);
  bump = () => setCount((c) => c + 1);
  const Benchmark = COMPONENTS[variant];
  return Array.from({ length: instances }, (_, i) => (
    <Benchmark key={i} level={level} count={count} />
  ));
}

function measure(work) {
  const start = performance.now();
  flushSync(work);
  return performance.now() - start;
}

const root = createRoot(document.getElementById("root"));
const initial = measure(() => root.render(<App />));
const rerenderTimes = [];
for (let i = 0; i < rerenders; i++) {
  rerenderTimes.push(measure(() => bump()));
}

// 시간 측정이 끝난 뒤에 GC를 돌려, 캐시가 붙잡고 있는 메모리만 남긴 힙 크기를 잰다.
window.gc?.();
const retainedHeapMB = performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : null;

window.__result = { variant, level, instances, initial, rerenders: rerenderTimes, retainedHeapMB };
