/**
 * Gera o SQL das aulas premium a partir de content/lessons/*.json.
 *
 * Saídas:
 *  - supabase/migrations/<timestamp>_aulas_premium.sql  (insert ... on conflict)
 *  - supabase/seed.sql: o bloco entre os marcadores é reescrito, para um banco
 *    novo nascer completo.
 *
 * Nada é aplicado no banco: o arquivo é entregue para quem aplica a migração.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkLesson, readLessonFiles, ROOT } from './lib/lessons.mjs';

const MIGRATION = join(ROOT, 'supabase', 'migrations', '20261122120000_aulas_premium.sql');
const SEED = join(ROOT, 'supabase', 'seed.sql');
const BEGIN = '-- >>> aulas premium (gerado por scripts/build-lesson-sql.mjs; não edite à mão)';
const END = '-- <<< fim das aulas premium geradas';

const lessons = readLessonFiles();
const problems = lessons.flatMap((lesson) => checkLesson(lesson));
if (problems.length) {
  console.error('Não gerei o SQL: as aulas têm problemas.');
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function statementFor(lesson) {
  const body = JSON.stringify(lesson.body, null, 2);
  if (body.includes('$json$')) throw new Error(`${lesson.lessonId}: o corpo contém $json$`);
  return [
    `-- ${lesson.moduleId} · ${lesson.lessonId}`,
    'insert into public.lesson_contents (lesson_id, module_id, required_scope, body)',
    'values (',
    `  ${sqlLiteral(lesson.lessonId)},`,
    `  ${sqlLiteral(lesson.moduleId)},`,
    `  ${sqlLiteral(lesson.requiredScope)},`,
    `  $json$${body}$json$::jsonb`,
    ')',
    'on conflict (lesson_id) do update',
    '  set module_id = excluded.module_id,',
    '      required_scope = excluded.required_scope,',
    '      body = excluded.body,',
    '      updated_at = now();',
  ].join('\n');
}

const statements = lessons.map(statementFor).join('\n\n');

const header = [
  '-- =============================================================================',
  '-- Aulas premium: corpo das aulas de Táticas, Estratégia, Aberturas e Finais.',
  '--',
  '-- Gerado por scripts/build-lesson-sql.mjs a partir de content/lessons/*.json.',
  '-- Reaplicar é seguro: cada aula usa insert ... on conflict (lesson_id) do update.',
  '-- Não altera nenhuma tabela nem apaga dados.',
  '-- =============================================================================',
  '',
].join('\n');

writeFileSync(MIGRATION, `${header}${statements}\n`, 'utf8');

const seed = readFileSync(SEED, 'utf8');
const block = `${BEGIN}\n\n${statements}\n\n${END}`;
const begin = seed.indexOf(BEGIN);
let updated;
if (begin === -1) {
  updated = `${seed.trimEnd()}\n\n${block}\n`;
} else {
  const end = seed.indexOf(END);
  if (end === -1) throw new Error('seed.sql tem o marcador de início sem o de fim.');
  updated = seed.slice(0, begin) + block + seed.slice(end + END.length);
}
writeFileSync(SEED, updated, 'utf8');

const counts = lessons.reduce((acc, lesson) => {
  acc[lesson.moduleId] = (acc[lesson.moduleId] ?? 0) + 1;
  return acc;
}, {});
console.log(`Gerado: ${lessons.length} aula(s) — ${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
console.log(`  ${MIGRATION}`);
console.log(`  ${SEED} (bloco gerado)`);
