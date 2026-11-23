/**
 * Partida guiada com ramificações, sem React, para poder ser testada no Node.
 *
 * A aula é escrita como uma lista de variantes — cada uma é a partida inteira
 * por um caminho. Aqui elas viram uma árvore: nos lances do aluno há sempre um
 * único filho (só existe um lance certo), e nos lances do adversário os filhos
 * são as defesas que ele pode tentar.
 */
import { Chess } from 'chess.js';
import type { GuidedGameBlock, GuidedGameVariation } from '@/types/domain';
import { normalizeSan, START_FEN } from '@/features/chess/logic/rules';

export class GuidedGameError extends Error {}

export interface GuidedNode {
  /** Caminho até aqui, em SAN canônico, separado por espaço. Serve de id. */
  path: string;
  /** Quantos lances foram jogados até aqui (a raiz é 0). */
  depth: number;
  /** Posição neste ponto. */
  fen: string;
  /** De quem é a vez: 'player' (aluno) ou 'opponent'. */
  turn: 'player' | 'opponent';
  /** Lance que levou até aqui, já em SAN canônico. */
  san: string | null;
  /** Comentário do lance que levou até aqui. */
  note?: string;
  children: GuidedNode[];
  /** Preenchido só nas folhas. */
  ending: { outcome: 'mate' | 'advantage' | 'equal'; text?: string; label?: string } | null;
}

export interface GuidedGame {
  startFen: string;
  playerColor: 'w' | 'b';
  root: GuidedNode;
  /** Todas as folhas, na ordem em que as variantes foram escritas. */
  leaves: GuidedNode[];
}

/**
 * Monta a árvore e valida tudo.
 * @throws GuidedGameError com a descrição do problema
 */
export function buildGuidedGame(
  block: Pick<GuidedGameBlock, 'startFen' | 'variations' | 'exhaustive' | 'exhaustiveFrom'>,
): GuidedGame {
  const startFen = block.startFen ?? START_FEN;
  let probe: Chess;
  try {
    probe = new Chess(startFen);
  } catch {
    throw new GuidedGameError(`Posição inicial inválida: ${startFen}`);
  }
  const playerColor = probe.turn();
  if (!block.variations?.length) throw new GuidedGameError('A partida guiada precisa de pelo menos uma variante.');

  const root: GuidedNode = {
    path: '',
    depth: 0,
    fen: startFen,
    turn: 'player',
    san: null,
    children: [],
    ending: null,
  };

  block.variations.forEach((variation, index) => insertVariation(root, variation, index, startFen, playerColor));

  const leaves: GuidedNode[] = [];
  collectLeaves(root, leaves);
  checkShape(root, leaves.length);
  const exhaustiveFrom = block.exhaustive ? 0 : block.exhaustiveFrom;
  if (exhaustiveFrom !== undefined) checkExhaustive(root, exhaustiveFrom);

  return { startFen, playerColor, root, leaves };
}

