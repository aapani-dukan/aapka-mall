// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// यह import ऊपर करना होगा (dynamic नहीं)
import { cartographer } from "@replit/vite-plugin-cartographer";

const isDev = process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined;

export default defineConfig({
  root: "client", // ✅ सिर्फ एक बार root
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(isDev ? [cartographer()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
