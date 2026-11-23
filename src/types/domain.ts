/**
 * Modelos de domínio da plataforma.
 * Os nomes de campos espelham as tabelas em supabase/migrations (snake_case no banco,
 * camelCase aqui); os mapeamentos ficam nos serviços.
 */

/* ---------- Usuários e acesso ---------- */

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

/** Nível de acesso exigido por um conteúdo. */
export type AccessLevel = 'public' | 'registered' | 'premium';

/**
 * Escopo liberado por um produto. Ex.: "module:estrategia", "challenges:premium".
 * Um conteúdo premium declara qual escopo exige; um produto declara quais escopos libera.
 */
export type AccessScope = string;

export type EntitlementSource = 'purchase' | 'admin_grant' | 'promotion';
export type EntitlementStatus = 'active' | 'revoked' | 'refunded' | 'expired';

/** Direito de acesso de um usuário a um produto. Só é criado pelo backend (webhook ou admin). */
export interface UserEntitlement {
  id: string;
  userId: string;
  productId: string;
  /** Nome do produto, quando o banco o devolve. */
  productName?: string;
  scopes: AccessScope[];
  source: EntitlementSource;
  status: EntitlementStatus;
  externalReference: string | null;
  startsAt: string;
  expiresAt: string | null;
}

/** Quem está acessando: usado pelo serviço central de permissões. */
export interface AccessSubject {
  kind: 'visitor' | 'registered' | 'premium' | 'admin';
  userId: string | null;
  role: UserRole | null;
  scopes: Set<AccessScope>;
}

/* ---------- Conteúdo ---------- */

export interface Course {
  id: string;
  title: string;
  description: string;
  moduleIds: string[];
}

export type ModuleTone = 'fundamentos' | 'taticas' | 'estrategia' | 'aberturas' | 'finais';

export interface Module {
  id: string;
  slug: string;
  order: number;
  title: string;
  summary: string;
  /** O que o aluno vai conseguir fazer ao final do módulo. */
  outcomes: string[];
  access: AccessLevel;
  /** Escopo exigido quando access === 'premium'. */
  requiredScope?: AccessScope;
  /** Capítulo do futuro e-book ao qual o módulo se vincula. */
  ebookChapter?: number;
  lessonIds: string[];
}

export type LessonStatus = 'published' | 'coming-soon';

export interface Lesson {
  id: string;
  slug: string;
  moduleId: string;
  order: number;
  title: string;
  summary: string;
  durationMinutes: number;
  access: AccessLevel;
  requiredScope?: AccessScope;
  status: LessonStatus;
  /**
   * Corpo da aula. Presente no código apenas para aulas públicas ou para cadastrados.
   * Aulas premium têm o corpo armazenado no banco (tabela lesson_contents), protegido por RLS.
   */
  body?: LessonBlock[];
}

export type LessonBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'tip'; title: string; text: string }
  | {
      type: 'diagram';
      fen: string;
      caption: string;
      /** Casas destacadas (ex.: alvos de uma peça). */
      highlights?: string[];
      /** Calcula e destaca os lances legais da peça nessa casa. */
      showMovesFrom?: string;
      orientation?: 'w' | 'b';
    }
  | {
      type: 'exercise';
      id: string;
      prompt: string;
      fen: string;
      /** Lances aceitos (SAN). Para objetivo "mate", qualquer mate também é aceito. */
      acceptedMoves: string[];
      goal: 'move' | 'checkmate';
      successText: string;
    }
  | GuidedLineBlock
  | GuidedGameBlock;

/** Um lance dentro de uma partida guiada. */
export interface GuidedGameMove {
  /** Lance em SAN do chess.js (inglês). */
  san: string;
  /** Por que esse lance. Nos lances do adversário, o que ele está tentando. */
  note?: string;
}

/** Uma variante completa: a partida do início ao fim por um caminho. */
export interface GuidedGameVariation {
  /** Rótulo curto ("se ele defende com o cavalo"). */
  label?: string;
  /** Lances alternando aluno e adversário, começando pelo aluno. */
  moves: GuidedGameMove[];
  /** Como termina. O padrão é mate. */
  outcome?: 'mate' | 'advantage' | 'equal';
  /** Texto mostrado quando o aluno chega ao fim desta variante. */
  ending?: string;
}

/**
 * Partida guiada com ramificações: o aluno joga do começo ao fim e o
 * adversário pode tentar defesas diferentes a cada repetição. Só termina
 * quando o aluno vence todas as tentativas.
 */
export interface GuidedGameBlock {
  type: 'guided-game';
  id: string;
  title: string;
  startFen?: string;
  orientation?: 'w' | 'b';
  intro?: string;
  conclusion?: string;
  /** Exige que TODA resposta legal do adversário esteja prevista. */
  exhaustive?: boolean;
  /**
   * Como `exhaustive`, mas só a partir deste lance (contando do 1). Serve para
   * aberturas: nos primeiros lances é impossível prever tudo, mas da hora em
   * que o mate vira forçado em diante não pode faltar defesa.
   */
  exhaustiveFrom?: number;
  variations: GuidedGameVariation[];
}

/** Um passo do guia lance a lance. Os lances vêm em SAN do chess.js (inglês). */
export interface GuidedStep {
  /** Lance que o aluno deve jogar. */
  move: string;
  /** Resposta do adversário, jogada automaticamente. */
  reply?: string;
  /** Por que esse lance, em uma ou duas frases. */
  explanation: string;
}

