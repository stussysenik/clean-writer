declare const __APP_VERSION__: string;
declare const __BUILD_TRACK__: string;
declare const __BUILD_HASH__: string;

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
