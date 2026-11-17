/**
 * Gera os PDFs dos e-books a partir de content/.
 *
 *   SITE_URL=https://seu-dominio.com.br node scripts/build.mjs            (todos)
 *   SITE_URL=... node scripts/build.mjs aberturas taticas                  (só alguns)
 *
 * Sem SITE_URL, os QR Codes apontam para https://example.com (domínio reservado para exemplos)
 * e o script avisa. Gere de novo com o domínio real antes de distribuir.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';
import QRCode from 'qrcode';
import { Chess } from 'chess.js';
import { loadCatalog, resolvePosition, sanToPt, lineToPt, cleanSan } from './lib/content.mjs';
import { renderBoard } from './lib/board.mjs';
import { loadPieces } from './lib/pieces.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = path.resolve(ROOT, '..');
const OUT = path.join(ROOT, 'pdf');
const TMP = path.join(ROOT, '.build');
const SITE_URL = (process.env.SITE_URL || 'https://example.com').replace(/\/$/, '');
if (!process.env.SITE_URL) {
  console.warn('Aviso: SITE_URL não definido. Os QR Codes vão apontar para https://example.com.');
}

const { catalog, chapter } = loadCatalog(ROOT);
const pieces = await loadPieces();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Markdown com [[lances]] convertidos para a notação em português. */
function md(text) {
  const withSan = text.replace(/\[\[([^\]]+)\]\]/g, (_, line) => `<span class="san">${esc(lineToPt(line))}</span>`);
  return marked.parse(withSan, { gfm: true });
}
const inline = (text) => marked.parseInline(text.replace(/\[\[([^\]]+)\]\]/g, (_, l) => `<span class="san">${esc(lineToPt(l))}</span>`));

function moveLabel(chessBefore, san) {
  const n = chessBefore.moveNumber();
  return chessBefore.turn() === 'w' ? `${n}. ${sanToPt(san)}` : `${n}… ${sanToPt(san)}`;
}

function figure(boardSvg, caption, cls = '') {
  return `<figure class="diagram ${cls}">${boardSvg}${caption ? `<figcaption>${inline(caption)}</figcaption>` : ''}</figure>`;
}

async function qr(url) {
  return QRCode.toString(url, { type: 'svg', margin: 2, errorCorrectionLevel: 'M', color: { dark: '#1d2025', light: '#ffffff' } });
}

async function renderChapter(ch, number, opts) {
  const html = [];
  const answers = [];
  const isLesson = ch.meta.kind !== 'intro';
  html.push(`<section class="chapter${isLesson ? '' : ' intro'}" id="ch-${ch.meta.id}">`);
  html.push(`<span class="marker">§§${ch.meta.id}§§</span>`);
  if (isLesson) {
    html.push(`<p class="chapter-kicker">Capítulo ${number}</p>`);
  } else if (ch.meta.kicker) {
    html.push(`<p class="chapter-kicker">${esc(ch.meta.kicker)}</p>`);
  }
  html.push(`<h1 class="chapter-title">${esc(ch.meta.title)}</h1>`);
  if (ch.meta.summary) html.push(`<p class="chapter-summary">${inline(ch.meta.summary)}</p>`);

  let inGrid = false;
  for (const seg of ch.segments) {
    const blank = seg.type === 'md' && !seg.text.trim();
    if (blank) continue;
    if (seg.type === 'exercise' && !inGrid) {
      html.push('<div class="ex-grid">');
      inGrid = true;
    } else if (seg.type !== 'exercise' && inGrid) {
      html.push('</div>');
      inGrid = false;
    }
    if (seg.type === 'md') {
      html.push(md(seg.text));
    } else if (seg.type === 'board') {
      const pos = resolvePosition(seg, seg.where);
      const orientation = seg.orientation || 'w';
      html.push(
        figure(
          renderBoard({ fen: pos.fen, orientation, highlights: seg.highlights, arrows: seg.arrows, lastMove: seg.moves ? pos.lastMove : null }, pieces),
          seg.caption,
        ),
      );
    } else if (seg.type === 'steps') {
      const { chess } = resolvePosition(seg, seg.where);
      const orientation = seg.orientation || 'w';
      let last = null;
      html.push(`<div class="steps">`);
      if (seg.title) html.push(`<p class="steps-title">${inline(seg.title)}</p>`);
      for (const item of seg.items) {
        if (item.kind === 'move') {
          const label = moveLabel(chess, item.san);
          const mv = chess.move(cleanSan(item.san));
          last = { from: mv.from, to: mv.to };
          html.push(`<div class="step"><span class="mv">${esc(label)}</span><div class="why">${inline(item.text)}</div></div>`);
        } else if (item.kind === 'note') {
          html.push(`<p class="step-note">${inline(item.text)}</p>`);
        } else {
          html.push(
            figure(
              renderBoard({ fen: chess.fen(), orientation: item.orientation || orientation, highlights: item.highlights, arrows: item.arrows, lastMove: last }, pieces),
              item.caption,
              'in-steps',
            ),
          );
        }
      }
      html.push(`</div>`);
    } else if (seg.type === 'exercise') {
      const pos = resolvePosition(seg, seg.where);
      const toMove = pos.chess.turn();
      const orientation = seg.orientation || toMove;
      const route = seg.route || ch.meta.route || opts.moduleRoute || '/';
      const url = SITE_URL + route;
      const label = toMove === 'w' ? 'Brancas jogam' : 'Pretas jogam';
      html.push(`<div class="exercise">`);
      html.push(`<p class="ex-head"><span>Exercício ${number}.${seg.number}</span><span class="ex-turn">${label}</span></p>`);
      html.push(figure(renderBoard({ fen: pos.fen, orientation, highlights: seg.highlights }, pieces), '', 'ex-board'));
      html.push(`<p class="ex-prompt">${inline(seg.prompt)}</p>`);
      html.push(`<div class="ex-qr">${await qr(url)}<p>Pratique no site<br><span class="ex-url">${esc(url.replace(/^https?:\/\//, ''))}</span></p></div>`);
      html.push(`</div>`);
      // gabarito
      const replay = new Chess(pos.fen);
      const parts = seg.solution.map((san) => {
        const label = moveLabel(replay, san);
        replay.move(cleanSan(san));
        return label;
      });
      const compact = parts.map((p, i) => (i > 0 && p.includes('…') ? p.replace(/^\d+… /, '') : p)).join(' ');
      answers.push(`<li><span class="ans-no">${number}.${seg.number}</span> <span class="san">${esc(compact)}</span> ${inline(seg.answer)}</li>`);
    }
  }
  if (inGrid) html.push('</div>');
  if (answers.length) {
    html.push(`<div class="answers"><h2>Respostas dos exercícios</h2><ol class="answer-list">${answers.join('')}</ol></div>`);
  }
  html.push(`</section>`);
  return html.join('\n');
}

