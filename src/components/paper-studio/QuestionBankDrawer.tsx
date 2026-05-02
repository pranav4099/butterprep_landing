// Approved Question Bank drawer — pick a vetted question to drop into the paper.
import React, { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, CheckCircle2, BookOpen, Plus } from 'lucide-react';
import { filterBank, questionBankStore, type BankQuestion } from '@/data/questionBankData';
import { questionTypeLabels, type QuestionType } from '@/types/questionPaper';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className: string;
  subject: string;
  // Optional: filter to a specific question type (matches the section the user clicked from)
  preferredType?: QuestionType;
  preferredMarks?: number;
  onPick: (q: BankQuestion) => void;
}

const QuestionBankDrawer: React.FC<Props> = ({ open, onOpenChange, className, subject, preferredType, preferredMarks, onPick }) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>(preferredType || 'all');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const results = useMemo(() => {
    const base = filterBank({
      className,
      subject,
      type: typeFilter === 'all' ? undefined : typeFilter,
      difficulty: difficulty === 'all' ? undefined : difficulty,
      visibility: 'approved',
    });
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(b =>
      b.text.toLowerCase().includes(q) ||
      b.chapter.toLowerCase().includes(q) ||
      b.topic.toLowerCase().includes(q),
    );
  }, [query, typeFilter, difficulty, className, subject]);

  const handlePick = (q: BankQuestion) => {
    questionBankStore.incrementUsage(q.id);
    onPick(q);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <SheetTitle>Approved Question Bank</SheetTitle>
          </div>
          <SheetDescription>
            Replace AI-generated content with vetted questions. {className} · {subject}
          </SheetDescription>
        </SheetHeader>

        {/* Filters */}
        <div className="px-5 py-3 border-b space-y-2 bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by text, chapter, topic..."
              className="pl-9 h-9"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All types</FilterChip>
            {(['mcq','short-answer','long-answer','case-study'] as QuestionType[]).map(t => (
              <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
                {questionTypeLabels[t]}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['all','easy','medium','hard'] as const).map(d => (
              <FilterChip key={d} active={difficulty === d} onClick={() => setDifficulty(d)} variant="muted">
                {d === 'all' ? 'Any difficulty' : d}
              </FilterChip>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-muted-foreground">{results.length} approved question{results.length === 1 ? '' : 's'}</p>
            {results.map(q => (
              <BankCard key={q.id} q={q} preferredMarks={preferredMarks} onPick={() => handlePick(q)} />
            ))}
            {results.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No approved questions match. Try widening filters.
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; variant?: 'default' | 'muted' }> = ({ active, onClick, children, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
      active
        ? variant === 'muted' ? 'bg-foreground text-background border-foreground' : 'bg-primary text-primary-foreground border-primary'
        : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
    )}
  >
    {children}
  </button>
);

const BankCard: React.FC<{ q: BankQuestion; preferredMarks?: number; onPick: () => void }> = ({ q, preferredMarks, onPick }) => {
  const marksMatch = preferredMarks ? q.marks === preferredMarks : true;
  return (
    <div className="rounded-xl border bg-card p-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
        <p className="text-sm text-foreground flex-1">{q.text}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <Badge variant="outline" className="text-[10px]">{questionTypeLabels[q.type]}</Badge>
        <Badge variant="outline" className={cn('text-[10px]', marksMatch ? 'border-success/40 text-success' : 'border-warning/40 text-warning')}>
          {q.marks} mark{q.marks > 1 ? 's' : ''}
        </Badge>
        <Badge variant="outline" className="text-[10px] capitalize">{q.difficulty}</Badge>
        <Badge variant="outline" className="text-[10px]">{q.chapter}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Topic: {q.topic}</span>
        <Button size="sm" variant="outline" onClick={onPick} className="h-7 text-xs">
          <Plus className="w-3 h-3 mr-1" /> Insert
        </Button>
      </div>
    </div>
  );
};

export default QuestionBankDrawer;
