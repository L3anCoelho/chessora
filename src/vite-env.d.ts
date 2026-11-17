/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_CHECKOUT_URL?: string;
  readonly VITE_CHECKOUT_REF_PARAM?: string;
  readonly VITE_EBOOK_PRICE_CENTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
