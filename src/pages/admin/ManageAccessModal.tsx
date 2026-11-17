import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState, Notice } from '@/components/ui/Feedback';
import { SelectField, TextField } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { adminService, type AdminEntitlement, type AdminProduct, type AdminUserRow } from '@/services/adminService';
import { formatDate } from '@/utils/format';

const SOURCE_LABEL = { purchase: 'Compra', admin_grant: 'Liberado pela equipe', promotion: 'Promoção' } as const;
const STATUS_LABEL = { active: 'Ativo', revoked: 'Revogado', refunded: 'Reembolsado', expired: 'Expirado' } as const;

const VALIDITY_OPTIONS = [
  { value: 'none', label: 'Sem prazo' },
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
  { value: '365', label: '1 ano' },
  { value: 'custom', label: 'Escolher uma data' },
];

function isLive(item: AdminEntitlement): boolean {
  return item.status === 'active' && (!item.expiresAt || new Date(item.expiresAt).getTime() > Date.now());
}

/** Converte "AAAA-MM-DD" no fim desse dia, no fuso local. */
function endOfDay(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59);
}

function toDateInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

interface Props {
  user: AdminUserRow | null;
  onClose: () => void;
  /** Chamado depois de liberar ou revogar, para atualizar a lista de usuários. */
  onChanged: () => void;
}

export function ManageAccessModal({ user, onClose, onChanged }: Props) {
  const toast = useToast();
  const [items, setItems] = useState<AdminEntitlement[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [productId, setProductId] = useState('');
  const [validity, setValidity] = useState('none');
  const [customDate, setCustomDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const userId = user?.userId ?? null;

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [entitlements, productList] = await Promise.all([
        adminService.listEntitlements(userId),
        adminService.listProducts(),
      ]);
      setItems(entitlements);
      setProducts(productList);
      setProductId((current) => current || productList[0]?.id || '');
      setLoadError(null);
    } catch (error) {
      setLoadError((error as Error).message);
    }
  }, [userId]);

  useEffect(() => {
    setItems(null);
    setLoadError(null);
    setFormError(null);
    setValidity('none');
    setCustomDate('');
    setNote('');
    setConfirmId(null);
    void load();
  }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;
    setFormError(null);
    if (!productId) return setFormError('Escolha um produto.');

    let expiresAt: string | null = null;
    if (validity === 'custom') {
      if (!customDate) return setFormError('Escolha a data de validade.');
      const date = endOfDay(customDate);
      if (date.getTime() <= Date.now()) return setFormError('A validade precisa ser uma data futura.');
      expiresAt = date.toISOString();
    } else if (validity !== 'none') {
      expiresAt = new Date(Date.now() + Number(validity) * 86_400_000).toISOString();
    }

    setSaving(true);
    try {
      await adminService.grantProduct({ userId, productId, expiresAt, note: note.slice(0, 200) });
      toast.show('Acesso liberado com sucesso.');
      setNote('');
      setValidity('none');
      setCustomDate('');
      await load();
      onChanged();
    } catch (error) {
      setFormError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function revoke(id: string) {
    setRevokingId(id);
    setFormError(null);
    try {
      await adminService.revokeEntitlement(id);
      toast.show('Acesso revogado.');
      setConfirmId(null);
      await load();
      onChanged();
    } catch (error) {
      setFormError((error as Error).message);
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      title={user ? `Gerenciar acesso — ${user.displayName || user.email}` : ''}
      size="md"
    >
      {user && (
        <>
          <p className="faint table-sub">{user.email}</p>
          {formError && <Notice tone="danger">{formError}</Notice>}

          <section className="access-section">
            <h3>Acessos atuais</h3>
            {loadError && <Notice tone="danger">{loadError}</Notice>}
            {!loadError && !items && <LoadingState label="Carregando acessos…" />}
            {items && items.length === 0 && <p className="muted">Esta pessoa ainda não tem nenhum acesso premium.</p>}
            {items && items.length > 0 && (
              <ul className="access-list">
                {items.map((item) => {
                  const live = isLive(item);
                  const expired = item.status === 'active' && !live;
                  return (
                    <li key={item.id}>
                      <div className="access-main">
                        <strong>{item.productName}</strong>
                        <span className="faint">
                          {SOURCE_LABEL[item.source]} · início {formatDate(item.startsAt)} ·{' '}
                          {item.expiresAt ? `válido até ${formatDate(item.expiresAt)}` : 'sem prazo'}
                        </span>
                        {item.note && <span className="faint">Obs.: {item.note}</span>}
                      </div>
                      <div className="access-actions">
                        <Badge tone={live ? 'green' : 'danger'}>{expired ? 'Expirado' : STATUS_LABEL[item.status]}</Badge>
                        {live &&
                          (confirmId === item.id ? (
                            <span className="access-confirm">
                              <span>Revogar este acesso?</span>
                              <Button size="sm" variant="danger" loading={revokingId === item.id} onClick={() => revoke(item.id)}>
                                Confirmar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                                Cancelar
                              </Button>
                            </span>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => setConfirmId(item.id)}>
                              Revogar
                            </Button>
                          ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <form className="access-section" onSubmit={submit} noValidate>
            <h3>Liberar acesso</h3>
            <SelectField
              label="Produto"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              options={products.map((product) => ({ value: product.id, label: product.name }))}
              disabled={products.length === 0}
            />
            <SelectField
              label="Validade"
              value={validity}
              onChange={(event) => setValidity(event.target.value)}
              options={VALIDITY_OPTIONS}
            />
            {validity === 'custom' && (
              <TextField
                label="Válido até"
                type="date"
                value={customDate}
                min={toDateInput(new Date(Date.now() + 86_400_000))}
                onChange={(event) => setCustomDate(event.target.value)}
              />
            )}
            <TextField
              label="Observação (opcional)"
              value={note}
              maxLength={200}
              onChange={(event) => setNote(event.target.value)}
              hint={`${note.length}/200`}
            />
            <div>
              <Button type="submit" loading={saving} disabled={!productId}>
                Liberar acesso
              </Button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
