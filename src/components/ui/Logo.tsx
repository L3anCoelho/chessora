import { Link } from 'react-router-dom';

const brand = (file: string) => `${import.meta.env.BASE_URL}brand/${file}`;

/** Emblema isolado (cabeça do coelho). Mesmo arquivo nos dois temas. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span className="logo-mark" style={{ width: size, height: size }} aria-hidden="true">
      <img src={brand('coevichess-emblema.png')} alt="" />
    </span>
  );
}

/** Logo completa (mesma imagem nos dois temas). No celular estreito, o CSS troca pelo emblema. */
export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="logo" aria-label="CoeviChess, página inicial">
      <img className="logo-img logo-img-dark" src={brand('coevichess-logo.png')} alt="CoeviChess" />
      <img className="logo-img logo-img-emblem" src={brand('coevichess-emblema.png')} alt="" aria-hidden="true" />
    </Link>
  );
}

export function HeaderLogo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="logo header-logo" aria-label="CoeviChess, página inicial">
      <img src={brand('coevichess-logo.png')} alt="CoeviChess" />
    </Link>
  );
}
