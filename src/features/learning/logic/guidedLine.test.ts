import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { compileGuidedLine, GuidedLineError, isExpectedMove } from './guidedLine';
import { describeSan, lineToPortuguese, pieceWithArticle, sanToPortuguese } from '@/features/chess/logic/notation';

describe('notação em português', () => {
  it('troca as iniciais das peças e mantém o resto', () => {
    expect(sanToPortuguese('Nf3')).toBe('Cf3');
    expect(sanToPortuguese('Qxd8+')).toBe('Dxd8+');
    expect(sanToPortuguese('Rae1')).toBe('Tae1');
    expect(sanToPortuguese('Kd2')).toBe('Rd2');
    expect(sanToPortuguese('Bb5')).toBe('Bb5');
    expect(sanToPortuguese('exd5')).toBe('exd5');
    expect(sanToPortuguese('O-O')).toBe('O-O');
    expect(sanToPortuguese('O-O-O')).toBe('O-O-O');
    expect(sanToPortuguese('e8=Q#')).toBe('e8=D#');
    expect(sanToPortuguese('Nbd2')).toBe('Cbd2');
    expect(sanToPortuguese('R1e2')).toBe('T1e2');
  });

  it('nunca deixa uma inicial inglesa de peça no texto exibido', () => {
    const chess = new Chess();
    // Varre uma partida inteira para garantir que nenhuma letra inglesa escapa.
    for (const san of ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6', 'O-O', 'Qd6', 'Nxe5', 'Qxe5']) {
      const move = chess.move(san);
      expect(sanToPortuguese(move.san)).not.toMatch(/^[KQRN]/);
    }
    expect(lineToPortuguese(['Nf3', 'Qd8'])).toEqual(['Cf3', 'Dd8']);
  });

  it('descreve lances em palavras, com o artigo certo', () => {
    expect(pieceWithArticle('Qd5')).toBe('a dama');
    expect(pieceWithArticle('Nf3')).toBe('o cavalo');
    expect(pieceWithArticle('e4')).toBe('o peão');
    expect(pieceWithArticle('O-O')).toBeNull();
    expect(describeSan('Nf3')).toBe('cavalo para f3');
    expect(describeSan('Qxf7#')).toBe('dama para f7, com captura, xeque-mate');
    expect(describeSan('O-O')).toBe('roque pequeno');
  });
});

describe('guia lance a lance', () => {
  const italiana = {
    steps: [
      { move: 'e4', reply: 'e5', explanation: 'Ocupa o centro.' },
      { move: 'Nf3', reply: 'Nc6', explanation: 'Desenvolve e ataca e5.' },
      { move: 'Bc4', reply: 'Bc5', explanation: 'O bispo mira f7.' },
    ],
  };

  it('compila a linha e devolve as posições de cada passo', () => {
    const line = compileGuidedLine(italiana);
    expect(line.playerColor).toBe('w');
    expect(line.steps).toHaveLength(3);
    expect(line.steps[0].move).toBe('e4');
    expect(line.steps[0].reply).toBe('e5');
    // A posição de cada passo é a posição final do passo anterior.
    expect(line.steps[1].fenBefore).toBe(line.steps[0].fenAfter);
    // E o FEN final bate com jogar a linha na mão.
    const chess = new Chess();
    ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'].forEach((san) => chess.move(san));
    expect(line.steps[2].fenAfter).toBe(chess.fen());
  });

  it('aceita linhas que começam de um FEN e com as pretas', () => {
    const line = compileGuidedLine({
      startFen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2',
      steps: [{ move: 'Nc6', explanation: 'Defende e5.' }],
    });
    expect(line.playerColor).toBe('b');
    expect(line.steps[0].reply).toBeNull();
  });

  it('recusa lance ilegal, posição inválida e linha vazia', () => {
    expect(() => compileGuidedLine({ steps: [{ move: 'e5', explanation: 'x' }] })).toThrow(GuidedLineError);
    expect(() => compileGuidedLine({ startFen: 'lixo', steps: [{ move: 'e4', explanation: 'x' }] })).toThrow(
      GuidedLineError,
    );
    expect(() => compileGuidedLine({ steps: [] })).toThrow(GuidedLineError);
  });

  it('recusa um passo sem resposta no meio da linha', () => {
    // Sem a resposta das pretas, o passo 2 cairia na vez do adversário.
    expect(() =>
      compileGuidedLine({
        steps: [
          { move: 'e4', explanation: 'x' },
          { move: 'Nf3', explanation: 'y' },
        ],
      }),
    ).toThrow(/não é a vez do aluno/i);
  });

  it('compara lances ignorando xeque e anotações', () => {
    expect(isExpectedMove('Qxf7#', 'Qxf7')).toBe(true);
    expect(isExpectedMove('Nd4!', 'Nd4')).toBe(true);
    expect(isExpectedMove('Nf3', 'Nc3')).toBe(false);
  });
});
