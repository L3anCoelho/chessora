import { useState } from 'react';
import { Flag, FlipVertical2, RotateCcw, Undo2, X } from 'lucide-react';
import type { Square } from 'chess.js';
import type { PlayerColor } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Notice } from '@/components/ui/Feedback';
import { usePreferences } from '@/hooks/usePreferences';
import { ChessBoard } from './ChessBoard';
import { MoveList, PlayerBar } from './GamePanels';
import { describeResult, findKingSquare, isPromotionMove, legalTargets } from '../logic/rules';
import { ENGINE_LEVELS } from '../engine/stockfishEngine';
import type { useGameSession } from '../hooks/useGameSession';

type Session = ReturnType<typeof useGameSession>;
type PendingConfirm = 'restart' | 'resign' | 'leave' | null;

function statusMessage(session: Session): { tone: 'info' | 'success' | 'warning' | 'danger'; text: string } {
  const { game, settings } = session;
  const status = game.status;
  const colorName = (color: PlayerColor) => (color === 'w' ? 'brancas' : 'pretas');

  if (status.isOver && status.result) {
    const description = describeResult(status.result, status.endReason);
    if (settings?.mode === 'computer' && status.result !== 'draw' && status.result !== 'aborted') {
      const won = (status.result === 'white') === (settings.playerColor === 'w');
      return { tone: won ? 'success' : 'danger', text: `${won ? 'Você venceu' : 'Você perdeu'}. ${description}` };
    }
    return { tone: status.result === 'draw' ? 'info' : 'success', text: description };
  }
  if (status.inCheck) {
    if (settings?.mode === 'computer' && status.turn === settings.playerColor) {
      return { tone: 'warning', text: 'Xeque. Seu rei está atacado: mova o rei, bloqueie ou capture a peça.' };
    }
    return { tone: 'warning', text: `Xeque nas ${colorName(status.turn)}.` };
  }
  if (session.isEngineTurn) return { tone: 'info', text: 'O computador está pensando…' };
  if (settings?.mode === 'computer') return { tone: 'info', text: 'Sua vez. Clique ou arraste uma peça.' };
  return { tone: 'info', text: `Vez das ${colorName(status.turn)}.` };
}

