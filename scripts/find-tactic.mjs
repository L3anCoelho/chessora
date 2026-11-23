/**
 * Procura posições de exercício com um golpe tático único.
 *
 * Sorteia posições esparsas com um conjunto de peças, filtra pela geometria
 * (lance que ataca duas peças sem defesa, ou xeque + peça sem defesa) e só
 * mantém as que passam numa checagem exaustiva: depois do lance, qualquer
 * resposta do adversário permite capturar a peça alvo de graça.
 *
 *   node scripts/find-tactic.mjs --white KQPPP --black KRNPPP --max 6
 *   node scripts/find-tactic.mjs --white KRPPP --black KBNPPP --turn w --max 4
 */
import { Chess } from 'chess.js';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const whiteSet = (opt('white', 'KQPPP')).split('');
const blackSet = (opt('black', 'KRNPPP')).split('');
const turn = opt('turn', 'w');
const wanted = Number(opt('max', 5));
const tries = Number(opt('tries', 60000));
const seedArg = Number(opt('seed', 1));
const motif = opt('motif', 'duplo'); // duplo | xeque | descoberta | mate1

const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const FILES = 'abcdefgh'.split('');

// Sorteio determinístico, para o resultado ser reproduzível.
let seed = seedArg;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const pick = (list) => list[Math.floor(random() * list.length)];

function squares(ranks) {
  return ranks.flatMap((rank) => FILES.map((file) => `${file}${rank}`));
}

