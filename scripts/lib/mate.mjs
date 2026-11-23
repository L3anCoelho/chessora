/**
 * Mates forçados por busca exaustiva no chess.js.
 *
 * Usado para gerar a árvore completa de uma partida guiada: o lance certo do
 * aluno, todas as defesas possíveis e a continuação, até o mate. Como a busca
 * é exaustiva, o que sai daqui é verdade, não memória.
 */
import { Chess } from 'chess.js';

/**
 * Quem está na vez dá mate em no máximo `moves` lances?
 * @returns o número de lances do mate mais curto, ou null
 */
export function mateDistance(chess, moves) {
  if (moves <= 0) return null;
  let best = null;
  for (const san of chess.moves()) {
    chess.move(san);
    let distance = null;
    if (chess.isCheckmate()) {
      distance = 1;
    } else if (!chess.isGameOver() && moves > 1) {
      // Todas as defesas precisam levar a mate; vale a pior delas.
      let worst = 0;
      let forced = true;
      for (const reply of chess.moves()) {
        chess.move(reply);
        const next = mateDistance(chess, moves - 1);
        chess.undo();
        if (next === null) {
          forced = false;
          break;
        }
        worst = Math.max(worst, next);
      }
      if (forced) distance = worst + 1;
    }
    chess.undo();
    if (distance !== null && (best === null || distance < best)) best = distance;
  }
  return best;
}

/** O lance que dá o mate mais curto. Prefere xeque, que é mais fácil de explicar. */
export function bestMatingMove(chess, moves) {
  const candidates = [];
  for (const san of chess.moves()) {
    chess.move(san);
    let distance = null;
    if (chess.isCheckmate()) {
      distance = 1;
    } else if (!chess.isGameOver() && moves > 1) {
      let worst = 0;
      let forced = true;
      for (const reply of chess.moves()) {
        chess.move(reply);
        const next = mateDistance(chess, moves - 1);
        chess.undo();
        if (next === null) {
          forced = false;
          break;
        }
        worst = Math.max(worst, next);
      }
      if (forced) distance = worst + 1;
    }
    const givesCheck = chess.inCheck();
    chess.undo();
    if (distance !== null) candidates.push({ san, distance, givesCheck });
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.distance - b.distance || Number(b.givesCheck) - Number(a.givesCheck));
  return candidates[0];
}

/** Monta as variantes: uma por caminho até o mate. */
export function buildVariations(chess, moves, prefix = []) {
  const best = bestMatingMove(chess, moves);
  if (!best) throw new Error(`Sem mate forçado em ${moves} lances a partir de ${chess.fen()}`);
  const playerMove = chess.move(best.san);
  const here = [...prefix, { san: playerMove.san }];

  if (chess.isCheckmate()) {
    chess.undo();
    return [{ moves: here, outcome: 'mate' }];
  }

  const out = [];
  for (const reply of chess.moves()) {
    const replyMove = chess.move(reply);
    out.push(...buildVariations(chess, moves - 1, [...here, { san: replyMove.san }]));
    chess.undo();
  }
  chess.undo();
  return out;
}
