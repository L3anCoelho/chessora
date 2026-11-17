import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/authentication/AuthProvider';
import { useProgress } from '@/features/progress/ProgressProvider';
import { GameSetup } from '@/features/chess/components/GameSetup';
import { GameView } from '@/features/chess/components/GameView';
import { useGameSession } from '@/features/chess/hooks/useGameSession';
import { usePreferences } from '@/hooks/usePreferences';
import { gameStorage, type SavedGame } from '@/services/gameStorage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import '@/features/chess/components/play.css';

export default function PlayPage() {
  useDocumentTitle('Jogar');
  const toast = useToast();
  const { recordGame, storage } = useProgress();
  const { profile, user } = useAuth();
  const { preferences } = usePreferences();
  const [saved, setSaved] = useState<SavedGame | null>(() => gameStorage.load());
  const [starting, setStarting] = useState(false);

  const session = useGameSession((record) => {
    recordGame(record)
      .then(() => {
        if (storage === 'local') return;
        toast.show('Partida salva no seu progresso.');
      })
      .catch((error: Error) => toast.show(error.message, 'danger'));
  });

  const playerName = profile?.displayName || user?.email.split('@')[0] || 'Você';

  if (!session.settings) {
    return (
      <div className="container page">
        <header className="page-header">
          <h1>Jogar</h1>
          <p>Escolha contra quem jogar. Todas as regras oficiais são aplicadas: lances ilegais não são aceitos.</p>
        </header>
        <GameSetup
          saved={saved}
          defaultLevel={preferences.defaultEngineLevel}
          playerName={playerName}
          starting={starting}
          onStart={async (settings) => {
            setStarting(true);
            await session.start(settings);
            setStarting(false);
          }}
          onResume={async (game) => {
            setStarting(true);
            const ok = await session.resume(game);
            setStarting(false);
            if (!ok) {
              setSaved(null);
              toast.show('A partida salva estava corrompida e foi descartada.', 'danger');
            }
          }}
          onDiscardSaved={() => {
            gameStorage.clear();
            setSaved(null);
            toast.show('Partida salva descartada.', 'info');
          }}
        />
      </div>
    );
  }

  return (
    <div className="container page page-play">
      <h1 className="visually-hidden">Partida de xadrez</h1>
      <GameView
        session={session}
        onSwitchToLocal={() => {
          const current = session.settings;
          if (!current) return;
          // Continua a mesma posição, agora com duas pessoas no dispositivo.
          session.resume({
            version: 1,
            mode: 'local',
            pgn: session.game.pgn(),
            playerColor: 'w',
            engineLevel: current.engineLevel,
            whiteName: current.mode === 'computer' && current.playerColor === 'b' ? 'Jogador 2' : current.whiteName,
            blackName: current.mode === 'computer' && current.playerColor === 'w' ? 'Jogador 2' : current.blackName,
            orientation: session.orientation,
            startedAt: new Date().toISOString(),
            savedAt: new Date().toISOString(),
          });
        }}
      />
      {session.game.status.isOver && storage === 'local' && (
        <p className="faint play-storage-note">Resultado salvo neste navegador. Crie uma conta para guardar seu histórico.</p>
      )}
    </div>
  );
}
