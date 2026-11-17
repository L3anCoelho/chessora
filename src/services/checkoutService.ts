/**
 * Ligação com o checkout externo (ex.: Kiwify).
 *
 * O frontend só monta o link de pagamento. A liberação do acesso NÃO acontece aqui:
 * ela é feita pelo webhook no servidor (supabase/functions/checkout-webhook), depois que
 * a plataforma de pagamento confirma a compra.
 */
import { env, isCheckoutConfigured } from '@/config/env';

export type CheckoutLink =
  | { status: 'ready'; url: string }
  | { status: 'not-configured' }
  | { status: 'requires-login' };

export function buildCheckoutLink(userId: string | null): CheckoutLink {
  if (!isCheckoutConfigured) return { status: 'not-configured' };
  // A compra precisa estar ligada a uma conta para o webhook saber a quem liberar.
  if (!userId) return { status: 'requires-login' };
  const url = new URL(env.checkoutUrl);
  // Envia só o ID interno (não o e-mail): o webhook usa essa referência para achar a conta.
  url.searchParams.set(env.checkoutRefParam, userId);
  return { status: 'ready', url: url.toString() };
}