export function GameView({ session, onSwitchToLocal }: { session: Session; onSwitchToLocal: () => void }) {
  const { game, settings, orientation } = session;
  const { preferences } = usePreferences();
  const [confirm, setConfirm] = useState<PendingConfirm>(null);
  if (!settings) return null;

  const status = game.status;
  const topColor: PlayerColor = orientation === 'w' ? 'b' : 'w';
  const bottomColor: PlayerColor = orientation;
  const nameOf = (color: PlayerColor) => (color === 'w' ? settings.whiteName : settings.blackName);
  const capturedBy = (color: PlayerColor) => (color === 'w' ? game.captures.byWhite : game.captures.byBlack);
  const advantageOf = (color: PlayerColor) =>
    color === 'w' ? Math.max(0, game.captures.materialBalance) : Math.max(0, -game.captures.materialBalance);

  const movableColor: PlayerColor | null = status.isOver
    ? null
    : settings.mode === 'computer'
      ? session.isEngineTurn || session.engineState === 'loading' || session.engineState === 'error'
        ? null
        : settings.playerColor
      : status.turn;

  const checkSquare = status.inCheck ? findKingSquare(game.chess, status.turn) : null;
  const message = statusMessage(session);

  const runConfirmed = (action: PendingConfirm) => {
    setConfirm(null);
    if (action === 'restart') session.restart();
    if (action === 'resign') session.resign();
    if (action === 'leave') session.leave();
  };

  const askOrRun = (action: Exclude<PendingConfirm, null>) => {
    const needsConfirm = game.history.length > 0 && !status.isOver && (action !== 'restart' || preferences.confirmBeforeRestart);
    if (needsConfirm) setConfirm(action);
    else runConfirmed(action);
  };

  const playerBar = (color: PlayerColor) => (
    <PlayerBar
      name={nameOf(color)}
      color={color}
      isTurn={!status.isOver && status.turn === color}
      isThinking={session.isEngineTurn && session.engineColor === color}
      captured={capturedBy(color)}
      advantage={advantageOf(color)}
    />
  );

  return (
    <div className="game-layout">
      <section className="game-board-column" aria-label="Partida">
        {playerBar(topColor)}
        <ChessBoard
          fen={game.fen}
          orientation={orientation}
          movableColor={movableColor}
          getTargets={(square: Square) => legalTargets(game.chess, square)}
          isPromotion={(from, to) => isPromotionMove(game.chess, from, to)}
          onMove={(from, to, promotion) => session.playerMove(from, to, promotion)}
          lastMove={game.lastMove}
          checkSquare={checkSquare}
          showCoordinates={preferences.showCoordinates}
          showLegalMoves={preferences.showLegalMoves}
        />
        {playerBar(bottomColor)}
      </section>

      <aside className="game-side">
        <div className={`game-status game-status-${message.tone}`} role="status" aria-live="polite">
          {message.text}
        </div>

        {session.engineState === 'error' && (
          <Notice tone="danger" title="Motor de xadrez indisponível">
            <p>{session.engineError}</p>
            <div className="notice-actions">
              <Button size="sm" variant="secondary" onClick={() => session.retryEngine()}>
                Tentar de novo
              </Button>
              <Button size="sm" variant="ghost" onClick={onSwitchToLocal}>
                Jogar com duas pessoas
              </Button>
            </div>
          </Notice>
        )}
        {session.engineState === 'loading' && <Notice tone="info">Carregando o motor de xadrez…</Notice>}

        <div className="game-controls">
          <Button variant="secondary" size="sm" icon={<Undo2 size={16} />} onClick={session.undo} disabled={!session.canUndo}>
            Desfazer
          </Button>
          <Button variant="secondary" size="sm" icon={<FlipVertical2 size={16} />} onClick={session.flip}>
            Virar tabuleiro
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={16} />}
            onClick={() => askOrRun('restart')}
            disabled={game.history.length === 0}
          >
            Reiniciar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Flag size={16} />}
            onClick={() => setConfirm('resign')}
            disabled={status.isOver || game.history.length === 0}
          >
            Desistir
          </Button>
        </div>

        <div className="panel game-moves">
          <div className="panel-header">
            <h2>Lances</h2>
            <span className="faint game-mode-label">
              {settings.mode === 'computer'
                ? `Computador, nível ${ENGINE_LEVELS[settings.engineLevel].label.toLowerCase()}`
                : 'Duas pessoas'}
            </span>
          </div>
          <MoveList moves={game.sanMoves} />
        </div>

        {status.isOver && (
          <div className="game-over-actions">
            <Button onClick={session.restart}>Jogar de novo</Button>
            <Button variant="secondary" onClick={session.leave}>
              Mudar configuração
            </Button>
          </div>
        )}
        {!status.isOver && (
          <Button variant="ghost" size="sm" icon={<X size={16} />} onClick={() => askOrRun('leave')}>
            Sair da partida
          </Button>
        )}
      </aside>

      <ConfirmDialog
        open={confirm === 'restart'}
        title="Reiniciar a partida?"
        description="Os lances desta partida serão apagados e ela não entrará no seu histórico."
        confirmLabel="Reiniciar"
        onConfirm={() => runConfirmed('restart')}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'resign'}
        title="Desistir da partida?"
        description={
          settings.mode === 'computer'
            ? 'A partida será registrada como derrota no seu progresso.'
            : `As ${status.turn === 'w' ? 'brancas' : 'pretas'}, que estão na vez, abandonam a partida.`
        }
        confirmLabel="Desistir"
        tone="danger"
        onConfirm={() => runConfirmed('resign')}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'leave'}
        title="Sair da partida?"
        description="A partida continua salva neste navegador e pode ser retomada depois em Continuar partida."
        confirmLabel="Sair"
        onConfirm={() => runConfirmed('leave')}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
