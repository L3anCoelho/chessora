import { Link } from 'react-router-dom';

const brand = (file: string) => `${import.meta.env.BASE_URL}brand/${file}`;

/** Emblema isolado (cavalo + C). Mesmo arquivo nos dois temas. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span className="logo-mark" style={{ width: size, height: size }} aria-hidden="true">
      <img src={brand('chessora-emblema.png')} alt="" />
    </span>
  );
}

/**
 * Logo completa. As duas versões ficam no DOM e o CSS mostra só a do tema ativo
 * (data-theme no <html>), então a troca é imediata e sem piscar.
 * No celular estreito, o CSS troca pela versão emblema.
 */
export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="logo" aria-label="Chessora, página inicial">
      <img className="logo-img logo-img-dark" src={brand('chessora-logo-fundo-escuro.png')} alt="Chessora" />
      <img className="logo-img logo-img-light" src={brand('chessora-logo-fundo-claro.png')} alt="" aria-hidden="true" />
      <img className="logo-img logo-img-emblem" src={brand('chessora-emblema.png')} alt="" aria-hidden="true" />
    </Link>
  );
}

export function HeaderLogo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="logo header-logo" aria-label="Chessora, página inicial">
      <img src={brand('chessora-header-logo.png')} alt="Chessora" />
    </Link>
  );
}