/** Monta um FEN com peões em fileiras plausíveis e peças longe das bordas. */
function randomPosition() {
  const board = new Map();
  const place = (piece, color, allowed) => {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const square = pick(allowed);
      if (board.has(square)) continue;
      board.set(square, { piece, color });
      return square;
    }
    return null;
  };

  // Reis em cantos abrigados, como num meio-jogo depois do roque.
  const whiteKing = place('k', 'w', ['g1', 'h1', 'g2', 'h2', 'b1', 'c1']);
  const blackKing = place('k', 'b', ['g8', 'h8', 'g7', 'h7', 'b8', 'c8']);
  if (!whiteKing || !blackKing) return null;

  const pawnRanks = { w: [2, 3], b: [6, 7] };
  const pieceRanks = { w: [1, 2, 3, 4, 5, 6], b: [3, 4, 5, 6, 7, 8] };

  for (const [set, color] of [
    [whiteSet, 'w'],
    [blackSet, 'b'],
  ]) {
    for (const symbol of set) {
      const type = symbol.toLowerCase();
      if (type === 'k') continue;
      const allowed = type === 'p' ? squares(pawnRanks[color]) : squares(pieceRanks[color]);
      if (!place(type, color, allowed)) return null;
    }
  }

  const rows = [];
  for (let rank = 8; rank >= 1; rank -= 1) {
    let row = '';
    let empty = 0;
    for (const file of FILES) {
      const cell = board.get(`${file}${rank}`);
      if (!cell) {
        empty += 1;
        continue;
      }
      if (empty) {
        row += empty;
        empty = 0;
      }
      row += cell.color === 'w' ? cell.piece.toUpperCase() : cell.piece;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join('/')} ${turn} - - 0 1`;
}

/**
 * Depois de `san`, toda resposta do adversário permite capturar de graça uma
 * peça que valha pelo menos `minValue`.
 */
function winsMaterial(fen, san, minValue) {
  const chess = new Chess(fen);
  chess.move(san);
  const replies = chess.moves();
  if (replies.length === 0) return chess.isCheckmate() ? { ok: true, gain: 99 } : { ok: false };
  let worst = 99;
  for (const reply of replies) {
    chess.move(reply);
    let best = 0;
    for (const capture of chess.moves({ verbose: true })) {
      if (!capture.captured) continue;
      const value = VALUE[capture.captured];
      if (value < minValue) continue;
      // A captura precisa ser de graça: a casa não pode estar defendida.
      chess.move(capture);
      const safe = !chess.isAttacked(capture.to, chess.turn());
      chess.undo();
      if (safe && value > best) best = value;
    }
    chess.undo();
    if (best === 0) return { ok: false };
    worst = Math.min(worst, best);
  }
  return { ok: true, gain: worst };
}

/** Candidatos pela geometria, conforme o motivo tático pedido. */
function describe(fen) {
  const chess = new Chess(fen);
  const me = chess.turn();
  const them = me === 'w' ? 'b' : 'w';

  /** Peças inimigas (sem o rei) atacadas e sem defesa, e quem as ataca. */
  const looseInfo = () => {
    const list = [];
    for (const row of chess.board()) {
      for (const cell of row) {
        if (!cell || cell.color !== them || cell.type === 'k') continue;
        if (chess.isAttacked(cell.square, me) && !chess.isAttacked(cell.square, them)) list.push(cell);
      }
    }
    return list;
  };

  const before = new Set(looseInfo().map((cell) => cell.square));
  const found = [];
  for (const move of chess.moves({ verbose: true })) {
    chess.move(move);
    const targets = looseInfo();
    const check = chess.inCheck();
    // Alvos que só passaram a estar atacados por causa deste lance.
    const fresh = targets.filter((cell) => !before.has(cell.square));
    // Numa descoberta, quem ataca o alvo não é a peça que acabou de mover.
    const byOther = fresh.filter((cell) => {
      const attackers = chess
        .moves({ verbose: true, square: undefined })
        .filter(() => false);
      void attackers;
      return cell.square !== move.to;
    });
    chess.undo();

    if (motif === 'duplo' && !check && targets.length >= 2 && fresh.length >= 2) {
      found.push({ san: move.san, check, looseTargets: targets.length });
    }
    if (motif === 'xeque' && check && fresh.length >= 1) {
      found.push({ san: move.san, check, looseTargets: targets.length });
    }
    if (motif === 'descoberta' && byOther.length >= 1 && move.to !== undefined) {
      // A peça que moveu saiu da frente: o alvo é atacado de longe.
      const revealed = byOther.filter((cell) => !lineBetween(move.from, cell.square));
      if (revealed.length >= 1) found.push({ san: move.san, check, looseTargets: targets.length });
    }
  }
  return found;
}

/** O lado que não está na vez está em xeque? Então a posição é ilegal. */
function opponentInCheck(fen) {
  const parts = fen.split(' ');
  parts[1] = parts[1] === 'w' ? 'b' : 'w';
  try {
    return new Chess(parts.join(' ')).inCheck();
  } catch {
    return true;
  }
}

/** Duas casas estão na mesma linha reta (coluna, fileira ou diagonal)? */
function lineBetween(a, b) {
  const [af, ar] = [a.charCodeAt(0), Number(a[1])];
  const [bf, br] = [b.charCodeAt(0), Number(b[1])];
  return af === bf || ar === br || Math.abs(af - bf) === Math.abs(ar - br);
}

const results = [];
for (let attempt = 0; attempt < tries && results.length < wanted; attempt += 1) {
  const fen = randomPosition();
  if (!fen) continue;
  let chess;
  try {
    chess = new Chess(fen);
  } catch {
    continue;
  }
  if (chess.isGameOver() || chess.inCheck()) continue;
  // Posição ilegal: quem NÃO está na vez não pode estar em xeque.
  if (opponentInCheck(fen)) continue;
  // O adversário não pode estar em xeque "por tabela" nem ter mate imediato trivial.
  if (motif === 'mate1') {
    const mates = chess.moves().filter((san) => {
      chess.move(san);
      const mate = chess.isCheckmate();
      chess.undo();
      return mate;
    });
    if (mates.length !== 1) continue;
    results.push({ fen, san: mates[0], gain: 99, candidates: [{ san: mates[0] }] });
    continue;
  }

  const candidates = describe(fen);
  if (candidates.length === 0) continue;

  const winners = [];
  for (const move of chess.moves()) {
    const outcome = winsMaterial(fen, move, 3);
    if (outcome.ok) winners.push({ san: move, gain: outcome.gain });
  }
  if (winners.length !== 1) continue; // precisa ser solução única
  const [winner] = winners;
  if (!candidates.some((entry) => entry.san === winner.san)) continue; // e precisa ser o golpe esperado
  results.push({ fen, san: winner.san, gain: winner.gain, candidates });
}

if (results.length === 0) {
  console.log('Nada encontrado. Tente outro conjunto de peças ou outra seed.');
} else {
  for (const result of results) {
    console.log(`${result.fen}`);
    console.log(`  único lance que ganha material: ${result.san} (ganha ${result.gain})`);
    console.log(`  candidatos pela geometria: ${result.candidates.map((entry) => entry.san).join(', ')}`);
  }
}
