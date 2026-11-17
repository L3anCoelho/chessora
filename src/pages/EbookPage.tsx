import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronDown, MessageSquareQuote } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { ebookProduct } from '@/config/ebook';
import { useAuth } from '@/features/authentication/AuthProvider';
import { buildCheckoutLink } from '@/services/checkoutService';
import { formatPrice } from '@/utils/format';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Capa provisória: um bloco tipográfico, até existir a capa definitiva (coverImageUrl). */
function CoverPlaceholder() {
  return (
    <div className="ebook-cover is-placeholder" role="img" aria-label="Espaço para a capa do e-book, ainda não definida">
      <div className="ebook-cover-grid" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <span key={index} className={(Math.floor(index / 4) + index) % 2 === 0 ? 'is-light' : 'is-dark'} />
        ))}
      </div>
      <p className="ebook-cover-title">Xadrez Inteligente</p>
      <p className="ebook-cover-note">Capa em produção</p>
    </div>
  );
}

export default function EbookPage() {
  useDocumentTitle('E-book');
  const { user, subject } = useAuth();
  const [modal, setModal] = useState<'not-configured' | 'requires-login' | null>(null);
  const product = ebookProduct;
  const hasAccess = subject.kind === 'premium' || subject.kind === 'admin';

  const handleBuy = () => {
    const link = buildCheckoutLink(user?.id ?? null);
    if (link.status === 'ready') {
      window.location.assign(link.url);
      return;
    }
    setModal(link.status);
  };

  return (
    <div className="container page ebook-page">
      {product.isDemoContent && (
        <Notice tone="warning" title="Conteúdo demonstrativo">
          Os textos desta página são provisórios e mostram como o produto vai funcionar. O e-book ainda está em produção
          e não está à venda.
        </Notice>
      )}

      <section className="ebook-hero">
        <div className="ebook-cover-wrap">
          {product.coverImageUrl ? (
            <img className="ebook-cover" src={product.coverImageUrl} alt={`Capa do e-book ${product.name}`} />
          ) : (
            <CoverPlaceholder />
          )}
        </div>
        <div className="ebook-info">
          <Badge tone="blue" icon={<BookOpen size={12} aria-hidden="true" />}>
            E-book
          </Badge>
          <h1>{product.name}</h1>
          <p className="ebook-subtitle">{product.subtitle}</p>
          <p className="muted">{product.description}</p>
          <ul className="check-list">
            {product.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          <div className="ebook-buy">
            <div>
              <span className="ebook-price">{formatPrice(product.priceCents)}</span>
              <span className="faint ebook-price-note">
                {product.accessDurationDays ? `Acesso por ${product.accessDurationDays} dias` : 'Acesso sem prazo de validade'}
              </span>
            </div>
            {hasAccess ? (
              <ButtonLink to="/aprender" size="lg">
                Você já tem acesso: ir para as aulas
              </ButtonLink>
            ) : (
              <Button size="lg" onClick={handleBuy}>
                Comprar e-book
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="ebook-section">
        <h2 className="section-title">O que o e-book libera</h2>
        <div className="ebook-contents">
          {product.contents.map((item, index) => (
            <div key={item.title} className="ebook-content-item">
              <span className="faint">Capítulo {index + 1}</span>
              <h3>{item.title}</h3>
              <p className="muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ebook-section ebook-access">
        <h2 className="section-title">Como funciona o acesso</h2>
        <ol className="access-steps">
          <li>
            <strong>Crie sua conta</strong>
            <span className="muted">A compra fica ligada a ela, em qualquer dispositivo.</span>
          </li>
          <li>
            <strong>Pague no checkout seguro</strong>
            <span className="muted">O pagamento é feito na plataforma de pagamento. Nenhum dado de cartão passa por este site.</span>
          </li>
          <li>
            <strong>Receba o acesso</strong>
            <span className="muted">Quando o pagamento é confirmado, os módulos premium são liberados na sua conta.</span>
          </li>
        </ol>
      </section>

      <section className="ebook-section ebook-testimonials" aria-labelledby="testimonials-title">
        <h2 id="testimonials-title" className="section-title">
          Depoimentos
        </h2>
        <div className="testimonials-empty">
          <MessageSquareQuote size={22} aria-hidden="true" />
          <p className="muted">Os depoimentos de leitores aparecerão aqui depois do lançamento.</p>
        </div>
      </section>

      <section className="ebook-section">
        <h2 className="section-title">Perguntas frequentes</h2>
        <div className="faq">
          {product.faq.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p className="muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <Modal
        open={modal === 'not-configured'}
        title="Ainda não disponível para compra"
        onClose={() => setModal(null)}
        footer={
          <Button variant="secondary" onClick={() => setModal(null)}>
            Entendi
          </Button>
        }
      >
        <p className="muted">
          O e-book está em produção e a venda ainda não foi aberta. Enquanto isso, o módulo Fundamentos e os desafios
          gratuitos estão liberados.
        </p>
        <p>
          <Link to="/aprender" onClick={() => setModal(null)}>
            Ir para as aulas gratuitas
          </Link>
        </p>
      </Modal>

      <Modal
        open={modal === 'requires-login'}
        title="Entre para comprar"
        onClose={() => setModal(null)}
        footer={
          <>
            <ButtonLink to="/entrar?redirect=%2Febook" variant="secondary">
              Entrar
            </ButtonLink>
            <ButtonLink to="/cadastro?redirect=%2Febook">Criar conta</ButtonLink>
          </>
        }
      >
        <p className="muted">A compra precisa estar ligada a uma conta para que o acesso premium seja liberado para você.</p>
      </Modal>
    </div>
  );
}
