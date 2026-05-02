// AI Paper Studio — right-side editor panel with 4 tabs:
// Assistant (per-question AI actions), Validate (deterministic + AI), Bank (open drawer), Settings.
import React, { useMemo, useState } from 'react';
import { Sparkles, ShieldCheck, BookOpen, Settings2, Loader2, Check, AlertTriangle, Wand2, Languages, RotateCcw, Key, ChevronRight, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Section, Question, PaperDetails } from '@/types/questionPaper';
import { validatePaper, computePaperMarks } from '@/types/questionPaper';
import { aiQuestionAction, aiValidatePaper, type AiValidatePaperResponse } from '@/services/aiPaperStudio';
import { toast } from 'sonner';

interface Props {
  details: PaperDetails;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  onOpenBank: (preferredType?: string, preferredMarks?: number) => void;
}

type TabKey = 'assistant' | 'validate' | 'bank' | 'settings';

const StudioEditorPanel: React.FC<Props> = ({ details, sections, setSections, onOpenBank }) => {
  const [tab, setTab] = useState<TabKey>('assistant');
  const [selectedQId, setSelectedQId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const allQuestions = useMemo(
    () => sections.flatMap(s => s.questions.map(q => ({ section: s, question: q }))),
    [sections],
  );

  const selected = useMemo(() => allQuestions.find(x => x.question.id === selectedQId) || allQuestions[0], [allQuestions, selectedQId]);

  // Deterministic warnings
  const warnings = useMemo(() => validatePaper(details, sections), [details, sections]);
  const totalMarks = computePaperMarks(sections);
  const onTarget = totalMarks === details.targetMarks;

  // AI validation state
  const [aiResult, setAiResult] = useState<AiValidatePaperResponse | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const runAiValidate = async () => {
    setAiBusy(true);
    try {
      const summary = sections.map(s =>
        `Section ${s.label} (${s.questionType}, ${s.questions.length} q): ` +
        s.questions.map(q => `[${q.marks}m] ${q.text.slice(0, 80)}`).join(' | ')
      ).join('\n');

      const includedChapters = Array.from(new Set(
        sections.flatMap(s => s.questions.map(q => (q as any).chapter || '').filter(Boolean))
      ));
      const res = await aiValidatePaper({
        className: details.className,
        subject: details.subject,
        paperSummary: summary || 'Empty paper',
        includedChapters,
      });
      setAiResult(res);
      toast.success('AI review complete');
    } catch (e) {
      toast.error('AI validation failed', { description: e instanceof Error ? e.message : 'Try again' });
    } finally {
      setAiBusy(false);
    }
  };

  const updateQuestion = (sectionId: string, questionId: string, patch: Partial<Question>) => {
    setSections(prev => prev.map(s => s.id !== sectionId ? s : {
      ...s,
      questions: s.questions.map(q => q.id === questionId ? { ...q, ...patch } : q),
    }));
  };

  const runQuestionAction = async (action: 'improve' | 'regenerate' | 'translate' | 'answer-key', targetLanguage?: string) => {
    if (!selected) return;
    const { section, question } = selected;
    setBusyAction(action);
    try {
      const res = await aiQuestionAction({
        action,
        className: details.className,
        subject: details.subject,
        questionText: question.text,
        questionType: question.type,
        marks: question.marks,
        chapter: (question as any).chapter,
        difficulty: (question as any).difficulty,
        targetLanguage,
      });

      const patch: Partial<Question> = {};
      if (res.text && (action === 'improve' || action === 'regenerate' || action === 'translate')) {
        patch.text = res.text;
      }
      if (res.options) patch.options = res.options;
      if (action === 'answer-key') {
        const meta = (question as any).answerKey || {};
        (patch as any).answerKey = {
          ...meta,
          correctAnswer: res.correctAnswer ?? meta.correctAnswer,
          expectedAnswer: res.expectedAnswer ?? meta.expectedAnswer,
          stepMarking: res.stepMarking ?? meta.stepMarking,
          commonMistakes: res.commonMistakes ?? meta.commonMistakes,
        };
        // Render in question.note for visibility
        if (res.expectedAnswer || res.correctAnswer) {
          patch.note = `Answer: ${res.correctAnswer || res.expectedAnswer}`;
        }
      }

      updateQuestion(section.id, question.id, patch);
      toast.success(actionLabel(action) + ' complete');
    } catch (e) {
      toast.error(actionLabel(action) + ' failed', { description: e instanceof Error ? e.message : 'Try again' });
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2 bg-gradient-to-r from-purple-light/40 to-info-light/40">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple to-info flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">AI Paper Studio</p>
          <p className="text-[11px] text-muted-foreground">Editor assistant</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as TabKey)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-4 mx-3 mt-3 h-9">
          <TabsTrigger value="assistant" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />Assist</TabsTrigger>
          <TabsTrigger value="validate" className="text-xs"><ShieldCheck className="w-3 h-3 mr-1" />Check</TabsTrigger>
          <TabsTrigger value="bank" className="text-xs"><BookOpen className="w-3 h-3 mr-1" />Bank</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs"><Settings2 className="w-3 h-3 mr-1" />More</TabsTrigger>
        </TabsList>

        {/* ===== ASSISTANT ===== */}
        <TabsContent value="assistant" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                The teacher controls the plan. ButterPrep AI fills the paper.
              </div>

              {/* Question selector */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pick a question</Label>
                <ScrollArea className="h-44 mt-2 rounded-lg border bg-muted/20">
                  <div className="p-1.5 space-y-0.5">
                    {allQuestions.map(({ section, question }) => (
                      <button
                        key={question.id}
                        onClick={() => setSelectedQId(question.id)}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-start gap-2 transition-colors',
                          selected?.question.id === question.id
                            ? 'bg-primary/10 text-foreground border border-primary/30'
                            : 'hover:bg-accent text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <Badge variant="outline" className="text-[10px] shrink-0 px-1.5">
                          {section.label}.{question.displayNumber}
                        </Badge>
                        <span className="line-clamp-2 flex-1">{question.text || <em className="opacity-60">empty</em>}</span>
                      </button>
                    ))}
                    {allQuestions.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6">No questions yet</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Selected preview */}
              {selected && (
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Badge className="bg-purple-light text-purple text-[10px]">Section {selected.section.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{selected.question.marks}m</Badge>
                  </div>
                  <p className="text-sm leading-snug line-clamp-3">{selected.question.text || <em className="text-muted-foreground">No text yet</em>}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI actions</Label>
                <ActionButton
                  icon={Wand2}
                  label="Improve wording"
                  hint="Make it clearer, exam-friendly"
                  busy={busyAction === 'improve'}
                  disabled={!selected || !!busyAction}
                  onClick={() => runQuestionAction('improve')}
                />
                <ActionButton
                  icon={RotateCcw}
                  label="Regenerate question"
                  hint="Same chapter, same marks"
                  busy={busyAction === 'regenerate'}
                  disabled={!selected || !!busyAction}
                  onClick={() => runQuestionAction('regenerate')}
                />
                <ActionButton
                  icon={Languages}
                  label="Translate to Hindi"
                  hint="Bilingual exam support"
                  busy={busyAction === 'translate'}
                  disabled={!selected || !!busyAction}
                  onClick={() => runQuestionAction('translate', 'Hindi')}
                />
                <ActionButton
                  icon={Key}
                  label="Generate answer key"
                  hint="Step marking + common mistakes"
                  busy={busyAction === 'answer-key'}
                  disabled={!selected || !!busyAction}
                  onClick={() => runQuestionAction('answer-key')}
                />
                <ActionButton
                  icon={BookOpen}
                  label="Replace from Bank"
                  hint="Use an approved question"
                  disabled={!selected}
                  onClick={() => onOpenBank(selected?.question.type, selected?.question.marks)}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ===== VALIDATE ===== */}
        <TabsContent value="validate" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Marks summary */}
              <div className={cn(
                'rounded-xl p-3 border flex items-center gap-3',
                onTarget ? 'border-success/40 bg-success/5' : 'border-warning/40 bg-warning/5',
              )}>
                {onTarget ? <Check className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {onTarget ? 'Your structure matches the target marks.' : `${totalMarks}/${details.targetMarks} marks`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {onTarget ? 'No marks adjustment needed.' : `${Math.abs(details.targetMarks - totalMarks)} marks ${totalMarks > details.targetMarks ? 'over' : 'remaining'}.`}
                  </p>
                </div>
              </div>

              {/* Deterministic checks */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Structural checks</Label>
                <div className="mt-2 space-y-1.5">
                  {warnings.length === 0 ? (
                    <div className="rounded-lg border border-success/30 bg-success/5 p-2.5 flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span>All structural checks passed.</span>
                    </div>
                  ) : (
                    warnings.map((w, i) => (
                      <div key={i} className={cn(
                        'rounded-lg border p-2.5 text-xs flex gap-2',
                        w.type === 'error' ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5',
                      )}>
                        <AlertTriangle className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', w.type === 'error' ? 'text-destructive' : 'text-warning')} />
                        <span>{w.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI quality review */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI quality review</Label>
                  <Button size="sm" variant="outline" onClick={runAiValidate} disabled={aiBusy} className="h-7 text-xs">
                    {aiBusy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    {aiResult ? 'Re-run' : 'Run AI check'}
                  </Button>
                </div>

                {!aiResult && !aiBusy && (
                  <p className="text-xs text-muted-foreground italic">Run an AI review to evaluate clarity, syllabus match, duplicate risk, and difficulty balance.</p>
                )}

                {aiResult && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      <SummaryPill label="Wording" value={aiResult.summary.wordingClarity} good={['good'].includes(aiResult.summary.wordingClarity)} />
                      <SummaryPill label="Syllabus" value={aiResult.summary.syllabusMatch} good={aiResult.summary.syllabusMatch === 'matched'} />
                      <SummaryPill label="Duplicates" value={aiResult.summary.duplicateRisk} good={aiResult.summary.duplicateRisk === 'low'} />
                      <SummaryPill label="Balance" value={aiResult.summary.difficultyBalance} good={aiResult.summary.difficultyBalance === 'balanced'} />
                    </div>
                    {aiResult.issues.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        {aiResult.issues.map((iss, i) => (
                          <div key={i} className={cn(
                            'rounded-lg border p-2.5 text-xs',
                            iss.severity === 'error' ? 'border-destructive/30 bg-destructive/5' :
                            iss.severity === 'warning' ? 'border-warning/30 bg-warning/5' :
                            'border-info/30 bg-info-light/30',
                          )}>
                            <p className="font-medium">{iss.message}</p>
                            {iss.suggestedFix && (
                              <p className="text-muted-foreground mt-1 flex gap-1"><ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />{iss.suggestedFix}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ===== BANK ===== */}
        <TabsContent value="bank" className="flex-1 m-0 min-h-0">
          <div className="p-4 space-y-3">
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex gap-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Replace this with an approved question from the bank.
            </div>
            <Button
              className="w-full bg-gradient-to-r from-purple to-info text-white hover:opacity-90"
              onClick={() => onOpenBank()}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Question Bank
            </Button>
            <div className="text-xs text-muted-foreground space-y-1.5 pt-2">
              <p className="font-medium text-foreground">What you can do:</p>
              <ul className="space-y-1 pl-1">
                <li>• Filter by chapter, difficulty, marks, type</li>
                <li>• Insert into any section in one click</li>
                <li>• Vetted by your subject teachers</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* ===== SETTINGS ===== */}
        <TabsContent value="settings" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Display</Label>
                <div className="mt-2 space-y-2.5">
                  <SettingRow label="Show difficulty tags" hint="Display E/M/H next to each question" defaultOn />
                  <SettingRow label="Show chapter labels" hint="Helpful while editing, hidden on print" defaultOn />
                  <SettingRow label="Compact spacing" hint="Fit more on each page" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Answer key</Label>
                <div className="mt-2 space-y-2.5">
                  <SettingRow label="Generate as separate document" hint="Export key separately" defaultOn />
                  <SettingRow label="Include step marking" hint="For long answer questions" defaultOn />
                  <SettingRow label="Include common mistakes" hint="Helpful for the evaluating teacher" defaultOn />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Export</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" disabled>PDF</Button>
                  <Button variant="outline" size="sm" disabled>DOCX</Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">Export available after assignment.</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ActionButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, hint, busy, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled || busy}
    className={cn(
      'w-full text-left rounded-lg border p-2.5 flex items-start gap-2.5 transition-all',
      'hover:border-purple/40 hover:bg-purple-light/30',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border',
    )}
  >
    <div className="w-7 h-7 rounded-md bg-purple-light text-purple flex items-center justify-center shrink-0">
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-foreground">{label}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  </button>
);

const SummaryPill: React.FC<{ label: string; value: string; good: boolean }> = ({ label, value, good }) => (
  <div className={cn(
    'rounded-lg p-2 border text-xs',
    good ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5',
  )}>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={cn('font-semibold capitalize', good ? 'text-success' : 'text-warning')}>{value}</p>
  </div>
);

const SettingRow: React.FC<{ label: string; hint?: string; defaultOn?: boolean }> = ({ label, hint, defaultOn }) => {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border p-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
};

const actionLabel = (a: string) => a === 'answer-key' ? 'Answer key' : a.charAt(0).toUpperCase() + a.slice(1);

export default StudioEditorPanel;
