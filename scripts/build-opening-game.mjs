/**
 * Monta uma partida completa a partir de uma abertura, até o mate.
 *
 * O lado do aluno joga sempre o melhor lance (Stockfish). O adversário comete
 * erros plausíveis — lances que o motor considerou, mas que pioram a posição
 * dentro de uma faixa — até surgir mate forçado, que é então confirmado por
 * busca exaustiva no chess.js.
 *
 *   node scripts/build-opening-game.mjs "e4 e6 d4 d5" --player w --mate 3
 *
 * Nada aqui é escrito de memória: a linha sai do motor e o mate é provado.
 */
import { Chess } from 'chess.js';
import { analyse, scoreOf, stopEngine } from './lib/engine.mjs';
import { mateDistance } from './lib/mate.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const abertura = args.find((arg) => !arg.startsWith('--') && /[a-h]/.test(arg)) ?? '';
const playerColor = opt('player', 'w');
const maxMate = Number(opt('mate', 3));
const maxPlies = Number(opt('plies', 26));
const depth = Number(opt('depth', 14));
/** Faixa de piora aceitável para o "erro" do adversário, em centésimos de peão. */
const minDrop = Number(opt('min-drop', 120));
const maxDrop = Number(opt('max-drop', 700));

const chess = new Chess();
for (const san of abertura.split(/\s+/).filter(Boolean)) chess.move(san);

const jogados = [];
let encontrado = null;

for (let ply = 0; ply < maxPlies && !chess.isGameOver(); ply += 1) {
  // Já existe mate forçado para o aluno?
  if (chess.turn() === playerColor) {
    const distancia = mateDistance(chess, maxMate);
    if (distancia !== null) {
      encontrado = { distancia, fen: chess.fen() };
      break;
    }
  }

  const ranked = await analyse(chess.fen(), { depth, multipv: 12 });
  if (ranked.length === 0) break;

  if (chess.turn() === playerColor) {
    chess.move(ranked[0].san);
    jogados.push({ san: ranked[0].san, quem: 'aluno' });
    continue;
  }

  // Erro do adversário: o pior lance dentro da faixa, para não ser absurdo.
  const melhor = scoreOf(ranked[0]);
  const candidatos = ranked
    .map((entry) => ({ ...entry, drop: melhor - scoreOf(entry) }))
    .filter((entry) => entry.drop >= minDrop && entry.drop <= maxDrop);
  const escolhido = candidatos.length > 0 ? candidatos[candidatos.length - 1] : ranked[ranked.length - 1];
  chess.move(escolhido.san);
  jogados.push({ san: escolhido.san, quem: 'adversário', drop: escolhido.drop });
}

console.log(`Abertura: ${abertura}`);
console.log('Continuação:');
for (const jogada of jogados) {
  console.log(`  ${jogada.san}${jogada.quem === 'adversário' ? `   (erro de ${jogada.drop}cp)` : ''}`);
}
if (encontrado) {
  console.log(`\nMate forçado em ${encontrado.distancia} a partir de:`);
  console.log(`  ${encontrado.fen}`);
  console.log(`  linha completa: ${abertura} ${jogados.map((j) => j.san).join(' ')}`);
} else {
  console.log(`\nNão apareceu mate forçado em até ${maxMate} dentro de ${maxPlies} meios-lances.`);
}
await stopEngine();
