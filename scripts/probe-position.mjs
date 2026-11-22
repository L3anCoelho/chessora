/**
 * Ajudante de autoria: mostra a geometria de uma posição e, opcionalmente, o
 * que o Stockfish acha dela. Serve para montar exercícios sem errar linhas.
 *
 *   node scripts/probe-position.mjs "<fen>" [--engine] [--depth 18]
 *
 * Imprime, para quem está na vez: peças inimigas sem defesa, e os lances que
 * atacam duas ou mais peças inimigas (candidatos a ataque duplo).
 */
import { Chess } from 'chess.js';
import { analyse, scoreOf, stopEngine } from './lib/engine.mjs';

const [fen, ...flags] = process.argv.slice(2);
if (!fen) {
  console.error('Informe um FEN.');
  process.exit(1);
}
const depth = Number(flags[flags.indexOf('--depth') + 1]) || 18;

const chess = new Chess(fen);
const me = chess.turn();
const them = me === 'w' ? 'b' : 'w';

/** Todas as casas ocupadas por uma cor. */
function squaresOf(color) {
  const list = [];
  for (const row of chess.board()) {
    for (const cell of row) if (cell && cell.color === color) list.push(cell);
  }
  return list;
}

/** chess.js sabe dizer se uma casa está atacada por uma cor. */
function isAttacked(square, byColor) {
  return chess.isAttacked(square, byColor);
}

const enemies = squaresOf(them).filter((cell) => cell.type !== 'k');
const loose = enemies.filter((cell) => !isAttacked(cell.square, them));
console.log(`Vez das ${me === 'w' ? 'brancas' : 'pretas'}.`);
console.log(`Peças inimigas sem defesa: ${loose.map((c) => c.type + c.square).join(', ') || '(nenhuma)'}`);

// Para cada lance, quantas peças inimigas ele passa a atacar (e quantas estão soltas).
const report = [];
for (const move of chess.moves({ verbose: true })) {
  chess.move(move);
  const after = chess; // agora é a vez do adversário
  const targets = [];
  for (const cell of squaresOf(them)) {
    if (cell.type === 'k') continue;
    // A peça que acabou de mover ataca esta casa?
    if (after.isAttacked(cell.square, me)) {
      const defended = after.isAttacked(cell.square, them);
      targets.push(`${cell.type}${cell.square}${defended ? '' : '!'}`);
    }
  }
  const check = after.inCheck();
  chess.undo();
  const looseTargets = targets.filter((t) => t.endsWith('!'));
  if (looseTargets.length >= 2 || (check && looseTargets.length >= 1)) {
    report.push({ san: move.san, check, targets });
  }
}
report.sort((a, b) => b.targets.length - a.targets.length);
console.log('Lances com ameaça dupla (! = peça sem defesa):');
for (const entry of report.slice(0, 12)) {
  console.log(`  ${entry.san.padEnd(7)} ${entry.check ? '(xeque) ' : ''}${entry.targets.join(' ')}`);
}

if (flags.includes('--engine')) {
  const ranked = await analyse(fen, { depth, multipv: 6 });
  const best = scoreOf(ranked[0]);
  console.log('Stockfish:');
  for (const entry of ranked) {
    const label = entry.mate !== null ? `mate em ${entry.mate}` : `${entry.cp}cp`;
    console.log(`  ${entry.san.padEnd(7)} ${label}${entry === ranked[0] ? '  <- melhor' : ''}`);
  }
  const next = ranked.find((entry) => best - scoreOf(entry) > 30);
  console.log(`Diferença para o próximo lance: ${next ? best - scoreOf(next) : '—'}cp`);
  await stopEngine();
}
