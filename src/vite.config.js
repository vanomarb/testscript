import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import path from "path";

export default defineConfig({
  root: ".",         // serve from project root
  build: {
    outDir: path.resolve(__dirname, "./dist"),
    emptyOutDir: true,
  },
  publicDir: "assets/", // static assets
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    tailwindcss(),
  ]
});
