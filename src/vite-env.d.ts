/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_TITLE_BAR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
