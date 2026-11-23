/**
 * Procura posições boas para uma partida guiada: mate forçado em poucos lances
 * e, principalmente, com VÁRIAS defesas possíveis — que é o que faz o aluno ter
 * de saber a resposta para cada tentativa do adversário.
 *
 *   node scripts/find-mate-tree.mjs --white KQR --black KPPP --moves 2 --min-branches 3
 */
import { Chess } from 'chess.js';
import { buildVariations, mateDistance } from './lib/mate.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const whiteSet = opt('white', 'KQR').split('');
const blackSet = opt('black', 'KPPP').split('');
const moves = Number(opt('moves', 2));
const minBranches = Number(opt('min-branches', 3));
/** Quantas respostas DIFERENTES do aluno a árvore precisa exigir. */
const minAnswers = Number(opt('min-answers', 2));
const wanted = Number(opt('max', 4));
const tries = Number(opt('tries', 40000));
let seed = Number(opt('seed', 1));

const FILES = 'abcdefgh'.split('');
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const pick = (list) => list[Math.floor(random() * list.length)];
const squares = (ranks) => ranks.flatMap((rank) => FILES.map((file) => `${file}${rank}`));

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
  if (!place('k', 'w', squares([1, 2, 3, 4, 5, 6]))) return null;
  if (!place('k', 'b', squares([5, 6, 7, 8]))) return null;
  const pawnRanks = { w: [2, 3, 4], b: [6, 7] };
  const pieceRanks = { w: [1, 2, 3, 4, 5, 6, 7], b: [4, 5, 6, 7, 8] };
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
  return `${rows.join('/')} w - - 0 1`;
}

function opponentInCheck(fen) {
  const parts = fen.split(' ');
  parts[1] = parts[1] === 'w' ? 'b' : 'w';
  try {
    return new Chess(parts.join(' ')).inCheck();
  } catch {
    return true;
  }
}

const found = [];
for (let attempt = 0; attempt < tries && found.length < wanted; attempt += 1) {
  const fen = randomPosition();
  if (!fen || opponentInCheck(fen)) continue;
  let chess;
  try {
    chess = new Chess(fen);
  } catch {
    continue;
  }
  if (chess.isGameOver() || chess.inCheck()) continue;

  const distance = mateDistance(chess, moves);
  if (distance === null || distance < moves) continue; // mate em 1 não serve
  let variations;
  try {
    variations = buildVariations(chess, distance);
  } catch {
    continue;
  }
  if (variations.length < minBranches) continue;
  // O valor da aula está em o aluno precisar de respostas diferentes.
  const answers = new Set();
  for (const variation of variations) {
    variation.moves.forEach((move, ply) => {
      if (ply > 0 && ply % 2 === 0) answers.add(`${ply}:${move.san}`);
    });
  }
  if (answers.size < minAnswers) continue;
  found.push({ fen, distance, variations, answers: answers.size });
}

if (found.length === 0) {
  console.log('Nada encontrado. Tente outro conjunto de peças ou outra seed.');
} else {
  for (const item of found) {
    console.log(`${item.fen}  (mate em ${item.distance}, ${item.variations.length} defesas, ${item.answers} respostas diferentes)`);
    for (const variation of item.variations) {
      console.log('    ' + variation.moves.map((move) => move.san).join(' '));
    }
  }
}
