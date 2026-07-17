/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_HERO3D_PROTOTYPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