function fontFaces() {
  const f = (p) => pathToFileURL(path.join(PROJECT, 'node_modules/@fontsource-variable', p)).href;
  return `
@font-face{font-family:'Manrope';font-weight:200 800;src:url('${f('manrope/files/manrope-latin-wght-normal.woff2')}') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}
@font-face{font-family:'Manrope';font-weight:200 800;src:url('${f('manrope/files/manrope-latin-ext-wght-normal.woff2')}') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}
@font-face{font-family:'Newsreader';font-style:normal;font-weight:200 800;src:url('${f('newsreader/files/newsreader-latin-opsz-normal.woff2')}') format('woff2');}
@font-face{font-family:'Newsreader';font-style:italic;font-weight:200 800;src:url('${f('newsreader/files/newsreader-latin-opsz-italic.woff2')}') format('woff2');}`;
}

const CSS = fs.readFileSync(path.join(ROOT, 'scripts/lib/book.css'), 'utf8');

/** Nome usado no rodapé, na página de créditos e no título do PDF (sem repetir a marca). */
const fullName = (product) => (product.title.startsWith('Xadrez Inteligente') ? product.title : `Xadrez Inteligente · ${product.title}`);

function cover(product) {
  const pos = resolvePosition({ fen: product.coverFen || null, moves: product.coverMoves || null }, 'capa');
  const art = renderBoard({ fen: pos.fen, orientation: 'w' }, pieces);
  return `<section class="cover">
    <p class="cover-brand">Xadrez Inteligente</p>
    <div class="cover-rule"></div>
    <h1 class="cover-title">${esc(product.coverTitle || product.title)}</h1>
    <p class="cover-sub">${esc(product.subtitle)}</p>
    <div class="cover-art">${art}</div>
    <p class="cover-foot">${esc(product.coverNote)}</p>
  </section>`;
}

function colophon(product) {
  const date = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return `<section class="colophon">
    <div>
      <p><strong>${esc(fullName(product))}</strong></p>
      <p>Versão preliminar, ${esc(date)}. Conteúdo em revisão técnica antes da publicação.</p>
      <p>Todas as posições e sequências de lances deste livro foram conferidas por software: a legalidade dos lances com a biblioteca chess.js e as soluções dos exercícios com o motor Stockfish (software livre, licença GPLv3).</p>
      <p>Os QR Codes abrem a aula correspondente no site Xadrez Inteligente.</p>
    </div>
  </section>`;
}

function toc(entries, pages) {
  const rows = entries
    .map((e) => {
      const n = pages?.[e.id] ?? '000';
      if (e.kind === 'part') return `<li class="toc-part"><span>${esc(e.label)}</span><span class="pg">${n}</span></li>`;
      return `<li class="${e.kind === 'intro' ? 'toc-intro' : 'toc-ch'}"><span>${e.num ? `<b>${e.num}</b>` : ''}${esc(e.title)}</span><span class="dots"></span><span class="pg">${n}</span></li>`;
    })
    .join('');
  return `<section class="toc"><h1 class="chapter-title">Sumário</h1><ol class="toc-list">${rows}</ol></section>`;
}

