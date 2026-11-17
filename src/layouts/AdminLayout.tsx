import { NavLink, Outlet } from 'react-router-dom';
import { ArrowLeft, BookOpen, LayoutDashboard, ShoppingBag, Users } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import './layout.css';

/** Layout separado da área administrativa, com navegação própria. */
export function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <Logo to="/admin" />
          <p className="admin-label">Administração</p>
        </div>
        <nav aria-label="Administração">
          <NavLink to="/admin" end>
            <LayoutDashboard size={16} /> Visão geral
          </NavLink>
          <NavLink to="/admin/conteudo">
            <BookOpen size={16} /> Conteúdo
          </NavLink>
          <NavLink to="/admin/usuarios">
            <Users size={16} /> Usuários
          </NavLink>
          <NavLink to="/admin/ebook">
            <ShoppingBag size={16} /> E-book
          </NavLink>
        </nav>
        <nav aria-label="Voltar">
          <NavLink to="/">
            <ArrowLeft size={16} /> Voltar ao site
          </NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
