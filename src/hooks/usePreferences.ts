import { useCallback, useSyncExternalStore } from 'react';
import type { EngineLevel } from '@/types/domain';
import { readJson, writeJson } from '@/utils/storage';

/** Preferências de jogo, guardadas neste navegador. */
export interface Preferences {
  showLegalMoves: boolean;
  showCoordinates: boolean;
  defaultEngineLevel: EngineLevel;
  confirmBeforeRestart: boolean;
  /** Sons curtos de acerto e erro nas aulas. */
  sounds: boolean;
  theme: 'dark' | 'light';
}

const KEY = 'xi:preferences:v1';
const DEFAULTS: Preferences = {
  showLegalMoves: true,
  showCoordinates: true,
  defaultEngineLevel: 'facil',
  confirmBeforeRestart: true,
  sounds: true,
  theme: 'dark',
};

const listeners = new Set<() => void>();
const stored = readJson<Partial<Preferences>>(KEY) ?? {};
let cache: Preferences = {
  ...DEFAULTS,
  ...stored,
  theme: stored.theme === 'light' ? 'light' : 'dark',
};

function applyTheme(theme: Preferences['theme']) {
  document.documentElement.dataset.theme = theme;
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const headerBackground = getComputedStyle(document.documentElement).getPropertyValue('--header-bg').trim();
  if (themeColor && headerBackground) themeColor.content = headerBackground;
}

if (typeof document !== 'undefined') {
  applyTheme(cache.theme);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePreferences() {
  const preferences = useSyncExternalStore(subscribe, () => cache, () => DEFAULTS);
  const update = useCallback((patch: Partial<Preferences>) => {
    cache = { ...cache, ...patch };
    if (patch.theme && typeof document !== 'undefined') {
      applyTheme(patch.theme);
    }
    writeJson(KEY, cache);
    listeners.forEach((listener) => listener());
  }, []);
  return { preferences, update };
}