async function buildHtml(key, pages) {
  const product = catalog.products[key];
  const entries = [];
  const body = [];
  let chapterNo = 0;

  const addChapter = async (rel) => {
    const ch = chapter(rel);
    const lesson = ch.meta.kind !== 'intro';
    if (lesson) chapterNo += 1;
    entries.push({ id: ch.meta.id, title: ch.meta.title, num: lesson ? chapterNo : null, kind: lesson ? 'ch' : 'intro' });
    body.push(await renderChapter(ch, chapterNo, { moduleRoute: product.moduleRoute }));
  };

  if (product.intro) await addChapter(product.intro);
  for (const rel of catalog.common || []) await addChapter(rel);

  if (product.parts) {
    let partNo = 0;
    for (const partKey of product.parts) {
      partNo += 1;
      const part = catalog.products[partKey];
      const partId = `parte-${partKey}`;
      entries.push({ id: partId, kind: 'part', label: `Parte ${partNo} · ${part.shortTitle}` });
      body.push(`<section class="part-page" id="${partId}"><span class="marker">§§${partId}§§</span><p class="part-kicker">Parte ${partNo}</p><h1>${esc(part.shortTitle)}</h1><p>${esc(part.subtitle)}</p></section>`);
      if (part.intro) await addChapter(part.intro);
      for (const rel of part.chapters) await addChapter(rel);
    }
  } else {
    for (const rel of product.chapters) await addChapter(rel);
  }

  const title = fullName(product);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${fontFaces()}\n${CSS}</style></head><body>
${colophon(product)}
${toc(entries, pages)}
${body.join('\n')}
</body></html>`;
}

function findPages(pdfPath) {
  const total = Number(execFileSync('pdfinfo', [pdfPath]).toString().match(/Pages:\s+(\d+)/)[1]);
  const pages = {};
  for (let p = 1; p <= total; p += 1) {
    const text = execFileSync('pdftotext', ['-f', String(p), '-l', String(p), '-layout', pdfPath, '-']).toString();
    for (const m of text.matchAll(/§§([a-z0-9-]+)§§/g)) if (!(m[1] in pages)) pages[m[1]] = p;
  }
  return { pages, total };
}

async function renderCover(browser, product, outPath) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${fontFaces()}\n${CSS}\n@page{margin:0}</style></head><body>${cover(product)}</body></html>`;
  fs.mkdirSync(TMP, { recursive: true });
  const htmlPath = path.join(TMP, `${path.basename(outPath, '.pdf')}.html`);
  fs.writeFileSync(htmlPath, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: outPath, width: '160mm', height: '230mm', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
  await page.close();
}

async function renderPdf(browser, html, outPath, product) {
  fs.mkdirSync(TMP, { recursive: true });
  const htmlPath = path.join(TMP, `${path.basename(outPath, '.pdf')}.html`);
  fs.writeFileSync(htmlPath, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: outPath,
    width: '160mm',
    height: '230mm',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7px;color:#7a828e;padding:0 16mm;display:flex;justify-content:space-between;"><span>${esc(fullName(product))}</span><span class="pageNumber"></span></div>`,
    margin: { top: '17mm', bottom: '18mm', left: '16mm', right: '16mm' },
    outline: true,
    tagged: true,
  });
  await page.close();
}

const wanted = process.argv.slice(2);
const keys = wanted.length ? wanted : catalog.order;
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const key of keys) {
  const product = catalog.products[key];
  if (!product) throw new Error(`Produto desconhecido: ${key}`);
  const out = path.join(OUT, `${product.file}.pdf`);
  const bodyPdf = path.join(TMP, `${product.file}-miolo.pdf`);
  const coverPdf = path.join(TMP, `${product.file}-capa.pdf`);
  fs.mkdirSync(TMP, { recursive: true });
  // 1ª passada descobre em que página cada capítulo começa; a 2ª escreve o sumário com esses números.
  await renderPdf(browser, await buildHtml(key, null), bodyPdf, product);
  const { pages } = findPages(bodyPdf);
  await renderPdf(browser, await buildHtml(key, pages), bodyPdf, product);
  const { pages: check, total } = findPages(bodyPdf);
  const moved = Object.keys(pages).filter((id) => pages[id] !== check[id]);
  if (moved.length) throw new Error(`${key}: o sumário mudou a paginação (${moved.join(', ')}). Rode de novo.`);
  // Versão final sem os marcadores de página (eles têm posição absoluta, então o layout não muda).
  const finalHtml = (await buildHtml(key, pages)).replace(/<span class="marker">§§[a-z0-9-]+§§<\/span>/g, '');
  await renderPdf(browser, finalHtml, bodyPdf, product);
  const after = Number(execFileSync('pdfinfo', [bodyPdf]).toString().match(/Pages:\s+(\d+)/)[1]);
  if (after !== total) throw new Error(`${key}: a remoção dos marcadores mudou a paginação`);
  // A capa é gerada à parte (sem rodapé) e entra na frente; o miolo mantém o índice de navegação do PDF.
  await renderCover(browser, product, coverPdf);
  execFileSync('qpdf', [bodyPdf, '--pages', coverPdf, '1', bodyPdf, '--', out]);
  console.log(`${product.file}.pdf  ${total + 1} páginas (capa + ${total})`);
}
await browser.close();
