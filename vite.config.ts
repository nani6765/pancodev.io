import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix(), vanillaExtractPlugin()],
});
