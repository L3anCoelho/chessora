/** Leitura centralizada das variáveis de ambiente públicas (prefixo VITE_). */

function read(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

const priceRaw = read('VITE_EBOOK_PRICE_CENTS');
const price = priceRaw ? Number.parseInt(priceRaw, 10) : NaN;

export const env = {
  supabaseUrl: read('VITE_SUPABASE_URL'),
  supabaseAnonKey: read('VITE_SUPABASE_ANON_KEY'),
  checkoutUrl: read('VITE_CHECKOUT_URL'),
  checkoutRefParam: read('VITE_CHECKOUT_REF_PARAM') || 'src',
  ebookPriceCents: Number.isFinite(price) && price > 0 ? price : null,
  baseUrl: import.meta.env.BASE_URL,
} as const;

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isCheckoutConfigured = /^https:\/\//.test(env.checkoutUrl);
