import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import {
  getGameStatus,
  isPromotionMove,
  legalTargets,
  normalizeSan,
  parsePlacement,
  parseUciMove,
  summarizeCaptures,
  toMovePairs,
} from './rules';

describe('regras via chess.js', () => {
  it('rejeita lance ilegal e mantém a posição', () => {
    const chess = new Chess();
    const before = chess.fen();
    expect(() => chess.move({ from: 'e2', to: 'e5' })).toThrow();
    expect(chess.fen()).toBe(before);
  });

  it('não deixa mover peça fora da vez', () => {
    const chess = new Chess();
    expect(() => chess.move({ from: 'e7', to: 'e5' })).toThrow();
  });

  it('detecta xeque-mate (mate do pastor)', () => {
    const chess = new Chess();
    ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#'].forEach((move) => chess.move(move));
    expect(getGameStatus(chess)).toMatchObject({ isOver: true, result: 'white', endReason: 'checkmate' });
  });

  it('detecta afogamento', () => {
    const status = getGameStatus(new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'));
    expect(status).toMatchObject({ isOver: true, result: 'draw', endReason: 'stalemate' });
  });

  it('detecta material insuficiente', () => {
    const status = getGameStatus(new Chess('8/8/4k3/8/8/3K4/8/8 w - - 0 1'));
    expect(status.endReason).toBe('insufficient-material');
  });

  it('detecta repetição tripla', () => {
    const chess = new Chess();
    for (let i = 0; i < 2; i += 1) ['Nf3', 'Nf6', 'Ng1', 'Ng8'].forEach((move) => chess.move(move));
    expect(getGameStatus(chess).endReason).toBe('threefold-repetition');
  });

  it('detecta a regra dos 50 lances', () => {
    const status = getGameStatus(new Chess('4k3/8/8/8/8/8/8/R3K3 w - - 100 80'));
    expect(status.endReason).toBe('fifty-move-rule');
  });

  it('permite roque só com as condições cumpridas', () => {
    const chess = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    expect(legalTargets(chess, 'e1')).toEqual(expect.arrayContaining(['g1', 'c1']));
    const blocked = new Chess('r3k2r/8/8/8/8/8/8/R3KB1R w KQkq - 0 1');
    expect(legalTargets(blocked, 'e1')).not.toContain('g1');
    const throughCheck = new Chess('r3k2r/8/8/8/8/8/5r2/R3K2R w KQkq - 0 1');
    expect(legalTargets(throughCheck, 'e1')).not.toContain('g1');
  });

  it('aplica en passant e remove o peão capturado', () => {
    const chess = new Chess('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');
    const move = chess.move({ from: 'e5', to: 'd6' });
    expect(move.isEnPassant()).toBe(true);
    expect(chess.get('d5')).toBeUndefined();
  });

  it('identifica e executa promoção', () => {
    const chess = new Chess('8/4P1k1/8/8/8/8/8/4K3 w - - 0 1');
    expect(isPromotionMove(chess, 'e7', 'e8')).toBe(true);
    chess.move({ from: 'e7', to: 'e8', promotion: 'n' });
    expect(chess.get('e8')).toEqual({ type: 'n', color: 'w' });
  });

  it('desfaz lances', () => {
    const chess = new Chess();
    chess.move('e4');
    chess.move('e5');
    chess.undo();
    expect(chess.history()).toEqual(['e4']);
  });
});

describe('utilitários', () => {
  it('resume capturas e saldo de material, incluindo promoção', () => {
    const chess = new Chess('4k3/1P6/8/8/8/8/1r6/4K3 w - - 0 1');
    chess.move('b8=Q+');
    chess.move('Rxb8');
    const summary = summarizeCaptures(chess.history({ verbose: true }));
    expect(summary.byBlack).toEqual(['q']);
    // +8 pela promoção, -9 pela dama perdida
    expect(summary.materialBalance).toBe(-1);
  });

  it('agrupa lances em pares, inclusive começando pelas pretas', () => {
    expect(toMovePairs(['e4', 'e5', 'Nf3'])).toEqual([
      { number: 1, white: { san: 'e4', ply: 0 }, black: { san: 'e5', ply: 1 } },
      { number: 2, white: { san: 'Nf3', ply: 2 }, black: undefined },
    ]);
    expect(toMovePairs(['Kxe7'], 'b')[0]).toEqual({ number: 1, black: { san: 'Kxe7', ply: 0 } });
  });

  it('lê a posição do FEN', () => {
    const placement = parsePlacement('4k3/8/8/8/8/8/8/4K2R w K - 0 1');
    expect(placement.e8).toEqual({ type: 'k', color: 'b' });
    expect(placement.h1).toEqual({ type: 'r', color: 'w' });
    expect(Object.keys(placement)).toHaveLength(3);
  });

  it('converte lances UCI e normaliza SAN', () => {
    expect(parseUciMove('e7e8q')).toEqual({ from: 'e7', to: 'e8', promotion: 'q' });
    expect(parseUciMove('(none)')).toBeNull();
    expect(normalizeSan('Qxf7#')).toBe('Qxf7');
  });
});
