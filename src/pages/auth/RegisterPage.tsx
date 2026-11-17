import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, Notice } from '@/components/ui/Feedback';
import { TextField } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { AuthNotConfigured } from '@/features/authentication/AuthNotConfigured';
import { useAuth } from '@/features/authentication/AuthProvider';
import { authService } from '@/services/authService';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AuthCard, safeRedirect } from './AuthCard';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterPage() {
  useDocumentTitle('Criar conta');
  const { status } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const redirect = safeRedirect(params.get('redirect'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  useEffect(() => {
    if (status === 'signed-in') navigate(redirect, { replace: true });
  }, [status, navigate, redirect]);

  if (status === 'unconfigured') return <AuthNotConfigured />;

  if (awaitingEmail) {
    return (
      <div className="container page">
        <EmptyState
          icon={<MailCheck size={24} />}
          title="Confirme seu e-mail"
          description={`Enviamos um link de confirmação para ${email}. Abra o e-mail para ativar a conta e depois entre.`}
          action={<Link to="/entrar">Ir para Entrar</Link>}
        />
      </div>
    );
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (name.trim().length < 2) next.name = 'Informe como quer ser chamado.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Informe um e-mail válido.';
    if (password.length < 8) next.password = 'Use pelo menos 8 caracteres.';
    if (confirm !== password) next.confirm = 'As senhas não são iguais.';
    return next;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await authService.signUp(email.trim(), password, name.trim());
      if (needsEmailConfirmation) setAwaitingEmail(true);
      else toast.show('Conta criada.');
    } catch (signUpError) {
      setFormError(signUpError instanceof Error ? signUpError.message : 'Não foi possível criar a conta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Criar conta"
      description="Gratuita. Salva seu progresso e libera as aulas para cadastrados."
      footer={
        <p className="muted">
          Já tem conta? <Link to={`/entrar?redirect=${encodeURIComponent(redirect)}`}>Entrar</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {formError && <Notice tone="danger">{formError}</Notice>}
        <TextField label="Nome" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} maxLength={40} />
        <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} />
        <TextField
          label="Senha"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          hint="Mínimo de 8 caracteres."
        />
        <TextField
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" block loading={submitting}>
          Criar conta
        </Button>
      </form>
    </AuthCard>
  );
}
