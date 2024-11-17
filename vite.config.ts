import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { installGlobals } from "@remix-run/node";
import { vitePlugin as remix } from "@remix-run/dev";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/openapi-naver": {
        target: "https://openapi.naver.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openapi-naver/, ""),
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [remix(), vanillaExtractPlugin(), tsconfigPaths()],
});