function insertVariation(
  root: GuidedNode,
  variation: GuidedGameVariation,
  index: number,
  startFen: string,
  playerColor: 'w' | 'b',
) {
  const label = variation.label ?? `variante ${index + 1}`;
  const chess = new Chess(startFen);
  let node = root;

  variation.moves.forEach((entry, ply) => {
    const expectedTurn = ply % 2 === 0 ? 'player' : 'opponent';
    if (node.turn !== expectedTurn) {
      throw new GuidedGameError(`${label}: o lance ${ply + 1} caiu na vez errada.`);
    }
    if (node.ending) {
      throw new GuidedGameError(`${label}: a variante continua depois de um fim de partida.`);
    }
    let san: string;
    try {
      san = chess.move(entry.san).san;
    } catch {
      throw new GuidedGameError(`${label}: lance ${ply + 1} "${entry.san}" é ilegal em ${chess.fen()}`);
    }

    const key = normalizeSan(san);
    let child = node.children.find((candidate) => normalizeSan(candidate.san ?? '') === key);
    if (!child) {
      child = {
        path: node.path ? `${node.path} ${san}` : san,
        depth: node.depth + 1,
        fen: chess.fen(),
        turn: expectedTurn === 'player' ? 'opponent' : 'player',
        san,
        note: entry.note,
        children: [],
        ending: null,
      };
      node.children.push(child);
    } else if (entry.note && !child.note) {
      child.note = entry.note;
    }
    node = child;
  });

  if (variation.moves.length === 0) throw new GuidedGameError(`${label}: variante sem lances.`);
  if (node.turn !== 'opponent') {
    throw new GuidedGameError(`${label}: a variante precisa terminar num lance do aluno.`);
  }

  const outcome = variation.outcome ?? 'mate';
  if (outcome === 'mate' && !chess.isCheckmate()) {
    throw new GuidedGameError(`${label}: a variante deveria terminar em xeque-mate, mas não termina.`);
  }
  if (node.children.length > 0) {
    throw new GuidedGameError(`${label}: esta variante termina onde outra continua.`);
  }
  if (node.ending && node.ending.outcome !== outcome) {
    throw new GuidedGameError(`${label}: duas variantes terminam na mesma posição com finais diferentes.`);
  }
  node.ending = { outcome, text: variation.ending, label: variation.label };
  void playerColor;
}

function collectLeaves(node: GuidedNode, out: GuidedNode[]) {
  if (node.ending) {
    out.push(node);
    return;
  }
  for (const child of node.children) collectLeaves(child, out);
}

/** O aluno só pode ter um lance certo em cada posição. */
function checkShape(node: GuidedNode, leafCount: number) {
  if (leafCount === 0) throw new GuidedGameError('Nenhuma variante chegou ao fim.');
  walk(node, (current) => {
    if (current.ending) return;
    if (current.children.length === 0) {
      throw new GuidedGameError(`A linha "${current.path || 'inicial'}" não termina em lugar nenhum.`);
    }
    if (current.turn === 'player' && current.children.length > 1) {
      const options = current.children.map((child) => child.san).join(', ');
      throw new GuidedGameError(
        `Depois de "${current.path || 'o início'}" há mais de um lance do aluno: ${options}. Só pode haver um.`,
      );
    }
  });
}

/** Toda resposta legal do adversário precisa estar prevista, a partir de um lance. */
function checkExhaustive(root: GuidedNode, fromPly: number) {
  walk(root, (node) => {
    if (node.turn !== 'opponent' || node.ending) return;
    if (node.depth < fromPly) return;
    const chess = new Chess(node.fen);
    const legal = chess.moves().map(normalizeSan);
    const covered = new Set(node.children.map((child) => normalizeSan(child.san ?? '')));
    const missing = legal.filter((san) => !covered.has(san));
    if (missing.length > 0) {
      throw new GuidedGameError(
        `Falta a resposta para ${missing.join(', ')} depois de "${node.path || 'o início'}".`,
      );
    }
  });
}

function walk(node: GuidedNode, visit: (node: GuidedNode) => void) {
  visit(node);
  for (const child of node.children) walk(child, visit);
}

/** O aluno já venceu todas as folhas abaixo deste nó? */
export function subtreeDone(node: GuidedNode, visited: ReadonlySet<string>): boolean {
  if (node.ending) return visited.has(node.path);
  return node.children.every((child) => subtreeDone(child, visited));
}

/**
 * Escolhe a resposta do adversário, dando preferência às defesas que o aluno
 * ainda não venceu. Entre as candidatas, sorteia.
 */
export function pickReply(node: GuidedNode, visited: ReadonlySet<string>, random: () => number = Math.random): GuidedNode {
  if (node.children.length === 0) throw new GuidedGameError('Não há resposta prevista para esta posição.');
  const pending = node.children.filter((child) => !subtreeDone(child, visited));
  const pool = pending.length > 0 ? pending : node.children;
  return pool[Math.floor(random() * pool.length) % pool.length];
}

/** O lance jogado é o esperado? */
export function isExpectedMove(expected: string, played: string): boolean {
  return normalizeSan(expected) === normalizeSan(played);
}
