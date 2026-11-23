/**
 * Sons curtos de confirmação, gerados no próprio navegador.
 *
 * Nada de arquivo de áudio: os tons são sintetizados com a Web Audio API, o que
 * evita baixar qualquer coisa e funciona offline. O contexto de áudio só é
 * criado no primeiro som, que sempre vem depois de um clique ou toque do
 * usuário — é o que os navegadores exigem para deixar o som tocar.
 */

type Tone = { frequency: number; start: number; duration: number };

/** Duas notas subindo: lance certo. */
const CORRECT: Tone[] = [
  { frequency: 660, start: 0, duration: 0.09 },
  { frequency: 990, start: 0.08, duration: 0.14 },
];

/** Uma nota curta e grave: lance errado. */
const WRONG: Tone[] = [{ frequency: 200, start: 0, duration: 0.16 }];

/** Acorde final: sequência concluída. */
const FINISH: Tone[] = [
  { frequency: 660, start: 0, duration: 0.1 },
  { frequency: 880, start: 0.09, duration: 0.1 },
  { frequency: 1320, start: 0.18, duration: 0.22 },
];

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context ??= new Ctor();
    // Alguns navegadores suspendem o contexto até a primeira interação.
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

function play(tones: Tone[], volume: number) {
  const audio = getContext();
  if (!audio) return;
  const now = audio.currentTime;
  for (const tone of tones) {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = tone.frequency;
    // Sobe e desce o volume para não estalar no começo e no fim da nota.
    const start = now + tone.start;
    const end = start + tone.duration;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

export const sounds = {
  correct: () => play(CORRECT, 0.16),
  wrong: () => play(WRONG, 0.12),
  finish: () => play(FINISH, 0.18),
};

export type SoundName = keyof typeof sounds;

/** Toca um som, respeitando a preferência do usuário. */
export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled) return;
  try {
    sounds[name]();
  } catch {
    /* som é um extra: nunca pode quebrar a aula */
  }
}
