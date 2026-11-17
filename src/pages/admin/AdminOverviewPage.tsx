import { Link } from 'react-router-dom';
import { Notice } from '@/components/ui/Feedback';
import { ebookProduct } from '@/config/ebook';
import { isCheckoutConfigured } from '@/config/env';
import { freeChallenges, premiumChallengeSummaries } from '@/data/challenges';
import { getAllLessons, getModules } from '@/services/contentRepository';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AdminOverviewPage() {
  useDocumentTitle('Administração');
  const lessons = getAllLessons();
  const published = lessons.filter((lesson) => lesson.status === 'published').length;

  const cards = [
    { label: 'Módulos', value: getModules().length, to: '/admin/conteudo' },
    { label: 'Aulas publicadas', value: `${published} de ${lessons.length}`, to: '/admin/conteudo' },
    { label: 'Desafios gratuitos', value: freeChallenges.length, to: '/admin/conteudo' },
    { label: 'Desafios premium', value: premiumChallengeSummaries.length, to: '/admin/conteudo' },
  ];

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Visão geral</h1>
        <p>Situação do conteúdo, dos usuários e do produto premium.</p>
      </header>

      <dl className="stat-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <dt>{card.label}</dt>
            <dd>
              <Link to={card.to}>{card.value}</Link>
            </dd>
          </div>
        ))}
      </dl>

      <div className="admin-checklist">
        <h2 className="section-title-sm">Pendências de configuração</h2>
        <Notice tone={ebookProduct.isDemoContent ? 'warning' : 'success'} title="Página do e-book">
          {ebookProduct.isDemoContent
            ? 'Usando textos demonstrativos. Atualize src/config/ebook.ts e desligue isDemoContent quando o produto existir.'
            : 'Textos definitivos publicados.'}
        </Notice>
        <Notice tone={isCheckoutConfigured ? 'success' : 'warning'} title="Checkout">
          {isCheckoutConfigured
            ? 'Link de checkout configurado. Confirme que o webhook está publicado antes de abrir as vendas.'
            : 'VITE_CHECKOUT_URL não configurada: o botão de compra informa que o produto não está à venda.'}
        </Notice>
        <Notice tone="info" title="Edição de conteúdo">
          Nesta etapa, aulas e desafios gratuitos são cadastrados em src/data, e o conteúdo premium nas tabelas
          lesson_contents e challenge_contents. Os formulários de edição por aqui são a próxima etapa.
        </Notice>
      </div>
    </div>
  );
}
