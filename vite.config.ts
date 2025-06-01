import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // runtimeErrorOverlay हटाया गया क्योंकि यह ESM-only है
    // cartographer plugin भी हटाया गया क्योंकि उसमें await था
  ],
  resolve: {
    alias: {
      "@": path.resolve(_dirname, "client", "src"),
      "@shared": path.resolve(_dirname, "shared"),
      "@assets": path.resolve(_dirname, "attached_assets"),
    },
  },
  root: path.resolve(_dirname, "client"),
  build: {
    outDir: path.resolve(_dirname, "dist/public"),
    emptyOutDir: true,
  },
});
