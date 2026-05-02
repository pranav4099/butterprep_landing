// Step 3 — Syllabus Coverage (3 sub-steps)
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Sparkles, Loader2, CheckCircle2, AlertCircle,
  BookOpen, ListTree, Scale, Check, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaperStudio } from '@/contexts/PaperStudioContext';
import { ChapterSelection, TopicSelection, Difficulty } from '@/types/paperStudio';
import AiStudioLayout from '@/components/paper-studio/AiStudioLayout';
import StepFooter from '@/components/paper-studio/StepFooter';
import NumberPickerPopover from '@/components/paper-studio/NumberPickerPopover';
import { aiDistributeSyllabus } from '@/services/aiPaperStudio';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CHAPTER_MARKS_OPTIONS = [0, 2, 4, 5, 6, 8, 10, 12, 15, 18, 20, 25, 30];
const TOPIC_MARKS_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15];

type SubStep = 'chapters' | 'topics' | 'weightage';

const sumIncluded = (chapters: ChapterSelection[]) =>
  chapters.filter(c => c.included).reduce((sum, c) => sum + c.targetMarks, 0);

const Step3Syllabus = () => {
  const navigate = useNavigate();
  const { state, setSyllabus } = usePaperStudio();
  const [sub, setSub] = useState<SubStep>('chapters');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const total = sumIncluded(state.syllabus);
  const target = state.details.maxMarks;
  const matched = total === target;

  const includedChapters = state.syllabus.filter(c => c.included);
  const topicsCount = includedChapters.reduce((s, c) => s + c.topicSelections.filter(t => t.included).length, 0);

  const filteredAll = useMemo(() => state.syllabus.filter(c =>
    !search || c.chapterName.toLowerCase().includes(search.toLowerCase())
  ), [state.syllabus, search]);

  const updateChapter = (id: string, patch: Partial<ChapterSelection>) => {
    setSyllabus(state.syllabus.map(c => c.chapterId === id ? { ...c, ...patch } : c));
  };

  const updateTopic = (chapterId: string, topicName: string, patch: Partial<TopicSelection>) => {
    setSyllabus(state.syllabus.map(c => {
      if (c.chapterId !== chapterId) return c;
      const topicSelections = c.topicSelections.map(t =>
        t.name === topicName ? { ...t, ...patch } : t
      );
      const topicMarksSum = topicSelections
        .filter(t => t.included)
        .reduce((s, t) => s + t.targetMarks, 0);
      const targetMarks = topicMarksSum > 0 ? topicMarksSum : c.targetMarks;
      return { ...c, topicSelections, targetMarks };
    }));
  };

  const toggleAllChapters = (on: boolean) => {
    setSyllabus(state.syllabus.map(c => ({ ...c, included: on })));
  };

  const toggleAllTopicsInChapter = (chapterId: string, on: boolean) => {
    setSyllabus(state.syllabus.map(c =>
      c.chapterId === chapterId
        ? { ...c, topicSelections: c.topicSelections.map(t => ({ ...t, included: on })) }
        : c
    ));
  };

  const handleAutoDistribute = async () => {
    setLoading(true);
    try {
      const res = await aiDistributeSyllabus({
        className: state.details.className,
        subject: state.details.subject,
        maxMarks: state.details.maxMarks,
        chapters: includedChapters.map(c => ({
          chapterId: c.chapterId, chapterName: c.chapterName, priority: c.priority, included: c.included,
        })),
      });
      const map = new Map(res.allocations.map(a => [a.chapterId, a.targetMarks]));
      setSyllabus(state.syllabus.map(c => {
        const newMarks = map.get(c.chapterId) ?? c.targetMarks;
        const includedTopics = c.topicSelections.filter(t => t.included);
        const n = includedTopics.length;
        // Distribute chapter marks across included topics, remainder on first topics
        const base = n > 0 ? Math.floor(newMarks / n) : 0;
        const remainder = n > 0 ? newMarks - base * n : 0;
        let i = 0;
        const topicSelections = c.topicSelections.map(t => {
          if (!t.included) return { ...t, targetMarks: 0 };
          const extra = i < remainder ? 1 : 0;
          i += 1;
          return { ...t, targetMarks: base + extra };
        });
        return { ...c, targetMarks: newMarks, topicSelections };
      }));
      toast.success('Marks redistributed by AI');
    } catch (e) {
      toast.error('AI distribution failed', { description: e instanceof Error ? e.message : 'Try again' });
    } finally {
      setLoading(false);
    }
  };

  const allChaptersOn = state.syllabus.every(c => c.included);
  const noneChaptersOn = state.syllabus.every(c => !c.included);

  return (
    <AiStudioLayout currentStep="syllabus" onSaveDraft={() => toast.success('Draft saved')}>
      <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
        {/* Header + horizontal summary */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Syllabus Coverage</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pick chapters, then topics, then assign marks weightage.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border bg-card card-shadow px-4 py-2.5">
            <Stat label="Chapters" value={`${includedChapters.length}/${state.syllabus.length}`} />
            <div className="w-px h-8 bg-border" />
            <Stat label="Topics" value={topicsCount} />
            <div className="w-px h-8 bg-border" />
            <Stat label="Target" value={target} />
            <div className="w-px h-8 bg-border" />
            <Stat label="Allocated" value={total} />
            <div className="w-px h-8 bg-border" />
            <div className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold',
              matched ? 'bg-success/10 text-success' : 'bg-warning-light text-warning',
            )}>
              {matched ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {matched ? 'Balanced' : `${total > target ? 'Over' : 'Short'} ${Math.abs(total - target)}`}
            </div>
            {sub === 'weightage' && (
              <>
                <div className="w-px h-8 bg-border" />
                <Button onClick={handleAutoDistribute} disabled={loading} variant="outline" size="sm" className="border-purple/30 text-purple hover:bg-purple-light">
                  {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                  Auto-distribute
                </Button>
              </>
            )}
          </div>
        </div>

        <SubStepper current={sub} onJump={setSub} includedChapters={includedChapters.length} />

        {sub === 'chapters' && (
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search chapters…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleAllChapters(!allChaptersOn)}>
                {allChaptersOn ? 'Clear all' : 'Select all'}
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAll.map(c => (
                  <button
                    key={c.chapterId}
                    type="button"
                    onClick={() => updateChapter(c.chapterId, { included: !c.included })}
                    className={cn(
                      'text-left rounded-xl border p-4 transition-all',
                      c.included
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                        c.included ? 'border-primary bg-primary' : 'border-muted-foreground/30',
                      )}>
                        {c.included && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{c.chapterName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{c.topics.length} topics</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <SubFooter
              backLabel="Back"
              onBack={() => navigate('/question-papers/ai-studio/pattern')}
              onNext={() => setSub('topics')}
              nextLabel="Next: Choose topics"
              nextDisabled={noneChaptersOn}
            />
          </div>
        )}

        {sub === 'topics' && (
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {includedChapters.length === 0 ? (
                <EmptyState message="No chapters selected. Go back and pick at least one chapter." />
              ) : (
                <div className="space-y-3">
                  {includedChapters.map(c => {
                    const allOn = c.topicSelections.every(t => t.included);
                    return (
                      <div key={c.chapterId} className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium text-sm">{c.chapterName}</div>
                            <div className="text-xs text-muted-foreground">
                              {c.topicSelections.filter(t => t.included).length} / {c.topicSelections.length} topics selected
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => toggleAllTopicsInChapter(c.chapterId, !allOn)}>
                            {allOn ? 'Clear' : 'Select all'}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {c.topicSelections.map(t => (
                            <button
                              key={t.name}
                              type="button"
                              onClick={() => updateTopic(c.chapterId, t.name, { included: !t.included })}
                              className={cn(
                                'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                                t.included
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-background hover:border-primary/40 hover:bg-primary/5',
                              )}
                            >
                              {t.included && <Check className="inline w-3 h-3 mr-1" />}
                              {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <SubFooter
              backLabel="Back: Chapters"
              onBack={() => setSub('chapters')}
              onNext={() => setSub('weightage')}
              nextLabel="Next: Assign marks"
              nextDisabled={includedChapters.length === 0}
            />
          </div>
        )}

        {sub === 'weightage' && (
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {includedChapters.length === 0 ? (
                <EmptyState message="No chapters selected." />
              ) : (
                <div className="rounded-2xl border bg-card card-shadow divide-y">
                  {includedChapters.map(c => {
                    const topicMarksSum = c.topicSelections.filter(t => t.included).reduce((s, t) => s + t.targetMarks, 0);
                    const topicMode = topicMarksSum > 0;
                    const includedTopics = c.topicSelections.filter(t => t.included);
                    return (
                      <div key={c.chapterId} className="p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{c.chapterName}</div>
                            <div className="text-xs text-muted-foreground">{includedTopics.length} topics</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Difficulty</span>
                              <Select value={c.difficultyFocus} onValueChange={v => updateChapter(c.chapterId, { difficultyFocus: v as Difficulty })}>
                                <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="easy">Mostly easy</SelectItem>
                                  <SelectItem value="medium">Mixed</SelectItem>
                                  <SelectItem value="hard">Mostly hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Marks</span>
                              <NumberPickerPopover
                                value={c.targetMarks}
                                onChange={n => updateChapter(c.chapterId, {
                                  targetMarks: n,
                                  topicSelections: c.topicSelections.map(t => ({ ...t, targetMarks: 0 })),
                                })}
                                options={CHAPTER_MARKS_OPTIONS}
                                label="Chapter marks"
                                className="w-20"
                              />
                            </div>
                          </div>
                        </div>

                        {includedTopics.length > 0 && (
                          <div className="mt-3 ml-0 rounded-xl border bg-muted/30 divide-y">
                            {includedTopics.map(t => (
                              <div key={t.name} className="flex items-center gap-3 px-3 py-2">
                                <span className="flex-1 text-sm truncate">{t.name}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground">Marks</span>
                                  <NumberPickerPopover
                                    value={t.targetMarks}
                                    onChange={n => updateTopic(c.chapterId, t.name, { targetMarks: n })}
                                    options={TOPIC_MARKS_OPTIONS}
                                    label="Topic marks"
                                    className="w-20"
                                  />
                                </div>
                              </div>
                            ))}
                            <div className="px-3 py-2 text-xs text-muted-foreground bg-background/50">
                              {topicMode
                                ? `Topic marks set — chapter total auto-calculated as ${topicMarksSum}.`
                                : 'Leave topic marks at 0 to use chapter-level marks.'}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <StepFooter
              onBack={() => setSub('topics')}
              onNext={() => navigate('/question-papers/ai-studio/preferences')}
              nextLabel="Next: Question Preferences"
            />
          </div>
        )}
      </div>
    </AiStudioLayout>
  );
};

const SubStepper: React.FC<{
  current: SubStep;
  onJump: (s: SubStep) => void;
  includedChapters: number;
}> = ({ current, onJump, includedChapters }) => {
  const steps: { id: SubStep; label: string; icon: React.ElementType }[] = [
    { id: 'chapters', label: 'Chapters', icon: BookOpen },
    { id: 'topics', label: 'Topics', icon: ListTree },
    { id: 'weightage', label: 'Marks', icon: Scale },
  ];
  const currentIdx = steps.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const active = s.id === current;
        const done = i < currentIdx;
        const disabled = i > 0 && includedChapters === 0;
        return (
          <React.Fragment key={s.id}>
            <button
              type="button"
              onClick={() => !disabled && onJump(s.id)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors',
                active && 'border-primary bg-primary text-primary-foreground shadow-sm',
                !active && done && 'border-success/30 bg-success/10 text-success',
                !active && !done && 'border-border bg-card text-muted-foreground hover:border-primary/40',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{i + 1}. {s.label}</span>
            </button>
            {i < steps.length - 1 && <div className="h-px w-6 bg-border" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const SubFooter: React.FC<{
  backLabel: string;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}> = ({ backLabel, onBack, onNext, nextLabel, nextDisabled }) => (
  <div className="flex items-center justify-between pt-2 border-t">
    <Button variant="ghost" onClick={onBack}>
      <ArrowLeft className="w-4 h-4 mr-2" /> {backLabel}
    </Button>
    <Button onClick={onNext} disabled={nextDisabled}>
      {nextLabel} <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
    {message}
  </div>
);

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col items-center px-2">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="text-base font-bold tabular-nums leading-tight">{value}</span>
  </div>
);

export default Step3Syllabus;
