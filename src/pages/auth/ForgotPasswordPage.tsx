import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Feedback';
import { TextField } from '@/components/ui/Form';
import { AuthNotConfigured } from '@/features/authentication/AuthNotConfigured';
import { useAuth } from '@/features/authentication/AuthProvider';
import { authService } from '@/services/authService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthCard } from './AuthCard';

export default function ForgotPasswordPage() {
  useDocumentTitle('Recuperar senha');
  const { status } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'unconfigured') return <AuthNotConfigured />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(email.trim());
      setSent(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Não foi possível enviar o e-mail.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Recuperar senha"
      description="Enviaremos um link para você criar uma nova senha."
      footer={
        <p className="muted">
          Lembrou a senha? <Link to="/entrar">Entrar</Link>
        </p>
      }
    >
      {sent ? (
        <Notice tone="success" title="Verifique seu e-mail">
          Se houver uma conta com {email.trim()}, o link de redefinição chegará em alguns minutos. Confira também a caixa de spam.
        </Notice>
      ) : (
        <form className="auth-form" onSubmit={submit} noValidate>
          {error && <Notice tone="danger">{error}</Notice>}
          <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button type="submit" size="lg" block loading={submitting}>
            Enviar link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
