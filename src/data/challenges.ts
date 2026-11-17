/**
 * Desafios.
 *
 * Gratuitos: completos aqui (posição, solução e explicação).
 * Premium: só os metadados ficam aqui. Posição, solução e explicação ficam em
 * challenge_contents no banco, protegidos por RLS (ver supabase/seed.sql).
 *
 * Todas as posições e soluções gratuitas são verificadas em src/data/challenges.test.ts.
 */
import type { Challenge, ChallengeSummary } from '@/types/domain';
import { SCOPES } from '@/config/ebook';

export const freeChallenges: Challenge[] = [
  {
    id: 'mate-dama-canto',
    title: 'Dama e rei contra o canto',
    description: 'O rei preto está preso no canto. Um lance da dama encerra a partida.',
    fen: 'k7/8/1K6/8/8/8/8/7Q w - - 0 1',
    sideToMove: 'w',
    goal: 'checkmate',
    objective: 'Brancas jogam e dão mate em 1.',
    solution: ['Qh8#'],
    explanation:
      'A dama dá xeque pela oitava fileira e o rei branco cobre a7 e b7. Existe outro mate: Qb7#, com a dama protegida pelo rei. Qualquer um dos dois resolve.',
    hint: 'Procure uma casa de onde a dama ataque o rei e o seu próprio rei cuide das fugas.',
    difficulty: 'iniciante',
    category: 'mate',
    access: 'public',
  },
  {
    id: 'garfo-rei-dama',
    title: 'Cavalo contra rei e dama',
    description: 'O cavalo branco está a um salto de atacar duas peças importantes.',
    fen: '3q3k/6pp/8/6N1/8/8/6PP/6K1 w - - 0 1',
    sideToMove: 'w',
    goal: 'win-material',
    objective: 'Brancas jogam e ganham a dama.',
    solution: ['Nf7+'],
    explanation:
      'Nf7+ dá xeque no rei em h8 e ataca a dama em d8 ao mesmo tempo. Como o rei é obrigado a sair do xeque, no lance seguinte o cavalo captura a dama.',
    hint: 'Procure uma casa de onde o cavalo ataque o rei e a dama juntos.',
    difficulty: 'iniciante',
    category: 'garfo',
    access: 'public',
  },
  {
    id: 'cravada-peao',
    title: 'Peão contra peça cravada',
    description: 'O cavalo preto não pode sair de c6 sem expor o rei.',
    fen: '4k3/1p6/2n5/1B6/3P4/8/8/4K3 w - - 0 1',
    sideToMove: 'w',
    goal: 'win-material',
    objective: 'Brancas jogam e ganham o cavalo.',
    solution: ['d5'],
    explanation:
      'O bispo em b5 crava o cavalo contra o rei em e8. Com d5, o peão ataca o cavalo, que não pode se mover. Trocar com Bxc6+ seria só uma troca igual; d5 ganha a peça por um peão.',
    hint: 'Ataque a peça que não pode se mexer com a sua peça mais barata.',
    difficulty: 'intermediario',
    category: 'cravada',
    access: 'public',
  },
  {
    id: 'peca-indefesa',
    title: 'Qual captura é segura?',
    description: 'As brancas podem capturar duas peças, mas só uma está sem proteção.',
    fen: '6k1/5ppp/4p3/3n4/4b3/8/5PPP/3RR1K1 w - - 0 1',
    sideToMove: 'w',
    goal: 'win-material',
    objective: 'Brancas jogam e ganham uma peça sem perder nada.',
    solution: ['Rxe4'],
    explanation:
      'O bispo em e4 não tem defensores, então Rxe4 ganha uma peça inteira. Já o cavalo em d5 está protegido pelo peão de e6: Rxd5 perderia a torre por um cavalo.',
    hint: 'Antes de capturar, confira quem protege cada peça.',
    difficulty: 'iniciante',
    category: 'captura',
    access: 'public',
  },
  {
    id: 'espeto-torre',
    title: 'Espeto na quinta fileira',
    description: 'O rei e a dama pretos estão alinhados.',
    fen: '8/8/8/1q2k3/8/8/8/4K2R w - - 0 1',
    sideToMove: 'w',
    goal: 'win-material',
    objective: 'Brancas jogam e ganham a dama.',
    solution: ['Rh5+'],
    explanation:
      'Rh5+ dá xeque pela quinta fileira. O rei precisa sair da linha e, com isso, a dama em b5 fica exposta: no lance seguinte, Rxb5. É o espeto, o contrário da cravada: a peça mais valiosa está na frente.',
    hint: 'Dê xeque na mesma linha em que estão o rei e a dama.',
    difficulty: 'intermediario',
    category: 'espeto',
    access: 'public',
  },
  {
    id: 'mate-em-dois-corredor',
    title: 'Torres dobradas',
    description: 'A torre preta defende a última fileira sozinha. Sobrecarregue a defesa.',
    fen: '2r3k1/5ppp/8/8/8/8/3R1PPP/3R2K1 w - - 0 1',
    sideToMove: 'w',
    goal: 'checkmate',
    objective: 'Brancas jogam e dão mate em 2.',
    solution: ['Rd8+', 'Rxd8', 'Rxd8#'],
    explanation:
      'Rd8+ obriga a torre preta a capturar, porque o rei não tem casas. Depois de Rxd8, a segunda torre retoma em d8 com mate do corredor.',
    hint: 'Ofereça uma torre na oitava fileira.',
    difficulty: 'intermediario',
    category: 'sequencia',
    access: 'public',
  },
];

export const premiumChallengeSummaries: ChallengeSummary[] = [
  {
    id: 'mate-abafado',
    title: 'Mate abafado',
    description: 'As próprias peças pretas cercam o rei.',
    objective: 'Brancas jogam e dão mate em 1.',
    difficulty: 'intermediario',
    category: 'mate',
    goal: 'checkmate',
    access: 'premium',
    requiredScope: SCOPES.premiumChallenges,
  },
  {
    id: 'descoberta-com-xeque',
    title: 'Descoberta com xeque',
    description: 'Um lance do cavalo libera a torre contra a dama.',
    objective: 'Brancas jogam e ganham a dama.',
    difficulty: 'intermediario',
    category: 'captura',
    goal: 'win-material',
    access: 'premium',
    requiredScope: SCOPES.premiumChallenges,
  },
  {
    id: 'sacrificio-de-dama',
    title: 'Sacrifício de dama',
    description: 'Entregue a peça mais forte para dar mate com o cavalo.',
    objective: 'Brancas jogam e dão mate em 2.',
    difficulty: 'avancado',
    category: 'sequencia',
    goal: 'checkmate',
    access: 'premium',
    requiredScope: SCOPES.premiumChallenges,
  },
];

export const CATEGORY_LABEL: Record<Challenge['category'], string> = {
  mate: 'Mate',
  garfo: 'Garfo',
  cravada: 'Cravada',
  captura: 'Captura',
  espeto: 'Espeto',
  sequencia: 'Sequência',
};

export const DIFFICULTY_LABEL: Record<Challenge['difficulty'], string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};
