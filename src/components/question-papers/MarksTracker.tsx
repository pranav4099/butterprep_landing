import React from 'react';
import { cn } from '@/lib/utils';
import type { Section } from '@/types/questionPaper';

interface Props {
  targetMarks: number;
  currentMarks: number;
  sections: Section[];
}

const MarksTracker: React.FC<Props> = ({ targetMarks, currentMarks, sections }) => {
  const remaining = targetMarks - currentMarks;
  const percentage = targetMarks > 0 ? Math.min((currentMarks / targetMarks) * 100, 100) : 0;
  const isOver = currentMarks > targetMarks;
  const isMatch = currentMarks === targetMarks;

  return (
    <div className={cn(
      'mb-6 p-3 rounded-lg border flex items-center gap-6',
      isMatch ? 'bg-success-light border-success/30' : isOver ? 'bg-destructive/5 border-destructive/30' : 'bg-card border-border'
    )}>
      {/* Progress bar */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">Marks Progress</span>
          <span className={cn(
            'text-xs font-bold',
            isMatch ? 'text-success' : isOver ? 'text-destructive' : 'text-foreground'
          )}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isMatch ? 'bg-success' : isOver ? 'bg-destructive' : 'bg-purple'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="text-center">
          <p className="text-lg font-bold text-purple">{targetMarks}</p>
          <p className="text-xs text-muted-foreground">Target</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className={cn('text-lg font-bold', isMatch ? 'text-success' : isOver ? 'text-destructive' : 'text-foreground')}>
            {currentMarks}
          </p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className={cn('text-lg font-bold', remaining === 0 ? 'text-success' : remaining < 0 ? 'text-destructive' : 'text-warning')}>
            {Math.abs(remaining)}
          </p>
          <p className="text-xs text-muted-foreground">{remaining >= 0 ? 'Remaining' : 'Over'}</p>
        </div>
      </div>
    </div>
  );
};

export default MarksTracker;
