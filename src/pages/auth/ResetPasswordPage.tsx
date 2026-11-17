import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { LoadingState, Notice } from '@/components/ui/Feedback';
import { TextField } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { AuthNotConfigured } from '@/features/authentication/AuthNotConfigured';
import { useAuth } from '@/features/authentication/AuthProvider';
import { authService } from '@/services/authService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthCard } from './AuthCard';

/** Destino do link de recuperação: o Supabase abre uma sessão temporária a partir da URL. */
export default function ResetPasswordPage() {
  useDocumentTitle('Nova senha');
  const { status } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'unconfigured') return <AuthNotConfigured />;
  if (status === 'loading') return <LoadingState label="Validando o link…" />;
  if (status === 'signed-out') {
    return (
      <AuthCard title="Link inválido ou expirado" description="Peça um novo link de recuperação para continuar.">
        <Link to="/recuperar-senha" className="btn btn-primary btn-lg btn-block">
          Pedir novo link
        </Link>
      </AuthCard>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Use pelo menos 8 caracteres.');
    if (password !== confirm) return setError('As senhas não são iguais.');
    setSubmitting(true);
    try {
      await authService.updatePassword(password);
      toast.show('Senha alterada.');
      navigate('/progresso', { replace: true });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Não foi possível alterar a senha.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Criar nova senha">
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && <Notice tone="danger">{error}</Notice>}
        <TextField label="Nova senha" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} hint="Mínimo de 8 caracteres." />
        <TextField label="Confirmar nova senha" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <Button type="submit" size="lg" block loading={submitting}>
          Salvar nova senha
        </Button>
      </form>
    </AuthCard>
  );
}
