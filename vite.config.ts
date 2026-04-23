import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // base: './' - ЭТО ГЛАВНОЕ для Electron. 
  // Без этого пути к файлам в окне будут битыми (белый экран).
  base: './', 
  plugins: [
    react(), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // Настройки сервера для разработки
  server: {
    port: 5173,
    strictPort: true,
  }
});