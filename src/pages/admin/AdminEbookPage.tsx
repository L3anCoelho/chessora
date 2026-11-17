import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Feedback';
import { ebookProduct } from '@/config/ebook';
import { env, isCheckoutConfigured } from '@/config/env';
import { formatPrice } from '@/utils/format';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AdminEbookPage() {
  useDocumentTitle('E-book');
  const product = ebookProduct;
  const rows: [string, ReactNode][] = [
    ['Identificador', <code key="id">{product.id}</code>],
    ['Nome', product.name],
    ['Preço exibido', formatPrice(product.priceCents)],
    ['Validade do acesso', product.accessDurationDays ? `${product.accessDurationDays} dias` : 'Sem prazo'],
    ['Capa', product.coverImageUrl ?? 'Ainda não definida'],
    ['Checkout', isCheckoutConfigured ? env.checkoutUrl : 'Não configurado'],
    ['Parâmetro de referência', <code key="ref">{env.checkoutRefParam}</code>],
  ];

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>E-book</h1>
        <p>Configuração atual do produto premium.</p>
      </header>
      {product.isDemoContent && (
        <Notice tone="warning" title="Conteúdo demonstrativo ativo">
          A página pública mostra o aviso de textos provisórios.
        </Notice>
      )}

      <section className="panel admin-table-panel">
        <div className="panel-header">
          <h2>Produto</h2>
        </div>
        <dl className="definition-list">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel admin-table-panel">
        <div className="panel-header">
          <h2>O que a compra libera</h2>
        </div>
        <div className="settings-body">
          <div className="badge-row">
            {product.grantsScopes.map((scope) => (
              <Badge key={scope} tone="blue">
                {scope}
              </Badge>
            ))}
          </div>
          <p className="faint">
            Quem decide a liberação é a coluna grants_scopes da tabela products no banco. Mantenha os dois iguais.
          </p>
        </div>
      </section>

      <section className="panel admin-table-panel">
        <div className="panel-header">
          <h2>Capítulos e QR Codes</h2>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Capítulo</th>
                <th scope="col">Módulo</th>
                <th scope="col">Endereço do QR Code</th>
              </tr>
            </thead>
            <tbody>
              {product.chapters.map((chapter) => (
                <tr key={chapter.number}>
                  <td>
                    {chapter.number}. {chapter.title}
                  </td>
                  <td>{chapter.moduleId}</td>
                  <td>
                    <code>
                      {window.location.origin}
                      {chapter.exerciseRoute}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
