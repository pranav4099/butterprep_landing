import React from 'react';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SubjectChipState = 'compulsory' | 'optional-active' | 'unselected' | 'disabled';

interface SubjectChipProps {
  name: string;
  state: SubjectChipState;
  onClick?: () => void;
  className?: string;
}

const stateStyles: Record<SubjectChipState, string> = {
  compulsory:
    'bg-teal text-teal-foreground border-teal shadow-sm cursor-default',
  'optional-active':
    'bg-sky/10 text-sky border-sky/50 hover:bg-sky/20 cursor-pointer',
  unselected:
    'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground cursor-pointer',
  disabled:
    'bg-muted/30 text-muted-foreground/40 border-border/50 cursor-not-allowed opacity-60',
};

const SubjectChip: React.FC<SubjectChipProps> = ({ name, state, onClick, className }) => {
  const isInteractive = state === 'optional-active' || state === 'unselected';

  return (
    <button
      type="button"
      onClick={isInteractive ? onClick : undefined}
      disabled={state === 'disabled'}
      aria-pressed={state === 'compulsory' || state === 'optional-active'}
      aria-label={
        state === 'compulsory'
          ? `${name} (compulsory, locked)`
          : state === 'optional-active'
          ? `${name} (optional, selected)`
          : state === 'disabled'
          ? `${name} (not available)`
          : `${name} (not selected)`
      }
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium',
        'transition-all duration-150 border select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        stateStyles[state],
        className
      )}
    >
      {state === 'compulsory' && <Lock className="w-3 h-3" />}
      {state === 'optional-active' && <Check className="w-3.5 h-3.5" />}
      {name}
    </button>
  );
};

export default SubjectChip;
