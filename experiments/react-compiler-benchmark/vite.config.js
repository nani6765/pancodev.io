import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// annotation 모드: "use memo"를 붙인 BenchmarkCompiler만 컴파일하고 나머지는 원본 그대로 둔다.
export default defineConfig({
  plugins: [
    react(),
    babel({
      plugins: [["babel-plugin-react-compiler", { compilationMode: "annotation" }]],
    }),
  ],
  build: { minify: false },
});
