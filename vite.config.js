import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: ".",         // serve from project root
  publicDir: "src/assets/images/", // static assets
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    tailwindcss(),
  ]
});
