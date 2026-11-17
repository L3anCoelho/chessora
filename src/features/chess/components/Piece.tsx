import type { ReactNode } from 'react';
import type { PieceSymbol } from 'chess.js';
import type { PlayerColor } from '@/types/domain';

/** Desenho próprio das peças (SVG), sem dependência de fontes ou imagens externas. */

const BASE = <rect x="22" y="78" width="56" height="10" rx="3" />;

const SHAPES: Record<PieceSymbol, { body: ReactNode; detail?: ReactNode }> = {
  p: {
    body: (
      <>
        <circle cx="50" cy="30" r="11" />
        <rect x="38" y="42" width="24" height="5" rx="2" />
        <path d="M40 47 C40 60 34 68 30 78 L70 78 C66 68 60 60 60 47 Z" />
        {BASE}
      </>
    ),
  },
  r: {
    body: (
      <>
        <path d="M28 16 h10 v7 h6 v-7 h12 v7 h6 v-7 h10 v18 h-44 Z" />
        <rect x="32" y="34" width="36" height="5" rx="1" />
        <path d="M35 39 L33 72 L67 72 L65 39 Z" />
        <rect x="28" y="72" width="44" height="6" rx="2" />
        {BASE}
      </>
    ),
  },
  n: {
    body: (
      <>
        <path d="M68 78 L32 78 C32 66 40 58 48 51 C42 52 36 56 30 58 C25 59 20 55 22 49 C24 43 33 36 39 30 C41 24 46 18 52 16 L55 9 L59 16 C69 19 75 29 75 43 C75 57 69 65 68 78 Z" />
        {BASE}
      </>
    ),
    detail: (
      <>
        <circle cx="47" cy="28" r="2.6" className="piece-eye" />
        <path d="M60 22 C67 31 69 43 66 56" fill="none" />
      </>
    ),
  },
  b: {
    body: (
      <>
        <circle cx="50" cy="15" r="5" />
        <path d="M50 21 C40 30 35 38 37 48 C38 54 44 57 50 57 C56 57 62 54 63 48 C65 38 60 30 50 21 Z" />
        <rect x="38" y="57" width="24" height="5" rx="2" />
        <path d="M41 62 C41 68 36 72 32 78 L68 78 C64 72 59 68 59 62 Z" />
        {BASE}
      </>
    ),
    detail: <path d="M55 31 L46 43" fill="none" />,
  },
  q: {
    body: (
      <>
        <circle cx="22" cy="26" r="4.5" />
        <circle cx="36" cy="18" r="4.5" />
        <circle cx="50" cy="15" r="4.5" />
        <circle cx="64" cy="18" r="4.5" />
        <circle cx="78" cy="26" r="4.5" />
        <path d="M22 30 L34 50 L36 22 L46 46 L50 19 L54 46 L64 22 L66 50 L78 30 L70 60 L30 60 Z" />
        <rect x="30" y="60" width="40" height="6" rx="2" />
        <path d="M32 66 L28 78 L72 78 L68 66 Z" />
        {BASE}
      </>
    ),
  },
  k: {
    body: (
      <>
        <path d="M47 5 h6 v7 h7 v6 h-7 v9 h-6 v-9 h-7 v-6 h7 Z" />
        <path d="M50 31 C44 24 27 26 30 39 L36 58 L64 58 L70 39 C73 26 56 24 50 31 Z" />
        <rect x="32" y="58" width="36" height="6" rx="2" />
        <path d="M34 64 L28 78 L72 78 L66 64 Z" />
        {BASE}
      </>
    ),
  },
};

export const PIECE_NAME: Record<PieceSymbol, string> = {
  p: 'peão',
  n: 'cavalo',
  b: 'bispo',
  r: 'torre',
  q: 'dama',
  k: 'rei',
};

export function pieceLabel(type: PieceSymbol, color: PlayerColor): string {
  const female = type === 'q' || type === 'r';
  const colorWord = color === 'w' ? (female ? 'branca' : 'branco') : female ? 'preta' : 'preto';
  return `${PIECE_NAME[type]} ${colorWord}`;
}

export function Piece({ type, color, className }: { type: PieceSymbol; color: PlayerColor; className?: string }) {
  const shape = SHAPES[type];
  return (
    <svg
      viewBox="0 0 100 100"
      className={`piece piece-${color}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <g className="piece-body">{shape.body}</g>
      {shape.detail && <g className="piece-detail">{shape.detail}</g>}
    </svg>
  );
}
