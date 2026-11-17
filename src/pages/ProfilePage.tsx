import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Feedback';
import { TextField } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { ebookProduct } from '@/config/ebook';
import { useAuth } from '@/features/authentication/AuthProvider';
import { isEntitlementActive, SUBJECT_LABEL } from '@/features/premium/access';
import { authService } from '@/services/authService';
import { formatDate } from '@/utils/format';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const SOURCE_LABEL = { purchase: 'Compra', admin_grant: 'Liberado pela equipe', promotion: 'Promoção' } as const;
const STATUS_LABEL = { active: 'Ativo', revoked: 'Revogado', refunded: 'Reembolsado', expired: 'Expirado' } as const;

export default function ProfilePage() {
  useDocumentTitle('Perfil');
  const { user, profile, entitlements, subject, refresh, loadError } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.displayName ?? '');
  }, [profile?.displayName]);

  if (!user) return null;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.show('O nome precisa ter pelo menos 2 caracteres.', 'danger');
      return;
    }
    setSaving(true);
    try {
      await authService.updateDisplayName(user.id, name.trim());
      await refresh();
      toast.show('Nome atualizado.');
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Não foi possível salvar.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container page narrow-page">
      <header className="page-header">
        <h1>Perfil</h1>
      </header>
      {loadError && <Notice tone="warning">{loadError}</Notice>}

      <section className="panel settings-section">
        <div className="panel-header">
          <h2>Dados da conta</h2>
        </div>
        <form className="settings-body" onSubmit={save}>
          <TextField label="Nome" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} />
          <TextField label="E-mail" value={user.email} disabled hint="O e-mail é usado para entrar e não pode ser alterado aqui." />
          {profile && <p className="faint">Conta criada em {formatDate(profile.createdAt)}.</p>}
          <div>
            <Button type="submit" loading={saving} disabled={name.trim() === (profile?.displayName ?? '')}>
              Salvar nome
            </Button>
          </div>
        </form>
      </section>

      <section className="panel settings-section">
        <div className="panel-header">
          <h2>Nível de acesso</h2>
          <Badge tone={subject.kind === 'admin' ? 'neutral' : 'blue'}>{SUBJECT_LABEL[subject.kind]}</Badge>
        </div>
        <div className="settings-body">
          {entitlements.length === 0 ? (
            <>
              <p className="muted">
                Sua conta gratuita libera o módulo Fundamentos, as aulas para cadastrados e os desafios gratuitos. O acesso
                premium será liberado pelo e-book.
              </p>
              <div>
                <ButtonLink to="/ebook" variant="secondary">
                  Conhecer o e-book
                </ButtonLink>
              </div>
            </>
          ) : (
            <ul className="entitlement-list">
              {entitlements.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.productId === ebookProduct.id ? ebookProduct.name : (item.productName ?? item.productId)}</strong>
                    <span className="faint">
                      {SOURCE_LABEL[item.source]} em {formatDate(item.startsAt)}
                      {item.expiresAt ? `, válido até ${formatDate(item.expiresAt)}` : ', sem prazo de validade'}
                    </span>
                  </div>
                  <Badge tone={isEntitlementActive(item) ? 'green' : 'danger'}>
                    {item.status === 'active' && !isEntitlementActive(item) ? 'Expirado' : STATUS_LABEL[item.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="muted">
        Seu histórico de partidas, aulas e desafios está em <Link to="/progresso">Meu Progresso</Link>. Senha e
        preferências ficam em <Link to="/configuracoes">Configurações</Link>.
      </p>
    </div>
  );
}
