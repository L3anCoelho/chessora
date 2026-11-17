import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import type { AccessLevel } from '@/types/domain';
import { ACCESS_LABEL } from '@/features/premium/access';

type Tone = 'neutral' | 'green' | 'blue' | 'warning' | 'danger';

export function Badge({ tone = 'neutral', children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

const ACCESS_TONE: Record<AccessLevel, Tone> = { public: 'blue', registered: 'blue', premium: 'neutral' };

export function AccessBadge({ access, locked }: { access: AccessLevel; locked?: boolean }) {
  return (
    <Badge tone={ACCESS_TONE[access]} icon={locked ? <Lock size={12} aria-hidden="true" /> : undefined}>
      {ACCESS_LABEL[access]}
    </Badge>
  );
}
