/**
 * Webhook de pagamento (Supabase Edge Function, Deno). NÃO está publicado nesta etapa.
 *
 * Fluxo: a plataforma de checkout chama esta função -> a assinatura é conferida ->
 * o evento é aplicado no banco pela função SQL public.apply_payment_event(), que é
 * idempotente e só pode ser executada com a service_role key (que fica só aqui, no servidor).
 *
 * Falha fechada: sem segredo configurado, com assinatura inválida ou com payload incompleto,
 * a função responde erro e não libera nada.
 *
 * ANTES DE PUBLICAR: confira com um payload real da Kiwify (painel > Webhooks > testar)
 * os nomes dos campos lidos em `parseKiwify` e o formato da assinatura em `verifyKiwifySignature`.
 * Se o formato for diferente, a função recusa todas as chamadas, nunca libera acesso por engano.
 *
 * Publicar:
 *   supabase secrets set KIWIFY_WEBHOOK_TOKEN=... (o token definido ao criar o webhook na Kiwify)
 *   supabase functions deploy checkout-webhook --no-verify-jwt
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

type EventType = 'purchase_approved' | 'refunded' | 'chargeback' | 'subscription_canceled' | 'other';

interface NormalizedEvent {
  externalId: string;
  type: EventType;
  externalProductId: string | null;
  userReference: string | null;
  buyerEmail: string | null;
}

const KIWIFY_EVENTS: Record<string, EventType> = {
  compra_aprovada: 'purchase_approved',
  paid: 'purchase_approved',
  compra_reembolsada: 'refunded',
  refunded: 'refunded',
  chargeback: 'chargeback',
  chargedback: 'chargeback',
  subscription_canceled: 'subscription_canceled',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** HMAC-SHA1 do corpo bruto com o token, comparado ao parâmetro `signature` da URL. */
async function verifyKiwifySignature(rawBody: string, signature: string | null, token: string): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(token), { name: 'HMAC', hash: 'SHA-1' }, false, [
    'sign',
  ]);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(hex, signature.toLowerCase());
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseKiwify(body: Record<string, any>): NormalizedEvent | null {
  const externalId = text(body.order_id) ?? text(body.order?.order_id);
  const rawType = text(body.webhook_event_type) ?? text(body.order_status);
  if (!externalId || !rawType) return null;
  return {
    externalId,
    type: KIWIFY_EVENTS[rawType] ?? 'other',
    externalProductId: text(body.Product?.product_id) ?? text(body.product_id),
    // O site envia o ID da conta no link de checkout (VITE_CHECKOUT_REF_PARAM).
    userReference: text(body.TrackingParameters?.src) ?? text(body.TrackingParameters?.sck),
    buyerEmail: text(body.Customer?.email),
  };
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const token = Deno.env.get('KIWIFY_WEBHOOK_TOKEN');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!token || !supabaseUrl || !serviceKey) return json(503, { error: 'not_configured' });

  const rawBody = await request.text();
  const signature = new URL(request.url).searchParams.get('signature');
  if (!(await verifyKiwifySignature(rawBody, signature, token))) return json(401, { error: 'invalid_signature' });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const event = parseKiwify(body);
  if (!event) return json(400, { error: 'unrecognized_payload' });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc('apply_payment_event', {
    p_provider: 'kiwify',
    p_external_id: event.externalId,
    p_event_type: event.type,
    p_external_product_id: event.externalProductId,
    p_user_reference: event.userReference,
    p_buyer_email: event.buyerEmail,
    p_payload: body,
  });
  // 5xx faz a plataforma reenviar; o processamento é idempotente.
  if (error) return json(500, { error: 'processing_failed' });
  return json(200, { result: data });
});
