import React from 'react';
import { CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MappingStatus = 'mapped' | 'partial' | 'unmapped';

interface StatusBadgeProps {
  status: MappingStatus;
  className?: string;
}

const config: Record<MappingStatus, { label: string; icon: React.ElementType; classes: string }> = {
  mapped: {
    label: 'Mapped',
    icon: CheckCircle2,
    classes: 'bg-success/10 text-success border-success/20',
  },
  partial: {
    label: 'Partial',
    icon: AlertCircle,
    classes: 'bg-warning/10 text-warning border-warning/20',
  },
  unmapped: {
    label: 'Not mapped',
    icon: MinusCircle,
    classes: 'bg-muted text-muted-foreground border-border',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { label, icon: Icon, classes } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        classes,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default StatusBadge;
