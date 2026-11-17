import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/Feedback';
import { adminService, type AdminUserRow } from '@/services/adminService';
import { formatDate } from '@/utils/format';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AdminUsersPage() {
  useDocumentTitle('Usuários');
  const [rows, setRows] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setRows(null);
    setError(null);
    adminService
      .listUsers()
      .then(setRows)
      .catch((loadError: Error) => setError(loadError.message));
  }, [attempt]);

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Usuários</h1>
        <p>Contas cadastradas, nível de acesso e progresso. Os dados vêm de uma função que só responde a administradores.</p>
      </header>

      {error && (
        <ErrorState
          title="Usuários não carregados"
          description={error}
          action={
            <Button variant="secondary" onClick={() => setAttempt((value) => value + 1)}>
              Tentar de novo
            </Button>
          }
        />
      )}
      {!error && !rows && <LoadingState label="Carregando usuários…" />}
      {rows && rows.length === 0 && <EmptyState icon={<Users size={24} />} title="Nenhum usuário cadastrado" />}
      {rows && rows.length > 0 && (
        <div className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Usuário</th>
                <th scope="col">Acesso</th>
                <th scope="col">Aulas</th>
                <th scope="col">Desafios</th>
                <th scope="col">Partidas</th>
                <th scope="col">Desde</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.userId}>
                  <td>
                    <strong>{row.displayName || 'Sem nome'}</strong>
                    <span className="faint table-sub">{row.email}</span>
                  </td>
                  <td>
                    {row.role === 'admin' ? (
                      <Badge tone="neutral">Administrador</Badge>
                    ) : row.activeEntitlements > 0 ? (
                      <Badge tone="green">Premium</Badge>
                    ) : (
                      <Badge tone="blue">Gratuito</Badge>
                    )}
                  </td>
                  <td>{row.lessonsCompleted}</td>
                  <td>{row.challengesSolved}</td>
                  <td>{row.gamesPlayed}</td>
                  <td>{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
