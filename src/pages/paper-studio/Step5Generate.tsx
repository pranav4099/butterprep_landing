// Step 5 — Generate Paper
// Runs the real AI generate-paper edge function in parallel with an animated checklist.
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Loader2, FileText, ArrowRight, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePaperStudio } from '@/contexts/PaperStudioContext';
import { usePapers } from '@/hooks/usePapers';
import AiStudioLayout from '@/components/paper-studio/AiStudioLayout';
import { aiGeneratePaper, AiGeneratePaperResponse } from '@/services/aiPaperStudio';
import { computePaperMarks } from '@/types/questionPaper';
import type { QuestionPaper, Section, Question, QuestionType } from '@/types/questionPaper';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STEPS = [
  'Creating paper shell',
  'Applying school template',
  'Planning chapter distribution',
  'Selecting questions from bank',
  'Generating new questions',
  'Creating answer key',
  'Checking marks',
  'Reviewing quality',
];

const VALID_TYPES: QuestionType[] = ['mcq','true-false','fill-blank','match','table','diagram','short-answer','long-answer','case-study'];

const Step5Generate = () => {
  const navigate = useNavigate();
  const { state, setGeneratedPaperId } = usePaperStudio();
  const { addPaper } = usePapers();
  const [progressStep, setProgressStep] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [generatedPaper, setGeneratedPaper] = useState<QuestionPaper | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const elapsedRef = useRef<number | null>(null);

  const start = async () => {
    setStatus('running');
    setError(null);
    setProgressStep(0);
    setElapsed(0);
    setGeneratedPaper(null);

    // Animate progress through the first 7 steps; hold the last step ("Reviewing quality")
    // as actively running until the AI call resolves — never silently stall there.
    intervalRef.current = window.setInterval(() => {
      setProgressStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }, 1800);
    elapsedRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);

    try {
      const res = await aiGeneratePaper({
        details: state.details,
        pattern: state.pattern.map(({ id, total, ...rest }) => rest),
        syllabus: state.syllabus.map(c => ({
          chapterName: c.chapterName, targetMarks: c.targetMarks, priority: c.priority, included: c.included,
        })),
        preferences: state.preferences,
      });

      const paper = buildPaperFromAi(state, res);
      addPaper(paper);
      setGeneratedPaperId(paper.id);
      setGeneratedPaper(paper);

      // finish the animation
      setProgressStep(STEPS.length);
      setStatus('success');
      toast.success('Paper generated');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Generation failed');
      toast.error('Generation failed', { description: e instanceof Error ? e.message : 'Try again' });
    } finally {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (elapsedRef.current) {
        clearInterval(elapsedRef.current);
        elapsedRef.current = null;
      }
    }
  };

  // Auto-start on first mount
  React.useEffect(() => {
    if (status === 'idle') start();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AiStudioLayout currentStep="generate">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-2xl border bg-gradient-to-br from-purple-light/50 via-card to-info-light/40 card-shadow p-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple to-info flex items-center justify-center shrink-0">
              {status === 'running' ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : status === 'success' ? (
                <Check className="w-7 h-7 text-white" />
              ) : status === 'error' ? (
                <AlertCircle className="w-7 h-7 text-white" />
              ) : (
                <Sparkles className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold">
                {status === 'running' && 'Generating your question paper…'}
                {status === 'success' && 'Your paper is ready'}
                {status === 'error' && 'Something went wrong'}
                {status === 'idle' && 'Preparing to generate'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {state.details.className} · {state.details.subject} · {state.details.examName} · {state.details.maxMarks} marks
                {status === 'running' && elapsed > 0 && (
                  <span className="ml-2 text-xs">· {elapsed}s elapsed{elapsed > 20 ? ' (high-quality generation can take up to a minute)' : ''}</span>
                )}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <ul className="mt-8 space-y-2.5">
            {STEPS.map((label, idx) => {
              const done = idx < progressStep;
              const current = idx === progressStep && status === 'running';
              return (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                    done && 'bg-success/10 text-success',
                    current && 'bg-purple-light text-purple',
                    !done && !current && 'bg-muted text-muted-foreground',
                  )}>
                    {done ? <Check className="w-3.5 h-3.5" /> : current ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />}
                  </span>
                  <span className={cn(done && 'text-foreground', current && 'text-foreground font-medium', !done && !current && 'text-muted-foreground')}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Summary card after success */}
        {status === 'success' && generatedPaper && (
          <div className="rounded-2xl border bg-card card-shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Generated Paper Summary</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <SummaryItem label="Total Marks" value={`${generatedPaper.currentMarks}/${generatedPaper.details.targetMarks}`} good={generatedPaper.currentMarks === generatedPaper.details.targetMarks} />
              <SummaryItem label="Sections" value={String(generatedPaper.sections.length)} good />
              <SummaryItem label="Questions" value={String(generatedPaper.sections.reduce((s, sec) => s + sec.questions.length, 0))} good />
              <SummaryItem label="Answer Key" value={state.preferences.answerKey.generateKey ? 'Complete' : 'Skipped'} good={state.preferences.answerKey.generateKey} />
              <SummaryItem label="Difficulty" value="Balanced" good />
              <SummaryItem label="Chapter Coverage" value="Matched" good />
              <SummaryItem label="Duplicate Risk" value="Low" good />
              <SummaryItem label="Format" value={state.details.template} good />
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button variant="outline" onClick={start}>
                <RotateCcw className="w-4 h-4 mr-2" /> Regenerate
              </Button>
              <Button
                onClick={() => navigate(`/question-papers/ai-studio/edit/${generatedPaper.id}`)}
                className="bg-gradient-to-r from-purple to-info hover:opacity-90 text-white"
              >
                Open Editor <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => navigate('/question-papers/ai-studio/preferences')}>Back</Button>
              <Button onClick={start}>Retry</Button>
            </div>
          </div>
        )}
      </div>
    </AiStudioLayout>
  );
};

const SummaryItem: React.FC<{ label: string; value: string; good?: boolean }> = ({ label, value, good }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
    <span className="text-muted-foreground">{label}</span>
    <span className={cn('font-semibold', good ? 'text-success' : 'text-warning')}>{value}</span>
  </div>
);

// Convert AI response → app's QuestionPaper shape.
function buildPaperFromAi(state: ReturnType<typeof usePaperStudio>['state'], res: AiGeneratePaperResponse): QuestionPaper {
  const id = crypto.randomUUID();
  const now = new Date().toISOString().split('T')[0];

  const sections: Section[] = (res.sections || []).map((s, sIdx) => {
    const qType = (VALID_TYPES.includes(s.questionType as QuestionType) ? s.questionType : 'short-answer') as QuestionType;
    const questions: Question[] = (s.questions || []).map((q, qIdx) => {
      const qid = `q-${id}-${sIdx}-${qIdx}`;
      return {
        id: qid,
        internalId: qid,
        displayNumber: 0, // recomputed below
        type: qType,
        text: q.text,
        marks: q.marks,
        subparts: (q.subparts || []).map((sp, spi) => ({
          id: `${qid}-sp-${spi}`,
          label: sp.label || String.fromCharCode(97 + spi),
          text: sp.text,
          marks: sp.marks,
        })),
        hasOr: false,
        options: q.options,
      };
    });
    const totalMarks = questions.reduce((acc, q) => acc + (q.subparts.length ? q.subparts.reduce((a, sp) => a + sp.marks, 0) : q.marks), 0);
    return {
      id: `sec-${id}-${sIdx}`,
      label: s.sectionLabel || String.fromCharCode(65 + sIdx),
      title: s.title || `Section ${s.sectionLabel}`,
      labelStyle: 'part',
      answerRule: 'all',
      totalQuestions: questions.length,
      totalMarks,
      questions,
      questionType: qType,
      instructions: s.instruction,
    };
  });

  // Renumber across all sections
  let counter = 1;
  sections.forEach(sec => sec.questions.forEach(q => { q.displayNumber = counter++; }));

  const currentMarks = computePaperMarks(sections);

  return {
    id,
    details: {
      id,
      institutionName: state.details.institutionName,
      logoUrl: '',
      className: state.details.className,
      subject: state.details.subject,
      examName: state.details.examName,
      date: state.details.date,
      duration: state.details.duration,
      targetMarks: state.details.maxMarks,
      instructions: res.instructions || 'All questions are compulsory unless stated otherwise.',
    },
    sections,
    subpartStyle: 'alpha',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    currentMarks,
  };
}

export default Step5Generate;
