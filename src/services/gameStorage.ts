/**
 * Partida em andamento salva neste navegador, para o botão "Continuar partida".
 * Partidas online (futuras) terão o estado no servidor; ver features/chess/online.ts.
 */
import type { EngineLevel, PlayerColor } from '@/types/domain';
import { readJson, removeKey, writeJson } from '@/utils/storage';

export interface SavedGame {
  version: 1;
  mode: 'computer' | 'local';
  pgn: string;
  playerColor: PlayerColor;
  engineLevel: EngineLevel;
  whiteName: string;
  blackName: string;
  orientation: PlayerColor;
  startedAt: string;
  savedAt: string;
}

const KEY = 'xi:saved-game:v1';

export const gameStorage = {
  load(): SavedGame | null {
    const saved = readJson<SavedGame>(KEY);
    return saved && saved.version === 1 && typeof saved.pgn === 'string' ? saved : null;
  },
  save(game: Omit<SavedGame, 'version' | 'savedAt'>): void {
    writeJson(KEY, { ...game, version: 1, savedAt: new Date().toISOString() });
  },
  clear(): void {
    removeKey(KEY);
  },
};
