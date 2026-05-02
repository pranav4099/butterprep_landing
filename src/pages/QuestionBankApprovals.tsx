// Admin Question Bank Approvals — review & approve/reject teacher submissions.
// Approving flips visibility to 'approved' (joins School Bank).
// Rejecting flips it back to 'private' (returns to author).
import React, { useState } from 'react';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { questionBankStore, type BankQuestion } from '@/data/questionBankData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import QuestionCard from '@/components/question-bank/QuestionCard';
import { useToast } from '@/hooks/use-toast';

const QuestionBankApprovals: React.FC = () => {
  const { results } = useQuestionBank({ visibility: 'pending' });
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const clear = () => setSelected(new Set());

  const approveOne = (q: BankQuestion) => {
    questionBankStore.update(q.id, { visibility: 'approved' });
    toast({ title: 'Approved into School Bank' });
  };
  const rejectOne = (q: BankQuestion) => {
    questionBankStore.update(q.id, { visibility: 'private' });
    toast({ title: 'Returned to author', description: 'Marked as private again.' });
  };

  const approveBulk = () => {
    questionBankStore.bulkUpdate(Array.from(selected), { visibility: 'approved' });
    toast({ title: `${selected.size} approved` });
    clear();
  };
  const rejectBulk = () => {
    questionBankStore.bulkUpdate(Array.from(selected), { visibility: 'private' });
    toast({ title: `${selected.size} returned to authors` });
    clear();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Question Bank Approvals</h1>
          <p className="text-xs text-muted-foreground">Review teacher submissions before they join the School Bank.</p>
        </div>
        <Badge variant="secondary" className="ml-auto">{results.length} pending</Badge>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-primary/5">
          <span className="text-xs">{selected.size} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1 text-success" onClick={approveBulk}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve all
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive" onClick={rejectBulk}>
              <XCircle className="w-3.5 h-3.5" /> Reject all
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={clear}>Clear</Button>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center">
          <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">No pending submissions</p>
          <p className="text-xs text-muted-foreground mt-1">Teachers' new questions will show up here for review.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {results.map(q => (
            <QuestionCard
              key={q.id}
              q={q}
              selected={selected.has(q.id)}
              onToggle={toggle}
              onApprove={approveOne}
              onDelete={rejectOne}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionBankApprovals;
