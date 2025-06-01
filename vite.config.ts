// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// अगर cartographer चाहिए तो ये import करो
// import { cartographer } from "@replit/vite-plugin-cartographer";

export default defineConfig({
  root: path.resolve(__dirname, "client"), // ✅ Fix: Vite को सही root path मिले
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
    //   ? [cartographer()]
    //   : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"), // ✅ Output build folder
    emptyOutDir: true,
  },
});
