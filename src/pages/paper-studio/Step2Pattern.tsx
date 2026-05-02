// Step 2 — Paper Pattern / Exam Structure
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaperStudio } from '@/contexts/PaperStudioContext';
import { sumPatternMarks, PatternRow } from '@/types/paperStudio';
import { questionTypeLabels, QuestionType } from '@/types/questionPaper';
import AiStudioLayout from '@/components/paper-studio/AiStudioLayout';
import StepFooter from '@/components/paper-studio/StepFooter';
import NumberPickerPopover from '@/components/paper-studio/NumberPickerPopover';

const COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30];
const MARKS_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
import { aiSuggestPattern } from '@/services/aiPaperStudio';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const QTYPES: QuestionType[] = ['mcq','true-false','fill-blank','match','short-answer','long-answer','case-study'];
const RULES = ['Answer all', 'Internal choice', 'Answer any 5 of 6', 'Answer any K of N', 'Case-study set'];

const nextLabel = (rows: PatternRow[]) => String.fromCharCode(65 + rows.length); // A, B, C…

const Step2Pattern = () => {
  const navigate = useNavigate();
  const { state, setPattern } = usePaperStudio();
  const [loading, setLoading] = useState(false);

  const total = sumPatternMarks(state.pattern);
  const target = state.details.maxMarks;
  const matched = total === target;
  const diff = total - target;

  const update = (id: string, patch: Partial<PatternRow>) => {
    setPattern(state.pattern.map(r => {
      if (r.id !== id) return r;
      const merged = { ...r, ...patch };
      merged.total = merged.count * merged.marksEach;
      return merged;
    }));
  };

  const addRow = () => {
    const newRow: PatternRow = {
      id: `p-${Date.now()}`,
      sectionLabel: nextLabel(state.pattern),
      questionType: 'short-answer',
      count: 1, marksEach: 1, total: 1, rule: 'Answer all',
    };
    setPattern([...state.pattern, newRow]);
  };

  const removeRow = (id: string) => {
    const filtered = state.pattern.filter(r => r.id !== id);
    setPattern(filtered.map((r, i) => ({ ...r, sectionLabel: String.fromCharCode(65 + i) })));
  };

  const handleAiSuggest = async () => {
    setLoading(true);
    try {
      const res = await aiSuggestPattern({
        className: state.details.className,
        subject: state.details.subject,
        maxMarks: state.details.maxMarks,
        duration: state.details.duration,
        examName: state.details.examName,
      });
      if (!res.rows?.length) throw new Error('AI returned no pattern');
      setPattern(res.rows.map((r, i) => ({
        id: `ai-${Date.now()}-${i}`,
        sectionLabel: r.sectionLabel || String.fromCharCode(65 + i),
        questionType: (QTYPES.includes(r.questionType as QuestionType) ? r.questionType : 'short-answer') as QuestionType,
        count: r.count,
        marksEach: r.marksEach,
        total: r.count * r.marksEach,
        rule: r.rule || 'Answer all',
      })));
      toast.success('AI pattern applied', { description: res.rationale });
    } catch (e) {
      toast.error('AI suggestion failed', { description: e instanceof Error ? e.message : 'Try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiStudioLayout currentStep="pattern" onSaveDraft={() => toast.success('Draft saved')}>
      <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
        {/* Header + horizontal Marks Summary */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Paper Pattern</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Define your exam structure. Total recalculates as you edit.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-card card-shadow px-4 py-2.5">
            <Stat label="Target" value={target} />
            <div className="w-px h-8 bg-border" />
            <Stat label="Structure" value={total} />
            <div className="w-px h-8 bg-border" />
            <div className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold',
              matched ? 'bg-success/10 text-success' : 'bg-warning-light text-warning',
            )}>
              {matched ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {matched ? 'Matched' : `${diff > 0 ? 'Over by' : 'Short by'} ${Math.abs(diff)}`}
            </div>
            <div className="w-px h-8 bg-border" />
            <Button onClick={handleAiSuggest} disabled={loading} variant="outline" size="sm" className="border-purple/30 text-purple hover:bg-purple-light">
              {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
              AI Suggest
            </Button>
          </div>
        </div>

        {/* Pattern table — fills remaining space, no scroll */}
        <div className="flex-1 min-h-0 rounded-2xl border bg-card card-shadow overflow-hidden flex flex-col">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 w-20">Section</th>
                <th className="text-left px-4 py-3">Question Type</th>
                <th className="text-left px-4 py-3 w-28">Count</th>
                <th className="text-left px-4 py-3 w-32">Marks Each</th>
                <th className="text-left px-4 py-3 w-24">Total</th>
                <th className="text-left px-4 py-3 w-48">Rule</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {state.pattern.map(row => (
                <tr key={row.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-semibold flex items-center justify-center">{row.sectionLabel}</div>
                  </td>
                  <td className="px-4 py-2">
                    <Select value={row.questionType} onValueChange={v => update(row.id, { questionType: v as QuestionType })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{QTYPES.map(t => <SelectItem key={t} value={t}>{questionTypeLabels[t]}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2">
                    <NumberPickerPopover
                      value={row.count}
                      onChange={n => update(row.id, { count: n })}
                      options={COUNT_OPTIONS}
                      label="Number of questions"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <NumberPickerPopover
                      value={row.marksEach}
                      onChange={n => update(row.id, { marksEach: n })}
                      options={MARKS_OPTIONS}
                      label="Marks per question"
                    />
                  </td>
                  <td className="px-4 py-2 font-semibold tabular-nums">{row.total}</td>
                  <td className="px-4 py-2">
                    <Select value={row.rule} onValueChange={v => update(row.id, { rule: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{RULES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2">
                    <Button variant="ghost" size="icon" onClick={() => removeRow(row.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t p-2 bg-muted/20 mt-auto">
            <Button variant="ghost" size="sm" onClick={addRow}>
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          </div>
        </div>

        <StepFooter
          onBack={() => navigate('/question-papers/ai-studio')}
          onNext={() => navigate('/question-papers/ai-studio/syllabus')}
          nextLabel="Next: Syllabus Coverage"
          nextDisabled={!matched && total === 0}
        />
      </div>
    </AiStudioLayout>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex flex-col items-center px-2">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="text-lg font-bold tabular-nums leading-tight">{value}</span>
  </div>
);

export default Step2Pattern;
