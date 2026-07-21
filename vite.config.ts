import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/drei/core/Gltf",
    ],
  },
  server: {
    host: true,
    port: 5173,
    warmup: {
      clientFiles: [
        "./src/components/Hero3DExperience.tsx",
        "./src/components/Hero3DCanvas.tsx",
      ],
    },
  },
});
