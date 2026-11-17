/**
 * Verificação obrigatória do conteúdo dos e-books.
 *
 *   node scripts/verify.mjs            (tudo)
 *   node scripts/verify.mjs aberturas  (só os capítulos de um produto)
 *
 * Falha (código 1) se houver:
 *  - FEN inválido ou lance ilegal em qualquer diagrama, passo a passo ou exercício;
 *  - exercício de mate cuja solução não termina em mate, ou que o Stockfish não confirma como mate em N;
 *  - exercício de "melhor lance" em que o Stockfish prefere outro lance;
 *  - capítulo sem as seções obrigatórias, id repetido ou rota que não existe no site.
 * Gera ebooks/verificacao.md com os avisos para revisão humana
 * (ex.: lances do passo a passo que o motor considera erros, soluções alternativas).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';
import { loadCatalog, resolvePosition, cleanSan, parseMoveList } from './lib/content.mjs';
import { Engine, scoreValue, formatScore } from './lib/engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = path.resolve(ROOT, '..');
const CACHE_FILE = path.join(ROOT, '.cache/engine.json');
const STEP_DEPTH = 14;
const EX_DEPTH = 20;

const { catalog, chapter } = loadCatalog(ROOT);
const errors = [];
const warnings = [];
const stats = { chapters: 0, boards: 0, stepMoves: 0, exercises: 0, engineCalls: 0 };

/* ---------- rotas reais do site ---------- */
const courseSrc = fs.readFileSync(path.join(PROJECT, 'src/data/course.ts'), 'utf8');
const routes = new Set(['/aprender', '/desafios', '/jogar']);
for (const m of courseSrc.matchAll(/slug: '([^']+)',\s*moduleId: '([^']+)'/g)) routes.add(`/aprender/${m[2]}/${m[1]}`);
for (const m of courseSrc.matchAll(/id: '([^']+)',\s*slug: '\1',\s*order: \d/g)) routes.add(`/aprender/${m[1]}`);
for (const mod of ['fundamentos', 'taticas', 'estrategia', 'aberturas', 'finais']) routes.add(`/aprender/${mod}`);

/* ---------- cache do motor ---------- */
fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};
let engine = new Engine();
await engine.init();
async function analyse(fen, opts) {
  const key = JSON.stringify([fen, opts]);
  if (!cache[key]) {
    stats.engineCalls += 1;
    try {
      cache[key] = await engine.analyse(fen, opts);
    } catch (err) {
      // Reinicia o motor para as próximas posições e registra a falha como erro.
      engine = new Engine();
      await engine.init();
      throw new Error(`${err.message} ao analisar ${fen}`);
    }
  }
  return cache[key];
}
const uci = (mv) => mv.from + mv.to + (mv.promotion || '');

/* ---------- checagens ---------- */
const REQUIRED = ['Ideia central', 'Por que importa', 'Passo a passo', 'Erros comuns', 'Exercícios', 'Resumo'];
const seenIds = new Map();

