import React from 'react';
import { CalendarDays, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface YearContextChipProps {
  className?: string;
}

const YearContextChip: React.FC<YearContextChipProps> = ({ className }) => {
  const { selectedAcademicYear } = useAuth();
  
  if (!selectedAcademicYear) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-muted border border-border text-sm font-medium text-muted-foreground',
        'select-none',
        className
      )}
      role="status"
      aria-label={`Academic Year: ${selectedAcademicYear.year} (locked)`}
    >
      <CalendarDays className="w-3.5 h-3.5" />
      <span>AY {selectedAcademicYear.year}</span>
      <Lock className="w-3 h-3 text-muted-foreground/60" />
    </div>
  );
};

export default YearContextChip;
