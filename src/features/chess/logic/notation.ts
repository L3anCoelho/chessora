/**
 * Notação algébrica em português.
 *
 * O chess.js trabalha sempre em inglês (K, Q, R, B, N). Tudo que aparece para o
 * aluno passa por aqui: R=Rei, D=Dama, T=Torre, B=Bispo, C=Cavalo.
 * As colunas (a-h) e os símbolos de captura, xeque e mate não mudam.
 */

const PIECE_PT: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'B', N: 'C' };

export const PIECE_NAME_PT: Record<string, string> = {
  K: 'rei',
  Q: 'dama',
  R: 'torre',
  B: 'bispo',
  N: 'cavalo',
  P: 'peão',
};

/**
 * Converte um lance SAN do chess.js para a notação portuguesa.
 * Ex.: "Nf3" -> "Cf3", "Qxd8+" -> "Dxd8+", "e8=Q" -> "e8=D", "O-O" -> "O-O".
 */
export function sanToPortuguese(san: string): string {
  if (!san) return san;
  // Roque não muda (O-O / O-O-O), nem lances de peão sem promoção.
  let result = san;
  const first = result[0];
  if (PIECE_PT[first]) result = PIECE_PT[first] + result.slice(1);
  // Promoção: a peça escolhida vem depois do "=".
  result = result.replace(/=([KQRBN])/g, (_match, piece: string) => `=${PIECE_PT[piece] ?? piece}`);
  return result;
}

/** Lista de lances em português, para linhas como "1.e4 e5 2.Cf3". */
export function lineToPortuguese(sanMoves: string[]): string[] {
  return sanMoves.map(sanToPortuguese);
}

/** Artigo definido de cada peça, para montar frases ("mova a dama", "mova o cavalo"). */
export const PIECE_ARTICLE_PT: Record<string, 'o' | 'a'> = {
  K: 'o',
  Q: 'a',
  R: 'a',
  B: 'o',
  N: 'o',
  P: 'o',
};

/** Frase curta "o cavalo" / "a dama" a partir do SAN em inglês. */
export function pieceWithArticle(san: string): string | null {
  if (san.startsWith('O-O')) return null; // roque não move uma peça só
  const key = PIECE_NAME_PT[san[0]] ? san[0] : 'P';
  return `${PIECE_ARTICLE_PT[key]} ${PIECE_NAME_PT[key]}`;
}

/** Nome da peça que faz o lance, para leitores de tela ("cavalo para f3"). */
export function describeSan(san: string): string {
  if (san.startsWith('O-O-O')) return 'roque grande';
  if (san.startsWith('O-O')) return 'roque pequeno';
  const piece = PIECE_NAME_PT[san[0]] ?? 'peão';
  const capture = san.includes('x') ? ', com captura' : '';
  const check = san.includes('#') ? ', xeque-mate' : san.includes('+') ? ', xeque' : '';
  const target = /([a-h][1-8])(?:=[KQRBN])?[+#]?$/.exec(san)?.[1] ?? '';
  return `${piece} para ${target}${capture}${check}`;
}
