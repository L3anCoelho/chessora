import { useState, type FormEvent } from 'react';
import { ArrowLeftRight, Cpu, History, Puzzle, Users } from 'lucide-react';
import type { EngineLevel, PlayerColor } from '@/types/domain';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SegmentedControl, TextField } from '@/components/ui/Form';
import type { SavedGame } from '@/services/gameStorage';
import { formatDateTime } from '@/utils/format';
import { ENGINE_LEVELS } from '../engine/stockfishEngine';
import type { GameSettings } from '../hooks/useGameSession';

type ColorChoice = PlayerColor | 'random';

interface GameSetupProps {
  saved: SavedGame | null;
  defaultLevel: EngineLevel;
  playerName: string;
  starting: boolean;
  onStart: (settings: GameSettings) => void;
  onResume: (saved: SavedGame) => void;
  onDiscardSaved: () => void;
}

export function GameSetup({ saved, defaultLevel, playerName, starting, onStart, onResume, onDiscardSaved }: GameSetupProps) {
  const [mode, setMode] = useState<'computer' | 'local'>('computer');
  const [color, setColor] = useState<ColorChoice>('w');
  const [level, setLevel] = useState<EngineLevel>(defaultLevel);
  const [whiteName, setWhiteName] = useState('Jogador 1');
  const [blackName, setBlackName] = useState('Jogador 2');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'computer') {
      const playerColor: PlayerColor = color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
      const engineName = `Stockfish (${ENGINE_LEVELS[level].label.toLowerCase()})`;
      onStart({
        mode,
        playerColor,
        engineLevel: level,
        whiteName: playerColor === 'w' ? playerName : engineName,
        blackName: playerColor === 'b' ? playerName : engineName,
      });
      return;
    }
    onStart({
      mode,
      playerColor: 'w',
      engineLevel: level,
      whiteName: whiteName.trim() || 'Brancas',
      blackName: blackName.trim() || 'Pretas',
    });
  };

  return (
    <div className="setup-grid">
      <form className="panel setup-form" onSubmit={submit}>
        <fieldset className="mode-picker">
          <legend className="visually-hidden">Modo de jogo</legend>
          <label className={`mode-option${mode === 'computer' ? ' is-active' : ''}`}>
            <input type="radio" name="mode" checked={mode === 'computer'} onChange={() => setMode('computer')} />
            <Cpu size={22} aria-hidden="true" />
            <span>
              <strong>Contra o computador</strong>
              <span className="muted">Partida contra o Stockfish, em três níveis.</span>
            </span>
          </label>
          <label className={`mode-option${mode === 'local' ? ' is-active' : ''}`}>
            <input type="radio" name="mode" checked={mode === 'local'} onChange={() => setMode('local')} />
            <Users size={22} aria-hidden="true" />
            <span>
              <strong>Duas pessoas</strong>
              <span className="muted">No mesmo dispositivo, alternando a vez.</span>
            </span>
          </label>
        </fieldset>

        {mode === 'computer' ? (
          <div className="setup-fields">
            <SegmentedControl<ColorChoice>
              label="Suas peças"
              value={color}
              onChange={setColor}
              options={[
                { value: 'w', label: 'Brancas' },
                { value: 'b', label: 'Pretas' },
                { value: 'random', label: 'Sortear' },
              ]}
            />
            <div>
              <SegmentedControl<EngineLevel>
                label="Dificuldade"
                value={level}
                onChange={setLevel}
                options={(Object.keys(ENGINE_LEVELS) as EngineLevel[]).map((key) => ({
                  value: key,
                  label: ENGINE_LEVELS[key].label,
                }))}
              />
              <p className="field-hint setup-level-hint">{ENGINE_LEVELS[level].description}</p>
            </div>
          </div>
        ) : (
          <div className="setup-fields">
            <div className="local-names">
              <TextField label="Brancas" value={whiteName} maxLength={30} onChange={(event) => setWhiteName(event.target.value)} />
              <button
                type="button"
                className="icon-button swap-colors"
                aria-label="Trocar as cores dos jogadores"
                onClick={() => {
                  setWhiteName(blackName);
                  setBlackName(whiteName);
                }}
              >
                <ArrowLeftRight size={18} />
              </button>
              <TextField label="Pretas" value={blackName} maxLength={30} onChange={(event) => setBlackName(event.target.value)} />
            </div>
            <p className="field-hint">Não é preciso ter conta para jogar. As brancas começam.</p>
          </div>
        )}

        <Button type="submit" size="lg" block loading={starting}>
          {starting ? 'Carregando o motor' : 'Começar partida'}
        </Button>
      </form>

      <aside className="setup-aside">
        {saved && (
          <div className="panel panel-padded saved-game">
            <div className="saved-game-head">
              <History size={20} aria-hidden="true" />
              <h2>Partida salva</h2>
            </div>
            <p className="muted">
              {saved.mode === 'computer' ? 'Contra o computador' : 'Duas pessoas'}: {saved.whiteName} × {saved.blackName}.
              Salva em {formatDateTime(saved.savedAt)}.
            </p>
            <div className="saved-game-actions">
              <Button onClick={() => onResume(saved)} disabled={starting}>
                Continuar partida
              </Button>
              <Button variant="ghost" onClick={onDiscardSaved} disabled={starting}>
                Descartar
              </Button>
            </div>
          </div>
        )}
        <div className="panel panel-padded">
          <div className="saved-game-head">
            <Puzzle size={20} aria-hidden="true" />
            <h2>Prefere treinar?</h2>
          </div>
          <p className="muted">Resolva posições com objetivo definido: mates, garfos, cravadas.</p>
          <ButtonLink to="/desafios" variant="secondary">
            Resolver desafios
          </ButtonLink>
        </div>
        <p className="faint setup-note">Partidas online entre usuários ainda não estão disponíveis.</p>
      </aside>
    </div>
  );
}
