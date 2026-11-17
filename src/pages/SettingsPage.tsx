import { useState, type FormEvent } from 'react';
import type { EngineLevel } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Feedback';
import { SegmentedControl, TextField, Toggle } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/authentication/AuthProvider';
import { ENGINE_LEVELS } from '@/features/chess/engine/stockfishEngine';
import { usePreferences } from '@/hooks/usePreferences';
import { authService } from '@/services/authService';
import { clearLocalProgress } from '@/services/progressStore';
import { gameStorage } from '@/services/gameStorage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgress } from '@/features/progress/ProgressProvider';

function PasswordForm() {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Use pelo menos 8 caracteres.');
    if (password !== confirm) return setError('As senhas não são iguais.');
    setSaving(true);
    try {
      await authService.updatePassword(password);
      setPassword('');
      setConfirm('');
      toast.show('Senha alterada.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Não foi possível alterar a senha.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="settings-body" onSubmit={submit} noValidate>
      {error && <Notice tone="danger">{error}</Notice>}
      <TextField label="Nova senha" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <TextField label="Confirmar nova senha" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
      <div>
        <Button type="submit" variant="secondary" loading={saving}>
          Alterar senha
        </Button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  useDocumentTitle('Configurações');
  const { preferences, update } = usePreferences();
  const { status } = useAuth();
  const { storage, reload } = useProgress();
  const toast = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="container page narrow-page">
      <header className="page-header">
        <h1>Configurações</h1>
        <p>As preferências de aparência e tabuleiro ficam salvas neste navegador.</p>
      </header>

      <section className="panel settings-section">
        <div className="panel-header">
          <h2>Aparência</h2>
        </div>
        <div className="settings-body">
          <SegmentedControl<'dark' | 'light'>
            label="Tema do site"
            value={preferences.theme}
            onChange={(theme) => update({ theme })}
            options={[
              { value: 'dark', label: 'Escuro' },
              { value: 'light', label: 'Claro' },
            ]}
          />
        </div>
      </section>

      <section className="panel settings-section">
        <div className="panel-header">
          <h2>Tabuleiro</h2>
        </div>
        <div className="settings-body">
          <Toggle
            label="Mostrar lances possíveis"
            description="Marca as casas para onde a peça selecionada pode ir."
            checked={preferences.showLegalMoves}
            onChange={(value) => update({ showLegalMoves: value })}
          />
          <Toggle
            label="Mostrar coordenadas"
            description="Letras e números nas bordas do tabuleiro."
            checked={preferences.showCoordinates}
            onChange={(value) => update({ showCoordinates: value })}
          />
          <Toggle
            label="Confirmar antes de reiniciar"
            description="Pede confirmação antes de apagar uma partida em andamento."
            checked={preferences.confirmBeforeRestart}
            onChange={(value) => update({ confirmBeforeRestart: value })}
          />
          <SegmentedControl<EngineLevel>
            label="Dificuldade inicial contra o computador"
            value={preferences.defaultEngineLevel}
            onChange={(value) => update({ defaultEngineLevel: value })}
            options={(Object.keys(ENGINE_LEVELS) as EngineLevel[]).map((key) => ({ value: key, label: ENGINE_LEVELS[key].label }))}
          />
        </div>
      </section>

      {status === 'signed-in' && (
        <section className="panel settings-section">
          <div className="panel-header">
            <h2>Senha</h2>
          </div>
          <PasswordForm />
        </section>
      )}

      {storage === 'local' && (
        <section className="panel settings-section">
          <div className="panel-header">
            <h2>Dados neste navegador</h2>
          </div>
          <div className="settings-body">
            <p className="muted">
              Sem conta, partidas, aulas concluídas e desafios ficam salvos apenas neste navegador. Você pode apagá-los.
            </p>
            <div>
              <Button variant="secondary" onClick={() => setConfirmClear(true)}>
                Apagar progresso deste navegador
              </Button>
            </div>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Apagar o progresso deste navegador?"
        description="Partidas, aulas concluídas, desafios e a partida salva serão removidos deste navegador. Não dá para desfazer."
        confirmLabel="Apagar"
        tone="danger"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearLocalProgress();
          gameStorage.clear();
          reload();
          setConfirmClear(false);
          toast.show('Progresso deste navegador apagado.', 'info');
        }}
      />
    </div>
  );
}