function checkStructure(ch, label) {
  const text = ch.segments.filter((s) => s.type === 'md').map((s) => s.text).join('\n');
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  let pos = -1;
  for (const req of REQUIRED) {
    const idx = headings.findIndex((h, i) => i > pos && h.startsWith(req));
    if (idx < 0) errors.push(`${label}: falta a seção "## ${req}" (ou está fora de ordem)`);
    else pos = idx;
  }
  const resumo = text.split(/^## Resumo.*$/m)[1];
  if (resumo) {
    const items = resumo.split(/^## /m)[0].match(/^\s*(?:-|\d+\.)\s+/gm) || [];
    if (items.length !== 3) errors.push(`${label}: o resumo deve ter exatamente 3 pontos (tem ${items.length})`);
  }
  if (!ch.segments.some((s) => s.type === 'steps')) errors.push(`${label}: nenhum bloco de passo a passo`);
  if (!ch.segments.some((s) => s.type === 'exercise')) errors.push(`${label}: nenhum exercício`);
}

async function checkStepMove(fenBefore, san, label) {
  const chess = new Chess(fenBefore);
  const mv = chess.move(cleanSan(san));
  const markedBad = /\?$/.test(san) && !/\?!$/.test(san);
  const all = await analyse(fenBefore, { depth: STEP_DEPTH, multipv: 1 });
  const played = await analyse(fenBefore, { depth: STEP_DEPTH, multipv: 1, searchmoves: [uci(mv)] });
  if (!all.lines[0] || !played.lines[0]) return;
  const best = scoreValue(all.lines[0].score);
  const got = scoreValue(played.lines[0].score);
  const drop = best - got;
  // Posição já decidida para o mesmo lado (ganha ou perdida de qualquer jeito): não é um erro didático.
  if ((best <= -400 && got <= -400) || (best >= 400 && got >= 400 && !markedBad)) return;
  if (markedBad && drop < 80) {
    warnings.push(`${label}: ${san} está marcado como erro (?), mas o motor perde só ${(drop / 100).toFixed(2)} com ele (melhor: ${all.bestmove}, ${formatScore(all.lines[0].score)}).`);
  }
  if (!markedBad && drop >= 150) {
    warnings.push(`${label}: o motor considera ${san} um erro (perde ${drop > 50000 ? 'o mate/decisivo' : (drop / 100).toFixed(2)}; melhor: ${all.bestmove} ${formatScore(all.lines[0].score)}, jogado: ${formatScore(played.lines[0].score)}). Marque com "?" se for intencional (armadilha) ou revise.`);
  }
}

async function checkExercise(ex, label) {
  stats.exercises += 1;
  if (!ex.id) errors.push(`${label}: exercício sem id`);
  else if (seenIds.has(ex.id)) errors.push(`${label}: id de exercício repetido "${ex.id}" (também em ${seenIds.get(ex.id)})`);
  else seenIds.set(ex.id, label);
  if (!ex.prompt) errors.push(`${label}: exercício ${ex.id} sem enunciado`);
  if (!ex.answer) errors.push(`${label}: exercício ${ex.id} sem explicação no gabarito`);
  if (!ex.solution.length) return errors.push(`${label}: exercício ${ex.id} sem solução`);

  const { fen } = resolvePosition(ex, `${label} ${ex.id}`);
  const replay = new Chess(fen);
  const fens = [fen];
  for (const san of ex.solution) {
    let mv = null;
    try {
      mv = replay.move(cleanSan(san));
    } catch {
      /* ilegal */
    }
    if (!mv) return errors.push(`${label}: exercício ${ex.id}: lance ilegal na solução "${san}" (posição ${replay.fen()})`);
    fens.push(replay.fen());
  }
  const first = new Chess(fen).move(cleanSan(ex.solution[0]));
  const userMoves = Math.ceil(ex.solution.length / 2);

  if (ex.goal === 'mate') {
    if (!replay.isCheckmate()) errors.push(`${label}: exercício ${ex.id}: a solução não termina em xeque-mate`);
    const res = await analyse(fen, { depth: Math.max(EX_DEPTH, userMoves * 4), multipv: 3 });
    const top = res.lines[0]?.score;
    if (!top || !('mate' in top) || top.mate !== userMoves) {
      errors.push(`${label}: exercício ${ex.id}: o Stockfish não confirma mate em ${userMoves} (avaliação: ${top ? formatScore(top) : '?'})`);
    }
    const mine = await analyse(fen, { depth: Math.max(EX_DEPTH, userMoves * 4), searchmoves: [uci(first)] });
    const s = mine.lines[0]?.score;
    if (!s || !('mate' in s) || s.mate !== userMoves) errors.push(`${label}: exercício ${ex.id}: ${ex.solution[0]} não leva a mate em ${userMoves} segundo o Stockfish (${s ? formatScore(s) : '?'})`);
    const alts = res.lines.filter((l) => l.pv[0] !== uci(first) && 'mate' in l.score && l.score.mate > 0 && l.score.mate <= userMoves);
    if (alts.length) warnings.push(`${label}: exercício ${ex.id}: também resolve com ${alts.map((a) => a.pv[0]).join(', ')} (mate em ${userMoves}). Aceite no site ou mencione no gabarito.`);
  } else if (ex.goal === 'best') {
    const res = await analyse(fen, { depth: EX_DEPTH, multipv: 2 });
    const [a, b] = res.lines;
    if (res.bestmove !== uci(first)) {
      const mine = await analyse(fen, { depth: EX_DEPTH, searchmoves: [uci(first)] });
      const gap = scoreValue(a.score) - scoreValue(mine.lines[0].score);
      if (gap > 60) errors.push(`${label}: exercício ${ex.id}: o Stockfish prefere ${res.bestmove} (${formatScore(a.score)}) a ${ex.solution[0]} (${formatScore(mine.lines[0].score)})`);
      else warnings.push(`${label}: exercício ${ex.id}: ${res.bestmove} é praticamente tão bom quanto ${ex.solution[0]} (diferença ${(gap / 100).toFixed(2)}).`);
    } else if (b && scoreValue(a.score) - scoreValue(b.score) < 100) {
      warnings.push(`${label}: exercício ${ex.id}: a segunda opção (${b.pv[0]}, ${formatScore(b.score)}) é quase tão boa quanto a solução (${formatScore(a.score)}).`);
    }
    // lances seguintes do aluno também devem ser os melhores
    for (let i = 2; i < ex.solution.length; i += 2) {
      const r = await analyse(fens[i], { depth: EX_DEPTH - 4, multipv: 1 });
      const mv = new Chess(fens[i]).move(cleanSan(ex.solution[i]));
      if (r.bestmove !== uci(mv)) {
        const mine = await analyse(fens[i], { depth: EX_DEPTH - 4, searchmoves: [uci(mv)] });
        const gap = scoreValue(r.lines[0].score) - scoreValue(mine.lines[0].score);
        if (gap > 100) warnings.push(`${label}: exercício ${ex.id}: no lance ${ex.solution[i]} o motor prefere ${r.bestmove} (diferença ${(gap / 100).toFixed(2)}).`);
      }
    }
  } else {
    // goal "move": lance didático; só não pode ser um erro.
    const res = await analyse(fen, { depth: STEP_DEPTH, multipv: 1 });
    const mine = await analyse(fen, { depth: STEP_DEPTH, searchmoves: [uci(first)] });
    const gap = scoreValue(res.lines[0].score) - scoreValue(mine.lines[0].score);
    if (gap > 120) errors.push(`${label}: exercício ${ex.id}: ${ex.solution[0]} perde ${(gap / 100).toFixed(2)} segundo o motor (melhor: ${res.bestmove})`);
  }
}

async function checkChapter(rel) {
  const ch = chapter(rel);
  const label = rel;
  stats.chapters += 1;
  const lesson = ch.meta.kind !== 'intro';
  if (!ch.meta.id || !ch.meta.title) errors.push(`${label}: front matter sem id ou title`);
  if (lesson) {
    if (!ch.meta.route) errors.push(`${label}: capítulo sem rota do site (route)`);
    else if (!routes.has(ch.meta.route)) errors.push(`${label}: a rota ${ch.meta.route} não existe no site`);
    checkStructure(ch, label);
  }
  const text = ch.segments.filter((s) => s.type === 'md').map((s) => s.text).join('\n');
  for (const m of text.matchAll(/\[\[([^\]]+)\]\]/g)) {
    for (const san of parseMoveList(m[1])) {
      if (!/^(O-O(-O)?|[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](=[NBRQ])?)[+#]?[?!]*$/.test(san)) errors.push(`${label}: notação estranha no texto: [[${m[1]}]]`);
    }
  }

  for (const seg of ch.segments) {
    try {
      if (seg.type === 'board') {
        stats.boards += 1;
        resolvePosition(seg, seg.where);
        for (const sq of [...seg.highlights, ...seg.arrows.flatMap((a) => a.replace('!', '').split('-'))]) {
          if (!/^[a-h][1-8]$/.test(sq)) errors.push(`${seg.where}: casa inválida "${sq}"`);
        }
      } else if (seg.type === 'steps') {
        const { chess } = resolvePosition(seg, seg.where);
        for (const item of seg.items) {
          if (item.kind !== 'move') continue;
          stats.stepMoves += 1;
          const before = chess.fen();
          let mv = null;
          try {
            mv = chess.move(cleanSan(item.san));
          } catch {
            /* ilegal */
          }
          if (!mv) {
            errors.push(`${seg.where}: lance ilegal "${item.san}" na posição ${before}`);
            break;
          }
          if (!item.text) errors.push(`${seg.where}: o lance ${item.san} não tem explicação`);
          await checkStepMove(before, item.san, `${label} (passo ${item.san})`);
        }
      } else if (seg.type === 'exercise') {
        await checkExercise(seg, label);
      }
    } catch (e) {
      errors.push(e.message);
    }
  }
}

const wanted = process.argv.slice(2);
const files = new Set();
for (const key of wanted.length ? wanted : catalog.order) {
  const p = catalog.products[key];
  const list = p.parts ? p.parts.flatMap((k) => [catalog.products[k].intro, ...catalog.products[k].chapters]) : [p.intro, ...p.chapters];
  for (const f of [...list, ...(catalog.common || [])]) if (f) files.add(f);
}
for (const f of files) {
  process.stdout.write(`verificando ${f}\n`);
  await checkChapter(f);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
}
engine.quit();

const report = [
  '# Verificação dos e-books',
  '',
  `Gerado por \`node scripts/verify.mjs\` em ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC.`,
  '',
  `- Capítulos: ${stats.chapters}`,
  `- Diagramas: ${stats.boards}`,
  `- Lances de passo a passo conferidos (legalidade + Stockfish profundidade ${STEP_DEPTH}): ${stats.stepMoves}`,
  `- Exercícios conferidos (legalidade + Stockfish profundidade ${EX_DEPTH}): ${stats.exercises}`,
  '',
  `## Erros (${errors.length})`,
  '',
  ...(errors.length ? errors.map((e) => `- ${e}`) : ['Nenhum.']),
  '',
  `## Avisos para revisão humana (${warnings.length})`,
  '',
  ...(warnings.length ? warnings.map((w) => `- ${w}`) : ['Nenhum.']),
  '',
].join('\n');
fs.writeFileSync(path.join(ROOT, 'verificacao.md'), report);
console.log(`\n${stats.chapters} capítulos, ${stats.boards} diagramas, ${stats.stepMoves} lances, ${stats.exercises} exercícios.`);
console.log(`Erros: ${errors.length}  Avisos: ${warnings.length}  (detalhes em ebooks/verificacao.md)`);
if (errors.length) {
  errors.forEach((e) => console.log('ERRO ' + e));
  process.exit(1);
}
