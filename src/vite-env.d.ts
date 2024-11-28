/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly MAIN_VITE_TUS_ENDPOINT: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }