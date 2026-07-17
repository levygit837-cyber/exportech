import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function omitPrivateHeroAssets(enabled: boolean): Plugin {
  return {
    name: "exportech-omit-private-hero-assets",
    apply: "build",
    closeBundle() {
      if (enabled) return;
      rmSync(resolve("dist/models/iphone-17-pro-max"), {
        recursive: true,
        force: true,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  const hero3DEnabled =
    environment.VITE_ENABLE_HERO3D_PROTOTYPE === "true";

  return {
    plugins: [
      react(),
      tailwindcss(),
      omitPrivateHeroAssets(hero3DEnabled),
    ],
    server: { host: true, port: 5173 },
  };
});
