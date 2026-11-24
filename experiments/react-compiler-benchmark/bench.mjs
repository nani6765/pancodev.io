import { writeFileSync } from "node:fs";
import { preview } from "vite";
import puppeteer from "puppeteer-core";

const LEVELS = [1, 100, 1000, 5000];
const VARIANTS = (process.env.VARIANTS ?? "normal,memo,compiler").split(",");
const ROUNDS = Number(process.env.ROUNDS ?? 10);
const INSTANCES = 10000;
const RERENDERS = 5;

const server = await preview({ preview: { port: 4317, strictPort: true } });
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--js-flags=--expose-gc", "--enable-precise-memory-info"],
});

const samples = [];
// 측정 순서에 따른 편향(발열, 백그라운드 작업)을 줄이려고 라운드마다 변형 순서를 돌린다.
for (let round = 0; round < ROUNDS; round++) {
  for (const level of LEVELS) {
    const order = VARIANTS.map((_, i) => VARIANTS[(i + round) % VARIANTS.length]);
    for (const variant of order) {
      // 매 측정을 새 브라우저 컨텍스트에서 시작해 JIT·캐시 상태를 초기화한다.
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.goto(
        `http://localhost:4317/?variant=${variant}&level=${level}&instances=${INSTANCES}&rerenders=${RERENDERS}`,
      );
      await page.waitForFunction(() => window.__result, { timeout: 120000 });
      samples.push(await page.evaluate(() => window.__result));
      await context.close();
    }
  }
  console.error(`round ${round + 1}/${ROUNDS} done`);
}

await browser.close();
server.httpServer.close();

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const summary = [];
for (const level of LEVELS) {
  for (const variant of VARIANTS) {
    const runs = samples.filter((s) => s.level === level && s.variant === variant);
    summary.push({
      level,
      variant,
      initial: median(runs.map((r) => r.initial)),
      rerender1: median(runs.map((r) => r.rerenders[0])),
      rerenderRest: median(runs.flatMap((r) => r.rerenders.slice(1))),
      retainedHeapMB: median(runs.map((r) => r.retainedHeapMB)),
    });
  }
}

writeFileSync(process.env.OUT ?? "results.json", JSON.stringify({ rounds: ROUNDS, samples, summary }, null, 2));
console.table(
  summary.map((s) => ({
    level: s.level,
    variant: s.variant,
    "initial(ms)": s.initial.toFixed(1),
    "rerender#1(ms)": s.rerender1.toFixed(1),
    "rerender#2-5(ms)": s.rerenderRest.toFixed(1),
    "heap(MB)": s.retainedHeapMB?.toFixed(1),
  })),
);
