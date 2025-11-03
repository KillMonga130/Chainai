/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WXO_SECURITY_DISABLED?: string;
  readonly VITE_WXO_JWT?: string;
  readonly VITE_WXO_USE_IAM?: string;
  readonly VITE_WATSONX_API_KEY?: string;
  readonly VITE_OPENWEATHER_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
