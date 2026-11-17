import { useCallback, useEffect, useRef, useState } from 'react';
import type { PieceSymbol, Square } from 'chess.js';
import type { EngineLevel, GameRecord, GameResult, PlayerColor } from '@/types/domain';
import { gameStorage, type SavedGame } from '@/services/gameStorage';
import { createId } from '@/utils/storage';
import { useChessGame } from './useChessGame';
import { ENGINE_LEVELS, getEngine, SearchCancelledError } from '../engine/stockfishEngine';
import { parseUciMove } from '../logic/rules';

export interface GameSettings {
  mode: 'computer' | 'local';
  playerColor: PlayerColor;
  engineLevel: EngineLevel;
  whiteName: string;
  blackName: string;
}

export type EngineState = 'idle' | 'loading' | 'thinking' | 'error';

const MIN_ENGINE_DELAY_MS = 350;

function outcomeFor(result: GameResult, color: PlayerColor): GameRecord['outcome'] {
  if (result === 'draw') return 'draw';
  if (result === 'aborted') return null;
  return (result === 'white') === (color === 'w') ? 'win' : 'loss';
}

/**
 * Sessão de partida: junta o estado do tabuleiro, o motor, o salvamento automático
 * e o registro do resultado no progresso.
 */
export function useGameSession(onFinished: (record: GameRecord) => void) {
  const game = useChessGame();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [orientation, setOrientation] = useState<PlayerColor>('w');
  const [engineState, setEngineState] = useState<EngineState>('idle');
  const [engineError, setEngineError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString());
  const recordedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const engineColor: PlayerColor | null =
    settings?.mode === 'computer' ? (settings.playerColor === 'w' ? 'b' : 'w') : null;
  const isEngineTurn = engineColor !== null && game.status.turn === engineColor && !game.status.isOver;

  /* ----- Motor ----- */

  const prepareEngine = useCallback(async () => {
    setEngineError(null);
    setEngineState('loading');
    try {
      await getEngine().init();
      getEngine().newGame();
      setEngineState('idle');
      return true;
    } catch (error) {
      setEngineState('error');
      setEngineError(error instanceof Error ? error.message : 'O motor de xadrez não está disponível.');
      return false;
    }
  }, []);

  const engineReady = engineState === 'idle' || engineState === 'thinking';

  useEffect(() => {
    if (!settings || !isEngineTurn || !engineReady) return;
    let cancelled = false;
    const fen = game.fen;
    const started = performance.now();
    setEngineState('thinking');
    getEngine()
      .bestMove(fen, ENGINE_LEVELS[settings.engineLevel])
      .then(async (uci) => {
        const wait = MIN_ENGINE_DELAY_MS - (performance.now() - started);
        if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait));
        if (cancelled) return;
        const move = parseUciMove(uci);
        if (!move || !game.move(move)) throw new Error(`Lance inválido recebido do motor: ${uci}`);
        setEngineState('idle');
      })
      .catch((error: unknown) => {
        if (cancelled || error instanceof SearchCancelledError) return;
        setEngineState('error');
        setEngineError(error instanceof Error ? error.message : 'O motor de xadrez parou de responder.');
      });
    return () => {
      cancelled = true;
      getEngine().cancel();
    };
    // Reage a cada nova posição em que é a vez do computador (e quando o motor fica pronto).
  }, [game.fen, isEngineTurn, settings, engineReady]);

  /* ----- Salvamento automático e registro do resultado ----- */

  useEffect(() => {
    if (!settings) return;
    if (game.status.isOver) {
      gameStorage.clear();
      if (!recordedRef.current && game.status.result && game.status.endReason && game.history.length > 0) {
        recordedRef.current = true;
        onFinishedRef.current({
          id: createId(),
          mode: settings.mode,
          outcome: settings.mode === 'computer' ? outcomeFor(game.status.result, settings.playerColor) : null,
          result: game.status.result,
          endReason: game.status.endReason,
          engineLevel: settings.mode === 'computer' ? settings.engineLevel : undefined,
          moveCount: game.history.length,
          pgn: game.pgn(),
          endedAt: new Date().toISOString(),
        });
      }
      return;
    }
    recordedRef.current = false;
    if (game.history.length === 0) {
      gameStorage.clear();
      return;
    }
    gameStorage.save({
      mode: settings.mode,
      pgn: game.pgn(),
      playerColor: settings.playerColor,
      engineLevel: settings.engineLevel,
      whiteName: settings.whiteName,
      blackName: settings.blackName,
      orientation,
      startedAt,
    });
  }, [game.fen, game.status.isOver, settings, orientation]);

  /* ----- Ações ----- */

  const start = useCallback(
    async (next: GameSettings) => {
      gameStorage.clear();
      recordedRef.current = false;
      game.reset();
      setSettings(next);
      setStartedAt(new Date().toISOString());
      setOrientation(next.mode === 'computer' ? next.playerColor : 'w');
      if (next.mode === 'computer') await prepareEngine();
      else setEngineState('idle');
    },
    [game, prepareEngine],
  );

  const resume = useCallback(
    async (saved: SavedGame) => {
      if (!game.loadPgn(saved.pgn)) {
        gameStorage.clear();
        return false;
      }
      recordedRef.current = false;
      setSettings({
        mode: saved.mode,
        playerColor: saved.playerColor,
        engineLevel: saved.engineLevel,
        whiteName: saved.whiteName,
        blackName: saved.blackName,
      });
      setOrientation(saved.orientation);
      setStartedAt(saved.startedAt);
      if (saved.mode === 'computer') await prepareEngine();
      else {
        setEngineState('idle');
        setEngineError(null);
      }
      return true;
    },
    [game, prepareEngine],
  );

  const playerMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      if (!settings || isEngineTurn) return null;
      return game.move({ from, to, promotion });
    },
    [game, settings, isEngineTurn],
  );

  /** Contra o computador, desfaz o lance do jogador e a resposta do motor. */
  const undo = useCallback(() => {
    if (!settings) return;
    getEngine().cancel();
    if (settings.mode === 'local') {
      game.undo(1);
      return;
    }
    const lastMover = game.history.at(-1)?.color;
    // Se o motor já respondeu, volta 2 lances; se ainda está pensando, volta só o do jogador.
    game.undo(lastMover === engineColor ? 2 : 1);
    if (engineState === 'thinking') setEngineState('idle');
  }, [game, settings, engineColor, engineState]);

  const restart = useCallback(() => {
    if (!settings) return;
    getEngine().newGame();
    recordedRef.current = false;
    gameStorage.clear();
    game.reset();
    setStartedAt(new Date().toISOString());
    if (engineState !== 'error') setEngineState('idle');
  }, [game, settings, engineState]);

  const resign = useCallback(() => {
    if (!settings || game.status.isOver) return;
    getEngine().cancel();
    const loser: PlayerColor = settings.mode === 'computer' ? settings.playerColor : game.status.turn;
    game.endManually({ result: loser === 'w' ? 'black' : 'white', endReason: 'resignation' });
  }, [game, settings]);

  const leave = useCallback(() => {
    getEngine().cancel();
    setSettings(null);
    setEngineState('idle');
  }, []);

  const canUndo =
    !!settings &&
    !game.status.isOver &&
    game.history.length > 0 &&
    (settings.mode === 'local' || game.history.some((move) => move.color === settings.playerColor));

  return {
    game,
    settings,
    orientation,
    flip: () => setOrientation((value) => (value === 'w' ? 'b' : 'w')),
    engineState,
    engineError,
    engineColor,
    isEngineTurn,
    retryEngine: prepareEngine,
    start,
    resume,
    playerMove,
    undo,
    canUndo,
    restart,
    resign,
    leave,
  };
}
