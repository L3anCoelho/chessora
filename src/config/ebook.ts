import type { EbookProduct } from '@/types/domain';
import { env } from './env';

/** Escopos de acesso usados pelo conteúdo e pelos produtos. */
export const SCOPES = {
  taticas: 'module:taticas',
  estrategia: 'module:estrategia',
  aberturas: 'module:aberturas',
  finais: 'module:finais',
  premiumChallenges: 'challenges:premium',
} as const;

export const EBOOK_PRODUCT_ID = 'ebook-xadrez-inteligente';

/**
 * Configuração do futuro e-book.
 * TEXTOS PROVISÓRIOS: isDemoContent mantém o aviso visível na página até o produto existir.
 * O mesmo produto precisa existir na tabela public.products (ver supabase/seed.sql),
 * pois é o banco, e não este arquivo, que decide o que a compra libera.
 */
export const ebookProduct: EbookProduct = {
  id: EBOOK_PRODUCT_ID,
  name: 'Xadrez Inteligente: do primeiro lance à primeira vitória',
  subtitle: 'E-book com exercícios integrados à plataforma',
  description:
    'Um guia em capítulos curtos que acompanha os módulos do site. Cada capítulo termina com exercícios que você resolve aqui, no tabuleiro, com correção imediata.',
  coverImageUrl: null,
  priceCents: env.ebookPriceCents,
  currency: 'BRL',
  benefits: [
    'Libera os módulos Táticas, Estratégia, Aberturas e Finais completos',
    'Desafios exclusivos vinculados a cada capítulo',
    'QR Codes no livro que abrem o exercício certo no site',
    'Seu progresso fica salvo na sua conta',
  ],
  contents: [
    { title: 'Táticas', detail: 'Garfo, cravada, ataque duplo, descoberta e mates em um lance.' },
    { title: 'Estratégia', detail: 'Centro, desenvolvimento, segurança do rei, estrutura de peões e planos.' },
    { title: 'Aberturas', detail: 'Italiana, Espanhola, Siciliana, Francesa e Gambito da Dama.' },
    { title: 'Finais', detail: 'Rei e peão, promoção, mate com torre e mate com dama.' },
  ],
  faq: [
    {
      question: 'O e-book já está disponível?',
      answer: 'Ainda não. Esta página mostra como o produto vai funcionar. A venda será aberta quando o livro estiver pronto.',
    },
    {
      question: 'Como o acesso premium é liberado?',
      answer:
        'Depois que a plataforma de pagamento confirma a compra, nosso servidor registra o seu direito de acesso e os módulos premium são liberados na sua conta. Voltar da página de pagamento, sozinho, não libera nada.',
    },
    {
      question: 'Preciso de conta para comprar?',
      answer: 'Sim. A compra é vinculada à sua conta, para que o acesso funcione em qualquer dispositivo.',
    },
    {
      question: 'O que continua gratuito?',
      answer: 'O módulo Fundamentos, os desafios gratuitos e as partidas contra o computador ou com outra pessoa no mesmo dispositivo.',
    },
  ],
  grantsScopes: Object.values(SCOPES),
  accessDurationDays: null,
  isDemoContent: true,
  chapters: [
    { number: 1, title: 'Táticas', moduleId: 'taticas', exerciseRoute: '/aprender/taticas' },
    { number: 2, title: 'Estratégia', moduleId: 'estrategia', exerciseRoute: '/aprender/estrategia' },
    { number: 3, title: 'Aberturas', moduleId: 'aberturas', exerciseRoute: '/aprender/aberturas' },
    { number: 4, title: 'Finais', moduleId: 'finais', exerciseRoute: '/aprender/finais' },
  ],
};
