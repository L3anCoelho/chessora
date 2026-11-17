import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Feedback';
import { TextField } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { AuthNotConfigured } from '@/features/authentication/AuthNotConfigured';
import { useAuth } from '@/features/authentication/AuthProvider';
import { authService } from '@/services/authService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthCard, safeRedirect } from './AuthCard';

export default function LoginPage() {
  useDocumentTitle('Entrar');
  const { status } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const redirect = safeRedirect(params.get('redirect'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'signed-in') navigate(redirect, { replace: true });
  }, [status, navigate, redirect]);

  if (status === 'unconfigured') return <AuthNotConfigured />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.signIn(email.trim(), password);
      toast.show('Você entrou na sua conta.');
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Entrar"
      description="Acesse seu progresso e seus conteúdos."
      footer={
        <p className="muted">
          Ainda não tem conta? <Link to={`/cadastro?redirect=${encodeURIComponent(redirect)}`}>Criar conta gratuita</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && <Notice tone="danger">{error}</Notice>}
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Link to="/recuperar-senha" className="auth-aside-link">
          Esqueci minha senha
        </Link>
        <Button type="submit" size="lg" block loading={submitting}>
          Entrar
        </Button>
      </form>
    </AuthCard>
  );
}
