/**
 * Lógica do guia lance a lance, sem React, para poder ser testada direto no Node.
 *
 * Cada passo tem o lance do aluno e, opcionalmente, a resposta do adversário.
 * A compilação roda a linha inteira no chess.js: se algum lance for ilegal, o
 * erro aparece no teste de conteúdo, e não na tela do aluno.
 */
import { Chess } from 'chess.js';
import type { GuidedLineBlock, GuidedStep } from '@/types/domain';
import { normalizeSan, START_FEN } from '@/features/chess/logic/rules';

export interface CompiledStep {
  index: number;
  /** SAN canônico do lance do aluno (como o chess.js escreve). */
  move: string;
  /** SAN canônico da resposta do adversário, ou null. */
  reply: string | null;
  explanation: string;
  /** Posição em que o aluno joga este passo. */
  fenBefore: string;
  /** Posição depois do lance do aluno. */
  fenAfterMove: string;
  /** Posição depois da resposta (igual a fenAfterMove quando não há resposta). */
  fenAfter: string;
}

export interface CompiledLine {
  startFen: string;
  steps: CompiledStep[];
  /** Cor que o aluno joga, deduzida da posição inicial. */
  playerColor: 'w' | 'b';
}

export class GuidedLineError extends Error {}

/**
 * Valida a linha inteira e devolve cada passo com as posições já calculadas.
 * @throws GuidedLineError quando a posição inicial ou algum lance é inválido.
 */
export function compileGuidedLine(block: Pick<GuidedLineBlock, 'startFen' | 'steps'>): CompiledLine {
  const startFen = block.startFen ?? START_FEN;
  let chess: Chess;
  try {
    chess = new Chess(startFen);
  } catch {
    throw new GuidedLineError(`Posição inicial inválida: ${startFen}`);
  }
  const playerColor = chess.turn();
  if (block.steps.length === 0) throw new GuidedLineError('A linha precisa de pelo menos um passo.');

  const steps: CompiledStep[] = block.steps.map((step: GuidedStep, index) => {
    const fenBefore = chess.fen();
    if (chess.turn() !== playerColor) {
      throw new GuidedLineError(`Passo ${index + 1}: não é a vez do aluno. Falta uma resposta no passo anterior.`);
    }
    const move = applyOrThrow(chess, step.move, index + 1, 'lance');
    const fenAfterMove = chess.fen();
    let reply: string | null = null;
    if (step.reply) {
      reply = applyOrThrow(chess, step.reply, index + 1, 'resposta');
    }
    return {
      index,
      move,
      reply,
      explanation: step.explanation,
      fenBefore,
      fenAfterMove,
      fenAfter: chess.fen(),
    };
  });

  return { startFen, steps, playerColor };
}

function applyOrThrow(chess: Chess, san: string, stepNumber: number, kind: string): string {
  try {
    const move = chess.move(san);
    return move.san;
  } catch {
    throw new GuidedLineError(`Passo ${stepNumber}: ${kind} ilegal "${san}" na posição ${chess.fen()}`);
  }
}

/** O lance jogado é o esperado? Ignora marcadores de xeque e anotações. */
export function isExpectedMove(expected: string, played: string): boolean {
  return normalizeSan(expected) === normalizeSan(played);
}
