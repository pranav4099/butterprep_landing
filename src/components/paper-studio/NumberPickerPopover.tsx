// Popover-based number picker with ButterPrep-styled buttons.
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  onChange: (n: number) => void;
  options: number[];
  label?: string;
  className?: string;
}

const NumberPickerPopover: React.FC<Props> = ({ value, onChange, options, label, className }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'h-9 w-full px-3 rounded-lg border border-input bg-background',
            'flex items-center justify-between gap-2 text-sm font-semibold tabular-nums',
            'hover:border-primary/40 hover:bg-primary/5 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/30',
            className,
          )}
        >
          <span>{value}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        {label && (
          <div className="text-xs font-medium text-muted-foreground mb-2 px-1">{label}</div>
        )}
        <div className="grid grid-cols-5 gap-1.5 max-w-[220px]">
          {options.map(opt => {
            const active = opt === value;
            return (
              <Button
                key={opt}
                type="button"
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={cn(
                  'h-9 w-9 p-0 text-sm font-semibold tabular-nums rounded-lg',
                  active && 'bg-primary text-primary-foreground shadow-sm',
                  !active && 'hover:border-primary/40 hover:text-primary hover:bg-primary/5',
                )}
              >
                {opt}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NumberPickerPopover;
