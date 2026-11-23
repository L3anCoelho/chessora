import { describe, expect, it } from 'vitest';
import { buildGuidedGame, GuidedGameError, pickReply, subtreeDone } from './guidedGame';

/** Mate em 2: 1.Tc7 (qualquer lance) 2.Dd8#. O rei preto está preso em h8. */
const FEN = '7k/1p6/2R4p/8/8/3Q4/8/3K4 w - - 0 1';

const duasDefesas = {
  startFen: FEN,
  variations: [
    { label: 'o rei foge', moves: [{ san: 'Rc7' }, { san: 'Kg8' }, { san: 'Qd8#' }] },
    { label: 'ele mexe um peão', moves: [{ san: 'Rc7' }, { san: 'b6' }, { san: 'Qd8#' }] },
  ],
};

describe('partida guiada com ramificações', () => {
  it('junta as variantes numa árvore, com um lance do aluno por posição', () => {
    const game = buildGuidedGame(duasDefesas);
    expect(game.playerColor).toBe('w');
    // O primeiro lance do aluno é único.
    expect(game.root.children).toHaveLength(1);
    expect(game.root.children[0].san).toBe('Rc7');
    // Depois dele, as duas defesas.
    const afterRc7 = game.root.children[0];
    expect(afterRc7.turn).toBe('opponent');
    expect(afterRc7.children.map((child) => child.san).sort()).toEqual(['Kg8', 'b6']);
    // Cada defesa leva a uma folha com mate.
    expect(game.leaves).toHaveLength(2);
    for (const leaf of game.leaves) expect(leaf.ending?.outcome).toBe('mate');
    expect(game.leaves.map((leaf) => leaf.ending?.label)).toEqual(['o rei foge', 'ele mexe um peão']);
  });

  it('recusa duas respostas diferentes do aluno na mesma posição', () => {
    expect(() =>
      buildGuidedGame({
        startFen: FEN,
        variations: [
          { moves: [{ san: 'Rc7' }, { san: 'Kg8' }, { san: 'Qd8#' }] },
          // Outro primeiro lance: é aqui que a árvore deixa de fazer sentido.
          { moves: [{ san: 'Qd8+' }, { san: 'Kh7' }, { san: 'Rc7' }], outcome: 'advantage' },
        ],
      }),
    ).toThrow(/mais de um lance do aluno/i);
  });

  it('recusa variante que não termina em mate', () => {
    expect(() =>
      buildGuidedGame({
        startFen: FEN,
        variations: [{ moves: [{ san: 'Rc7' }, { san: 'Kg8' }, { san: 'Qd4' }] }],
      }),
    ).toThrow(/xeque-mate/i);
  });

  it('aceita final sem mate quando a variante diz que é só vantagem', () => {
    const game = buildGuidedGame({
      startFen: FEN,
      variations: [
        { moves: [{ san: 'Rc7' }, { san: 'Kg8' }, { san: 'Qd8#' }] },
        { moves: [{ san: 'Rc7' }, { san: 'b6' }, { san: 'Ke1' }], outcome: 'advantage' },
      ],
    });
    expect(game.leaves.map((leaf) => leaf.ending?.outcome)).toEqual(['mate', 'advantage']);
  });

  it('recusa lance ilegal e posição inválida', () => {
    expect(() => buildGuidedGame({ startFen: FEN, variations: [{ moves: [{ san: 'Rc8' }] }] })).toThrow(
      GuidedGameError,
    );
    expect(() => buildGuidedGame({ startFen: 'lixo', variations: [{ moves: [{ san: 'Rc7' }] }] })).toThrow(
      GuidedGameError,
    );
    expect(() => buildGuidedGame({ startFen: FEN, variations: [] })).toThrow(GuidedGameError);
  });

  it('com exhaustive, cobra todas as defesas legais', () => {
    expect(() => buildGuidedGame({ ...duasDefesas, exhaustive: true })).toThrow(/falta a resposta para/i);
  });

  it('o adversário prefere as defesas que o aluno ainda não venceu', () => {
    const game = buildGuidedGame(duasDefesas);
    const afterRc7 = game.root.children[0];
    const [primeira, segunda] = afterRc7.children;

    // Nada vencido: qualquer uma pode sair.
    const nenhuma = new Set<string>();
    expect(afterRc7.children).toContain(pickReply(afterRc7, nenhuma, () => 0));
    expect(afterRc7.children).toContain(pickReply(afterRc7, nenhuma, () => 0.99));

    // Com a primeira já vencida, ele escolhe a outra, mesmo com o sorteio no extremo.
    const umaVencida = new Set([leafUnder(primeira)]);
    expect(pickReply(afterRc7, umaVencida, () => 0)).toBe(segunda);
    expect(pickReply(afterRc7, umaVencida, () => 0.99)).toBe(segunda);

    // Com tudo vencido, volta a sortear entre todas.
    const todas = new Set(game.leaves.map((leaf) => leaf.path));
    expect(afterRc7.children).toContain(pickReply(afterRc7, todas, () => 0.5));
    expect(subtreeDone(game.root, todas)).toBe(true);
    expect(subtreeDone(game.root, nenhuma)).toBe(false);
  });
});

/** Caminho da única folha abaixo de um nó. */
function leafUnder(node: { path: string; ending: unknown; children: { path: string; ending: unknown; children: unknown[] }[] }): string {
  if (node.ending) return node.path;
  return leafUnder(node.children[0] as never);
}
