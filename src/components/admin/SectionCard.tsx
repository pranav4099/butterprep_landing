import React from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/**
 * Standard list/section wrapper for admin pages.
 * rounded-2xl + card-shadow + p-5 spec.
 */
const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  toolbar,
  footer,
  className,
  bodyClassName,
  children,
}) => {
  const showHeader = title || description || toolbar;
  return (
    <div className={cn('rounded-2xl border bg-card card-shadow', className)}>
      {showHeader && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-5 pb-3">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {toolbar && <div className="flex items-center gap-2 shrink-0">{toolbar}</div>}
        </div>
      )}
      <div className={cn('p-5', showHeader && 'pt-2', bodyClassName)}>{children}</div>
      {footer && <div className="border-t px-5 py-3">{footer}</div>}
    </div>
  );
};

export default SectionCard;
