import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export function Spinner({ size = 20, label }: { size?: number; label?: string }) {
  return (
    <span className="spinner" style={{ width: size, height: size }} role={label ? 'status' : undefined}>
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="state state-loading" role="status" aria-live="polite">
      <Spinner size={28} />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="state state-empty">
      {icon && <div className="state-icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p className="muted">{description}</p>}
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="state state-error" role="alert">
      <div className="state-icon">
        <XCircle size={28} />
      </div>
      <h3>{title}</h3>
      {description && <p className="muted">{description}</p>}
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

type Tone = 'info' | 'success' | 'warning' | 'danger';

const NOTICE_ICON: Record<Tone, ReactNode> = {
  info: <Info size={18} />,
  success: <CheckCircle2 size={18} />,
  warning: <AlertTriangle size={18} />,
  danger: <XCircle size={18} />,
};

/** Aviso em linha, para mensagens dentro de páginas e formulários. */
export function Notice({ tone = 'info', title, children }: { tone?: Tone; title?: string; children?: ReactNode }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === 'danger' ? 'alert' : 'note'}>
      <span className="notice-icon">{NOTICE_ICON[tone]}</span>
      <div>
        {title && <strong className="notice-title">{title}</strong>}
        {children && <div className="notice-body">{children}</div>}
      </div>
    </div>
  );
}
