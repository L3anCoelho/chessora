/**
 * Leitura do conteúdo-fonte dos e-books.
 *
 * Cada capítulo é um Markdown com front matter e três blocos especiais (cercas de código):
 *
 *   ```board            diagrama
 *   fen: <FEN>  ou  moves: 1.e4 e5 2.Nf3   (lances a partir da posição inicial; os dois podem ser combinados)
 *   caption: legenda
 *   highlights: e4 d5
 *   arrows: c4-f7 d8-h4!      (! = seta vermelha: ameaça ou erro)
 *   orientation: b
 *   ```
 *
 *   ```steps            passo a passo comentado, lance a lance
 *   moves: 1.e4 e5      (opcional: lances já jogados antes do primeiro passo)
 *   e4 :: explicação do lance
 *   diagram: legenda | highlights=e4 | arrows=c4-f7
 *   ```
 *
 *   ```exercise         exercício com gabarito automático
 *   id: ita-1
 *   fen: ... ou moves: ...
 *   prompt: Brancas jogam e ganham material.
 *   goal: mate | best | move
 *   solution: Bxf7+ Kxf7 Ng5+   (lances do aluno e respostas, alternados)
 *   answer: explicação do gabarito
 *   ```
 *
 * Os lances são escritos na notação aceita pelo chess.js (letras em inglês: N, B, R, Q, K).
 * No texto corrido, [[Nf3]] ou [[1.e4 e5]] é convertido para a notação em português no PDF.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Chess } from 'chess.js';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PT = { N: 'C', B: 'B', R: 'T', Q: 'D', K: 'R' };

/** Converte um lance SAN (letras em inglês) para a notação brasileira. */
export function sanToPt(san) {
  if (san.startsWith('O-O')) return san;
  let out = san.replace(/^[NBRQK]/, (l) => PT[l]);
  out = out.replace(/=([NBRQ])/, (_, l) => `=${PT[l]}`);
  return out;
}

/** Converte uma sequência como "1.e4 e5 2.Nf3" mantendo os números dos lances. */
export function lineToPt(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const m = tok.match(/^(\d+\.(?:\.\.)?)(.*)$/);
      if (m) return m[1].replace('...', '…') + (m[2] ? sanToPt(m[2]) : '');
      return sanToPt(tok);
    })
    .join(' ');
}

/** Remove anotações (!, ?) para entregar o lance ao chess.js. */
export const cleanSan = (san) => san.replace(/[?!]+$/, '');

/** Extrai só os lances SAN de "1.e4 e5 2.Nf3 Nc6" (ignora números). */
export function parseMoveList(text) {
  return (text || '')
    .split(/\s+/)
    .map((tok) => tok.replace(/^\d+\.(\.\.)?/, ''))
    .filter((tok) => tok && !/^\d+\.?$/.test(tok));
}

function parseFields(body) {
  const fields = {};
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return fields;
}

const splitList = (v) => (v ? v.split(/[\s,]+/).filter(Boolean) : []);

/** Monta a posição a partir de fen/moves. Lança erro se algum lance for ilegal. */
export function resolvePosition({ fen, moves }, where) {
  const chess = new Chess(fen || START_FEN);
  let last = null;
  for (const san of parseMoveList(moves)) {
    let mv;
    try {
      mv = chess.move(cleanSan(san));
    } catch {
      mv = null;
    }
    if (!mv) throw new Error(`${where}: lance ilegal "${san}" na posição ${chess.fen()}`);
    last = { from: mv.from, to: mv.to };
  }
  return { chess, fen: chess.fen(), lastMove: last };
}

function parseDiagramLine(text) {
  const [caption, ...opts] = text.split('|').map((s) => s.trim());
  const o = { caption };
  for (const opt of opts) {
    const [k, v] = opt.split('=').map((s) => s.trim());
    if (k === 'highlights') o.highlights = splitList(v);
    if (k === 'arrows') o.arrows = splitList(v);
    if (k === 'orientation') o.orientation = v;
  }
  return o;
}

function parseSteps(body, where) {
  const header = { fen: null, moves: null, orientation: null, title: null };
  const items = [];
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.includes('::')) {
      const [san, text] = line.split('::').map((s) => s.trim());
      items.push({ kind: 'move', san, text });
    } else if (line.startsWith('diagram:')) {
      items.push({ kind: 'diagram', ...parseDiagramLine(line.slice(8).trim()) });
    } else if (line.startsWith('note:')) {
      items.push({ kind: 'note', text: line.slice(5).trim() });
    } else {
      const idx = line.indexOf(':');
      if (idx < 0) throw new Error(`${where}: linha de passo sem "::" -> ${line}`);
      header[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { type: 'steps', ...header, items };
}

export function parseChapter(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error(`${file}: falta o front matter`);
  const meta = parseFields(fm[1]);
  const body = raw.slice(fm[0].length);
  const segments = [];
  const re = /```(board|steps|exercise)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let m;
  let exerciseNo = 0;
  while ((m = re.exec(body))) {
    if (m.index > lastIndex) segments.push({ type: 'md', text: body.slice(lastIndex, m.index) });
    const where = `${path.basename(file)} (bloco ${m[1]} na posição ${m.index})`;
    if (m[1] === 'board') {
      const f = parseFields(m[2]);
      segments.push({
        type: 'board',
        where,
        fen: f.fen || null,
        moves: f.moves || null,
        caption: f.caption || '',
        highlights: splitList(f.highlights),
        arrows: splitList(f.arrows),
        orientation: f.orientation || null,
      });
    } else if (m[1] === 'steps') {
      segments.push({ ...parseSteps(m[2], where), where });
    } else {
      const f = parseFields(m[2]);
      exerciseNo += 1;
      segments.push({
        type: 'exercise',
        where,
        number: exerciseNo,
        id: f.id,
        fen: f.fen || null,
        moves: f.moves || null,
        prompt: f.prompt,
        goal: f.goal || 'move',
        solution: parseMoveList(f.solution),
        answer: f.answer || '',
        route: f.route || null,
        highlights: splitList(f.highlights),
        orientation: f.orientation || null,
      });
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < body.length) segments.push({ type: 'md', text: body.slice(lastIndex) });
  return { file, meta, segments };
}

export function loadCatalog(root) {
  // EBOOK_CATALOG permite testar com um catálogo reduzido.
  const catalogPath = process.env.EBOOK_CATALOG || path.join(root, 'content/catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const chapterCache = new Map();
  const chapter = (rel) => {
    if (!chapterCache.has(rel)) chapterCache.set(rel, parseChapter(path.join(root, 'content', rel)));
    return chapterCache.get(rel);
  };
  return { catalog, chapter, allChapterFiles: () => [...new Set(Object.values(catalog.products).flatMap((p) => p.chapters || []))] };
}
