/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly MAIN_VITE_TUS_ENDPOINT: string
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}