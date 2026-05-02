// Step 4 — Question Preferences
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Sparkles, Brain, History, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { usePaperStudio } from '@/contexts/PaperStudioContext';
import { GenerationSource } from '@/types/paperStudio';
import AiStudioLayout from '@/components/paper-studio/AiStudioLayout';
import StepFooter from '@/components/paper-studio/StepFooter';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SOURCES: { value: GenerationSource; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'bank-only', label: 'Approved Question Bank Only', description: 'Use only pre-approved questions from your bank.', icon: Database },
  { value: 'bank-plus-ai', label: 'Question Bank + AI Generated', description: 'Mix approved questions with fresh AI-generated ones.', icon: Sparkles },
  { value: 'ai-fresh', label: 'Generate Fresh with AI', description: 'All-new questions tailored to this paper.', icon: Brain },
  { value: 'similar-to-previous', label: 'Similar to Previous Paper', description: 'Match the pattern of a recent paper.', icon: History },
];

const STYLE_OPTIONS = [
  { id: 'conceptual', label: 'Conceptual' },
  { id: 'application-based', label: 'Application-based' },
  { id: 'competency-based', label: 'Competency-based' },
  { id: 'numerical', label: 'Numerical' },
  { id: 'diagram-based', label: 'Diagram-based' },
  { id: 'case-based', label: 'Case-based' },
];

const AVOID_OPTIONS = [
  { id: 'last-exam', label: 'Questions used in last exam' },
  { id: 'repeated-concepts', label: 'Repeated concepts' },
  { id: 'out-of-syllabus', label: 'Out-of-syllabus questions' },
  { id: 'too-many-from-one-chapter', label: 'Too many questions from one chapter' },
];

const Step4Preferences = () => {
  const navigate = useNavigate();
  const { state, setPreferences } = usePaperStudio();
  const p = state.preferences;

  const setDifficulty = (key: 'easy' | 'medium' | 'hard', value: number) => {
    setPreferences({ difficulty: { ...p.difficulty, [key]: value } });
  };

  const toggleStyle = (id: string) => {
    setPreferences({ styles: p.styles.includes(id) ? p.styles.filter(s => s !== id) : [...p.styles, id] });
  };

  const toggleAvoid = (id: string) => {
    setPreferences({ avoid: p.avoid.includes(id) ? p.avoid.filter(s => s !== id) : [...p.avoid, id] });
  };

  const totalDifficulty = p.difficulty.easy + p.difficulty.medium + p.difficulty.hard;
  const balanced = totalDifficulty === 100;

  return (
    <AiStudioLayout currentStep="preferences" onSaveDraft={() => toast.success('Draft saved')}>
      <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
        {/* Header + horizontal summary bar */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Question Preferences</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tell ButterPrep how to generate the paper.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-card card-shadow px-4 py-2.5">
            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Difficulty</span>
              <span className="text-base font-bold tabular-nums leading-tight">{totalDifficulty}%</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold',
              balanced ? 'bg-success/10 text-success' : 'bg-warning-light text-warning',
            )}>
              {balanced ? 'Balanced 100%' : `${totalDifficulty > 100 ? 'Over' : 'Short'} ${Math.abs(100 - totalDifficulty)}%`}
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Source */}
            <Card title="Question Source">
              <div className="grid grid-cols-1 gap-2">
                {SOURCES.map(s => {
                  const Icon = s.icon;
                  const selected = p.source === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setPreferences({ source: s.value })}
                      className={cn(
                        'text-left p-3 rounded-xl border-2 transition-all',
                        selected ? 'border-purple bg-purple-light/40' : 'border-border hover:border-input bg-card',
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          selected ? 'bg-gradient-to-br from-purple to-info text-white' : 'bg-muted text-muted-foreground')}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{s.label}</p>
                            {selected && <Check className="w-3.5 h-3.5 text-purple" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Difficulty */}
            <Card title="Difficulty Distribution" right={
              <span className={cn('text-xs font-semibold px-2 py-1 rounded-md',
                balanced ? 'bg-success/10 text-success' : 'bg-warning-light text-warning')}>
                {totalDifficulty}% / 100%
              </span>
            }>
              <div className="space-y-4">
                {(['easy','medium','hard'] as const).map(key => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{key}</span>
                      <span className="tabular-nums text-muted-foreground">{p.difficulty[key]}%</span>
                    </div>
                    <Slider min={0} max={100} step={5} value={[p.difficulty[key]]}
                            onValueChange={v => setDifficulty(key, v[0])} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Styles */}
            <Card title="Question Style">
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map(o => (
                  <label key={o.id} className="flex items-center gap-2 p-2.5 rounded-lg border hover:bg-muted/30 cursor-pointer">
                    <Checkbox checked={p.styles.includes(o.id)} onCheckedChange={() => toggleStyle(o.id)} />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Avoid */}
            <Card title="Avoid">
              <div className="grid grid-cols-1 gap-2">
                {AVOID_OPTIONS.map(o => (
                  <label key={o.id} className="flex items-center gap-2 p-2.5 rounded-lg border hover:bg-muted/30 cursor-pointer">
                    <Checkbox checked={p.avoid.includes(o.id)} onCheckedChange={() => toggleAvoid(o.id)} />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Answer key — full width */}
            <div className="lg:col-span-2">
              <Card title="Answer Key Options">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'generateKey', label: 'Generate answer key' },
                    { key: 'stepMarking', label: 'Generate step marking' },
                    { key: 'rubric', label: 'Generate rubric' },
                    { key: 'commonMistakes', label: 'Generate common mistakes' },
                  ].map(o => (
                    <div key={o.key} className="flex items-center justify-between p-2.5 rounded-lg border">
                      <span className="text-sm">{o.label}</span>
                      <Switch
                        checked={p.answerKey[o.key as keyof typeof p.answerKey]}
                        onCheckedChange={v => setPreferences({ answerKey: { ...p.answerKey, [o.key]: v } })}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <StepFooter
          onBack={() => navigate('/question-papers/ai-studio/syllabus')}
          onNext={() => navigate('/question-papers/ai-studio/generate')}
          nextLabel="Generate Paper"
          nextDisabled={!balanced}
        />
      </div>
    </AiStudioLayout>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div className="rounded-2xl border bg-card card-shadow p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-sm">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

export default Step4Preferences;
