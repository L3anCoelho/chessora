import type { ReactNode } from 'react';
import { LogoMark } from '@/components/ui/Logo';

export function AuthCard({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="container page auth-page">
      <div className="auth-card panel">
        <div className="auth-head">
          <LogoMark size={32} />
          <h1>{title}</h1>
          {description && <p className="muted">{description}</p>}
        </div>
        {children}
      </div>
      {footer && <div className="auth-footer">{footer}</div>}
    </div>
  );
}

/** Aceita apenas caminhos internos do site como destino depois do login. */
export function safeRedirect(value: string | null, fallback = '/progresso'): string {
  if (!value) return fallback;
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('://') ? value : fallback;
}
