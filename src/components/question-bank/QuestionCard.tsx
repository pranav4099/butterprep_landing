// QuestionCard — a single question row in the Question Bank list view.
// Shows preview, tags, source/usage, and selection checkbox + row actions.
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, Send, CheckCircle2, Sparkles, FileText, Upload, User } from 'lucide-react';
import { questionTypeLabels } from '@/types/questionPaper';
import { cn } from '@/lib/utils';
import type { BankQuestion } from '@/data/questionBankData';

const sourceMeta: Record<BankQuestion['source'], { label: string; icon: React.ElementType; className: string }> = {
  authored: { label: 'Authored', icon: User, className: 'bg-primary/10 text-primary border-primary/20' },
  ai: { label: 'AI-generated', icon: Sparkles, className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  paper: { label: 'From paper', icon: FileText, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  imported: { label: 'Imported', icon: Upload, className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
};

const visibilityMeta: Record<BankQuestion['visibility'], { label: string; className: string }> = {
  private: { label: 'Private', className: 'bg-muted text-muted-foreground border-border' },
  pending: { label: 'Pending approval', className: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
  approved: { label: 'School Bank', className: 'bg-success/10 text-success border-success/30' },
};

interface Props {
  q: BankQuestion;
  selected?: boolean;
  onToggle?: (id: string) => void;
  onEdit?: (q: BankQuestion) => void;
  onDelete?: (q: BankQuestion) => void;
  onSubmitForApproval?: (q: BankQuestion) => void;
  onApprove?: (q: BankQuestion) => void;
  showCheckbox?: boolean;
}

export const QuestionCard: React.FC<Props> = ({
  q, selected, onToggle, onEdit, onDelete, onSubmitForApproval, onApprove, showCheckbox = true,
}) => {
  const SrcIcon = sourceMeta[q.source].icon;
  return (
    <div className={cn(
      'rounded-xl border bg-card p-4 transition-all',
      selected ? 'border-primary ring-1 ring-primary/30' : 'hover:border-primary/40',
    )}>
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <Checkbox
            checked={!!selected}
            onCheckedChange={() => onToggle?.(q.id)}
            className="mt-1 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed line-clamp-3">{q.text}</p>

          {q.options && q.options.length > 0 && (
            <ul className="mt-2 ml-1 text-xs text-muted-foreground space-y-0.5">
              {q.options.slice(0, 4).map((o, i) => (
                <li key={i} className={cn('truncate', o === q.correctAnswer && 'text-success font-medium')}>
                  {String.fromCharCode(65 + i)}. {o}{o === q.correctAnswer && ' ✓'}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <Badge variant="outline" className="text-[10px]">{questionTypeLabels[q.type]}</Badge>
            <Badge variant="outline" className="text-[10px]">{q.marks} mark{q.marks > 1 ? 's' : ''}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{q.difficulty}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{q.bloomLevel}</Badge>
            <Badge variant="outline" className="text-[10px]">{q.chapter}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/60">
            <Badge variant="outline" className={cn('text-[10px] gap-1', sourceMeta[q.source].className)}>
              <SrcIcon className="w-3 h-3" /> {sourceMeta[q.source].label}
            </Badge>
            <Badge variant="outline" className={cn('text-[10px]', visibilityMeta[q.visibility].className)}>
              {visibilityMeta[q.visibility].label}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              Used in {q.usageCount} paper{q.usageCount === 1 ? '' : 's'}
            </span>
            {q.createdByName && (
              <span className="text-[11px] text-muted-foreground">· by {q.createdByName}</span>
            )}

            <div className="ml-auto flex items-center gap-1">
              {onSubmitForApproval && q.visibility === 'private' && (
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onSubmitForApproval(q)}>
                  <Send className="w-3 h-3" /> Submit
                </Button>
              )}
              {onApprove && q.visibility === 'pending' && (
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-success hover:text-success" onClick={() => onApprove(q)}>
                  <CheckCircle2 className="w-3 h-3" /> Approve
                </Button>
              )}
              {onEdit && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(q)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => onDelete(q)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
