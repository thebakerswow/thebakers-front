import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"], // Separa pacotes de vendor
        },
      },
    },
    chunkSizeWarningLimit: 500, // Opcional: Aumenta o limite do aviso
  },
});
