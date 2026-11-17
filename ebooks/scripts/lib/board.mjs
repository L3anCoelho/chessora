/** Desenha um diagrama de tabuleiro em SVG a partir de um FEN, com as peças do site. */
import { Chess } from 'chess.js';

const FILES = 'abcdefgh';
const S = 40; // lado de uma casa (unidades do viewBox)
const M = 16; // margem para as coordenadas

const COLORS = {
  light: '#d5dbe1',
  dark: '#7388a0',
  highlight: 'rgba(210, 166, 90, 0.72)',
  last: 'rgba(108, 155, 210, 0.55)',
  arrow: 'rgba(47, 125, 84, 0.82)',
  arrowAlt: 'rgba(196, 72, 62, 0.82)',
  frame: '#24272c',
  coord: '#4b5360',
};

function squareXY(square, orientation) {
  const f = FILES.indexOf(square[0]);
  const r = Number(square[1]) - 1;
  const col = orientation === 'w' ? f : 7 - f;
  const row = orientation === 'w' ? 7 - r : r;
  return { x: M + col * S, y: row * S };
}

/**
 * @param {object} o
 * @param {string} o.fen
 * @param {'w'|'b'} [o.orientation]
 * @param {string[]} [o.highlights]
 * @param {string[]} [o.arrows] formato "e2-e4" ou "e2-e4!" (seta vermelha: ameaça/erro)
 * @param {{from:string,to:string}|null} [o.lastMove]
 * @param {Record<string,string>} pieces markup das peças (loadPieces)
 */
export function renderBoard({ fen, orientation = 'w', highlights = [], arrows = [], lastMove = null }, pieces) {
  const chess = new Chess(fen);
  const parts = [];
  const size = M + 8 * S;
  const height = 8 * S + M;

  parts.push(`<rect x="${M - 2}" y="-2" width="${8 * S + 4}" height="${8 * S + 4}" fill="${COLORS.frame}" rx="2"/>`);
  for (let rank = 1; rank <= 8; rank += 1) {
    for (let f = 0; f < 8; f += 1) {
      const sq = FILES[f] + rank;
      const { x, y } = squareXY(sq, orientation);
      const light = (f + rank) % 2 === 0;
      parts.push(`<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${light ? COLORS.light : COLORS.dark}"/>`);
      if (lastMove && (lastMove.from === sq || lastMove.to === sq)) {
        parts.push(`<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${COLORS.last}"/>`);
      }
      if (highlights.includes(sq)) {
        parts.push(`<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${COLORS.highlight}"/>`);
      }
    }
  }

  // coordenadas fora do tabuleiro
  for (let i = 0; i < 8; i += 1) {
    const file = orientation === 'w' ? FILES[i] : FILES[7 - i];
    const rank = orientation === 'w' ? 8 - i : i + 1;
    parts.push(`<text x="${M + i * S + S / 2}" y="${8 * S + 12}" class="bc">${file}</text>`);
    parts.push(`<text x="${M / 2 - 1}" y="${i * S + S / 2 + 3.5}" class="bc">${rank}</text>`);
  }

  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      const { x, y } = squareXY(cell.square, orientation);
      const markup = pieces[cell.color + cell.type]
        .replace('<svg ', `<svg x="${x + S * 0.06}" y="${y + S * 0.06}" width="${S * 0.88}" height="${S * 0.88}" `);
      parts.push(markup);
    }
  }

  arrows.forEach((spec, i) => {
    const alt = spec.endsWith('!');
    const [from, to] = spec.replace('!', '').split('-');
    const a = squareXY(from, orientation);
    const b = squareXY(to, orientation);
    const x1 = a.x + S / 2;
    const y1 = a.y + S / 2;
    const x2 = b.x + S / 2;
    const y2 = b.y + S / 2;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const ex = x2 - ux * 12;
    const ey = y2 - uy * 12;
    const color = alt ? COLORS.arrowAlt : COLORS.arrow;
    const px = -uy * 7.5;
    const py = ux * 7.5;
    parts.push(
      `<line x1="${x1 + ux * 6}" y1="${y1 + uy * 6}" x2="${ex}" y2="${ey}" stroke="${color}" stroke-width="6.5" stroke-linecap="round"/>`,
      `<polygon points="${x2 - ux * 2},${y2 - uy * 2} ${ex + px},${ey + py} ${ex - px},${ey - py}" fill="${color}" data-i="${i}"/>`,
    );
  });

  return `<svg class="board" viewBox="0 -2 ${size + 2} ${height + 4}" xmlns="http://www.w3.org/2000/svg" role="img">${parts.join('')}</svg>`;
}
