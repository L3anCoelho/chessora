import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Settings, Shield, User, X } from 'lucide-react';
import { HeaderLogo, Logo } from '@/components/ui/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/authentication/AuthProvider';
import { SUBJECT_LABEL } from '@/features/premium/access';
import './layout.css';

const NAV_ITEMS = [
  { to: '/', label: 'Início', end: true },
  { to: '/jogar', label: 'Jogar' },
  { to: '/aprender', label: 'Aprender' },
  { to: '/desafios', label: 'Desafios' },
  { to: '/progresso', label: 'Meu Progresso' },
  { to: '/ebook', label: 'E-book' },
];

function AccountMenu() {
  const { user, profile, subject, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      if (event instanceof MouseEvent && menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const name = profile?.displayName || user?.email.split('@')[0] || 'Conta';

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await signOut();
      toast.show('Você saiu da sua conta.', 'info');
      navigate('/');
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Não foi possível sair.', 'danger');
    }
  };

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className="account-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="avatar" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="account-name">{name}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="account-dropdown" role="menu">
          <div className="account-summary">
            <strong>{name}</strong>
            <span>{SUBJECT_LABEL[subject.kind]}</span>
          </div>
          <Link role="menuitem" to="/perfil" onClick={() => setOpen(false)}>
            <User size={16} /> Perfil
          </Link>
          <Link role="menuitem" to="/configuracoes" onClick={() => setOpen(false)}>
            <Settings size={16} /> Configurações
          </Link>
          {subject.kind === 'admin' && (
            <Link role="menuitem" to="/admin" onClick={() => setOpen(false)}>
              <Shield size={16} /> Administração
            </Link>
          )}
          <button role="menuitem" type="button" onClick={handleSignOut}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}

function SiteHeader() {
  const { status } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <HeaderLogo />
        <nav className={`main-nav${mobileOpen ? ' is-open' : ''}`} aria-label="Navegação principal" id="main-nav">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {status !== 'signed-in' && (
            <div className="mobile-auth">
              <ButtonLink to="/entrar" variant="secondary" block>
                Entrar
              </ButtonLink>
              <ButtonLink to="/cadastro" block>
                Criar conta
              </ButtonLink>
            </div>
          )}
        </nav>
        <div className="header-actions">
          {status === 'signed-in' ? (
            <AccountMenu />
          ) : status === 'loading' ? (
            <span className="header-placeholder" aria-hidden="true" />
          ) : (
            <div className="desktop-auth">
              <ButtonLink to="/entrar" variant="ghost" size="sm">
                Entrar
              </ButtonLink>
              <ButtonLink to="/cadastro" size="sm">
                Criar conta
              </ButtonLink>
            </div>
          )}
          <button
            type="button"
            className="icon-button nav-toggle"
            aria-expanded={mobileOpen}
            aria-controls="main-nav"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo />
          <p className="muted">Jogue, aprenda e pratique xadrez no mesmo lugar, no seu ritmo.</p>
        </div>
        <nav aria-label="Plataforma" className="footer-column">
          <h2>Plataforma</h2>
          <Link to="/jogar">Jogar</Link>
          <Link to="/aprender">Aprender</Link>
          <Link to="/desafios">Desafios</Link>
          <Link to="/ebook">E-book</Link>
        </nav>
        <nav aria-label="Conta" className="footer-column">
          <h2>Conta</h2>
          <Link to="/entrar">Entrar</Link>
          <Link to="/cadastro">Criar conta</Link>
          <Link to="/progresso">Meu Progresso</Link>
          <Link to="/configuracoes">Configurações</Link>
        </nav>
        <div className="footer-column">
          <h2>Créditos</h2>
          <p className="faint">
            Motor de xadrez: Stockfish, software livre sob licença GPLv3.{' '}
            <a href="https://github.com/official-stockfish/Stockfish" target="_blank" rel="noreferrer">
              Código-fonte
            </a>{' '}
            e{' '}
            <a href={`${import.meta.env.BASE_URL}engine/STOCKFISH-LICENSE.txt`} target="_blank" rel="noreferrer">
              licença
            </a>
            .
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span className="faint">© {new Date().getFullYear()} Coelho Viltrumita. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}

export function MainLayout() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className="site-main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