/**
 * Guia lance a lance: o aluno joga a linha no tabuleiro, um lance de cada vez.
 * Só o lance certo é aceito; a resposta do adversário é automática.
 */
export interface GuidedLineBlock {
  type: 'guided-line';
  id: string;
  title: string;
  /** Posição de partida. Padrão: posição inicial. */
  startFen?: string;
  orientation?: 'w' | 'b';
  /** Texto curto mostrado antes do tabuleiro. */
  intro?: string;
  /** Texto mostrado quando a linha termina. */
  conclusion?: string;
  steps: GuidedStep[];
}

/* ---------- Desafios ---------- */

export type ChallengeGoal = 'checkmate' | 'best-move' | 'win-material';
export type ChallengeCategory = 'mate' | 'garfo' | 'cravada' | 'captura' | 'espeto' | 'sequencia';
export type Difficulty = 'iniciante' | 'intermediario' | 'avancado';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  fen: string;
  sideToMove: 'w' | 'b';
  goal: ChallengeGoal;
  objective: string;
  /**
   * Linha de solução em SAN, alternando jogador e adversário: [jogador, resposta, jogador...].
   * Termina sempre num lance do jogador.
   */
  solution: string[];
  /** Lances alternativos igualmente corretos para o primeiro lance (apenas desafios de 1 lance). */
  alternativeFirstMoves?: string[];
  explanation: string;
  hint?: string;
  difficulty: Difficulty;
  category: ChallengeCategory;
  access: AccessLevel;
  requiredScope?: AccessScope;
}

/** Metadados públicos de um desafio premium: posição e solução ficam no banco. */
export type ChallengeSummary = Pick<
  Challenge,
  'id' | 'title' | 'description' | 'objective' | 'difficulty' | 'category' | 'access' | 'requiredScope' | 'goal'
>;

/* ---------- Partidas ---------- */

export type GameMode = 'computer' | 'local' | 'online';
export type EngineLevel = 'facil' | 'medio' | 'dificil';
export type PlayerColor = 'w' | 'b';

export type GameResult = 'white' | 'black' | 'draw' | 'aborted';
export type GameEndReason =
  | 'checkmate'
  | 'stalemate'
  | 'insufficient-material'
  | 'threefold-repetition'
  | 'fifty-move-rule'
  | 'resignation'
  | 'timeout'
  | 'agreement';

export interface GameMove {
  ply: number;
  san: string;
  from: string;
  to: string;
  promotion?: string;
  fenAfter: string;
  playedAt: string;
}

export interface ChessGame {
  id: string;
  mode: GameMode;
  whiteName: string;
  blackName: string;
  /** Cor do usuário no modo contra o computador. */
  playerColor?: PlayerColor;
  engineLevel?: EngineLevel;
  initialFen: string;
  pgn: string;
  moves: GameMove[];
  result: GameResult | null;
  endReason: GameEndReason | null;
  startedAt: string;
  endedAt: string | null;
  /** Reservado para partidas online: sala, controle de tempo, sincronização. */
  online?: {
    roomId: string;
    timeControl: { initialSeconds: number; incrementSeconds: number };
    whiteUserId: string;
    blackUserId: string;
  };
}

/* ---------- Progresso ---------- */

export type GameOutcomeForUser = 'win' | 'loss' | 'draw';

export interface GameRecord {
  id: string;
  mode: Exclude<GameMode, 'online'>;
  outcome: GameOutcomeForUser | null;
  result: GameResult;
  endReason: GameEndReason;
  engineLevel?: EngineLevel;
  moveCount: number;
  pgn: string;
  endedAt: string;
}

export interface ChallengeRecord {
  challengeId: string;
  solved: boolean;
  attempts: number;
  solvedAt: string | null;
}

export interface LessonRecord {
  lessonId: string;
  completedAt: string;
}

export interface UserProgress {
  games: GameRecord[];
  challenges: ChallengeRecord[];
  lessons: LessonRecord[];
}

/* ---------- E-book e pagamento ---------- */

export interface EbookProduct {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  /** Caminho da capa; null enquanto não existir capa definitiva. */
  coverImageUrl: string | null;
  priceCents: number | null;
  currency: 'BRL';
  benefits: string[];
  contents: { title: string; detail: string }[];
  faq: { question: string; answer: string }[];
  /** Escopos liberados pela compra. */
  grantsScopes: AccessScope[];
  /** Validade do acesso em dias; null = vitalício. */
  accessDurationDays: number | null;
  /** Indica textos provisórios: a página mostra o aviso de conteúdo demonstrativo. */
  isDemoContent: boolean;
  /** Para uso futuro: capítulos e QR Codes ligando o livro aos exercícios do site. */
  chapters: EbookChapter[];
}

export interface EbookChapter {
  number: number;
  title: string;
  moduleId: string;
  /** Rota do site aberta pelo QR Code impresso no capítulo. */
  exerciseRoute: string;
}

export type PaymentEventType = 'purchase_approved' | 'refunded' | 'chargeback' | 'subscription_canceled' | 'other';

export interface PaymentEvent {
  id: string;
  provider: 'kiwify' | 'other';
  externalId: string;
  type: PaymentEventType;
  productId: string | null;
  userId: string | null;
  buyerEmail: string | null;
  receivedAt: string;
  processedAt: string | null;
  status: 'received' | 'processed' | 'ignored' | 'failed';
}
