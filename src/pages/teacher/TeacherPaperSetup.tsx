import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Sparkles, FilePlus2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { QuestionType, AnswerRule, Section, Question, QuestionPaper } from '@/types/questionPaper';
import { autoNumberQuestions } from '@/types/questionPaper';
import { usePapers } from '@/hooks/usePapers';

interface SectionSetup {
  id: string;
  label: string;
  questionCount: number;
  marksPerQuestion: number;
  questionType: QuestionType;
  answerRule: AnswerRule;
  answerAnyK?: number;
}

const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const defaultSection = (idx: number): SectionSetup => ({
  id: crypto.randomUUID(),
  label: `Section ${sectionLetters[idx] || String(idx + 1)}`,
  questionCount: 5,
  marksPerQuestion: 1,
  questionType: 'short-answer',
  answerRule: 'all',
});

const classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const examTypeOptions = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];

const TeacherPaperSetup = () => {
  const navigate = useNavigate();
  const { addPaper } = usePapers();

  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [examName, setExamName] = useState('');
  const [duration, setDuration] = useState('3 Hours');
  const [date, setDate] = useState('');
  const [instructions, setInstructions] = useState('All questions are compulsory unless stated otherwise.');

  const [sections, setSections] = useState<SectionSetup[]>([defaultSection(0)]);

  const totalQuestions = sections.reduce((s, sec) => s + sec.questionCount, 0);
  const totalMarks = sections.reduce((sum, s) => {
    if (s.answerRule === 'any-k' && s.answerAnyK) return sum + s.answerAnyK * s.marksPerQuestion;
    return sum + s.questionCount * s.marksPerQuestion;
  }, 0);

  const addSection = () => {
    setSections(prev => [...prev, defaultSection(prev.length)]);
  };

  const removeSection = (id: string) => {
    setSections(prev => {
      const updated = prev.filter(s => s.id !== id);
      return updated.map((s, i) => ({ ...s, label: `Section ${sectionLetters[i] || String(i + 1)}` }));
    });
  };

  const updateSection = (id: string, patch: Partial<SectionSetup>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const buildPaper = (withSkeleton: boolean): QuestionPaper => {
    const paperId = crypto.randomUUID();
    const builtSections: Section[] = withSkeleton
      ? sections.map((s) => {
          const questions: Question[] = Array.from({ length: s.questionCount }, () => ({
            id: crypto.randomUUID(),
            internalId: crypto.randomUUID(),
            displayNumber: 0,
            type: s.questionType,
            text: '',
            marks: s.marksPerQuestion,
            subparts: [],
            hasOr: s.answerRule === 'or-choice',
            options: s.questionType === 'mcq' ? ['', '', '', ''] : undefined,
            matchPairs: s.questionType === 'match' ? [{ left: '', right: '' }, { left: '', right: '' }, { left: '', right: '' }] : undefined,
          }));
          return {
            id: crypto.randomUUID(),
            label: s.label,
            title: s.label,
            labelStyle: 'part' as const,
            answerRule: s.answerRule,
            answerAnyK: s.answerAnyK,
            totalQuestions: s.questionCount,
            marksPerQuestion: s.marksPerQuestion,
            totalMarks: s.questionCount * s.marksPerQuestion,
            questions,
            questionType: s.questionType,
          } as Section;
        })
      : [];

    return {
      id: paperId,
      details: {
        id: paperId,
        institutionName: '',
        logoUrl: '',
        className,
        subject,
        examName,
        date,
        duration,
        targetMarks: withSkeleton ? totalMarks : 80,
        instructions,
      },
      sections: withSkeleton ? autoNumberQuestions(builtSections) : [],
      subpartStyle: 'alpha',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      currentMarks: withSkeleton ? totalMarks : 0,
    };
  };

  const handleCreate = (withSkeleton: boolean) => {
    if (!subject.trim() || !className) {
      toast.error('Please fill in subject and class');
      return;
    }
    const paper = buildPaper(withSkeleton);
    addPaper(paper);
    toast.success(withSkeleton ? `Skeleton created — ${sections.length} sections, ${totalMarks} marks` : 'Paper created — start adding questions');
    navigate(`/teacher/qp-builder/${paper.id}`);
  };

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate('/teacher/qp-review?tab=create')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Question Papers</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">New Question Paper</h1>
          <p className="text-sm text-muted-foreground mt-1">Set the paper details and section skeleton — you can refine everything later.</p>
        </div>
      </div>

      {/* Paper details */}
      <Card className="card-shadow rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Paper details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subject *</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Class *</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Exam name</Label>
              <Select value={examName} onValueChange={setExamName}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>
                  {examTypeOptions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Exam date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 3 Hours" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Total marks (auto)</Label>
              <div className="h-10 flex items-center px-3 rounded-md bg-muted border border-border text-sm font-semibold text-foreground">
                {totalMarks} marks
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Instructions</Label>
            <Textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={2} className="text-sm" />
          </div>
        </CardContent>
      </Card>

      {/* Section skeleton */}
      <Card className="card-shadow rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Section skeleton</h3>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{totalQuestions}</span> questions ·
              <span className="font-semibold text-foreground ml-1">{totalMarks}</span> marks
            </div>
          </div>

          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="rounded-xl border border-border p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{section.label}</h4>
                  {sections.length > 1 && (
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Questions</Label>
                    <Input
                      type="number" min={1} max={50}
                      value={section.questionCount}
                      onChange={e => updateSection(section.id, { questionCount: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Marks each</Label>
                    <Input
                      type="number" min={1} max={20}
                      value={section.marksPerQuestion}
                      onChange={e => updateSection(section.id, { marksPerQuestion: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Question type</Label>
                    <Select
                      value={section.questionType}
                      onValueChange={(v: QuestionType) => updateSection(section.id, { questionType: v })}
                    >
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                        <SelectItem value="long-answer">Long Answer</SelectItem>
                        <SelectItem value="fill-blank">Fill in the Blanks</SelectItem>
                        <SelectItem value="true-false">True / False</SelectItem>
                        <SelectItem value="match">Match the Following</SelectItem>
                        <SelectItem value="table">Table / Complete</SelectItem>
                        <SelectItem value="diagram">Diagram / Image</SelectItem>
                        <SelectItem value="case-study">Case Study / Passage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Answer rule</Label>
                    <Select
                      value={section.answerRule}
                      onValueChange={(v: AnswerRule) => {
                        const patch: Partial<SectionSetup> = { answerRule: v };
                        if (v === 'any-k') patch.answerAnyK = Math.max(1, section.questionCount - 1);
                        updateSection(section.id, patch);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Answer All</SelectItem>
                        <SelectItem value="any-k">Answer Any K of N</SelectItem>
                        <SelectItem value="or-choice">OR Choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {section.answerRule === 'any-k' && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Answer any</Label>
                    <Input
                      type="number" min={1} max={section.questionCount}
                      value={section.answerAnyK || section.questionCount - 1}
                      onChange={e => updateSection(section.id, { answerAnyK: Math.max(1, Math.min(section.questionCount, parseInt(e.target.value) || 1)) })}
                      className="h-8 w-16 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">out of {section.questionCount}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Section total:{' '}
                  <span className="font-semibold text-foreground">
                    {section.answerRule === 'any-k' && section.answerAnyK
                      ? `${section.answerAnyK} × ${section.marksPerQuestion} = ${section.answerAnyK * section.marksPerQuestion}`
                      : `${section.questionCount} × ${section.marksPerQuestion} = ${section.questionCount * section.marksPerQuestion}`} marks
                  </span>
                </div>
              </div>
            ))}

            {sections.length < 8 && (
              <button
                onClick={addSection}
                className="w-full p-3 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sticky footer actions */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3 border-t border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalQuestions}</span> questions ·{' '}
          <span className="font-semibold text-foreground">{totalMarks}</span> marks total
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleCreate(false)} className="rounded-xl">
            Skip — Start Blank
          </Button>
          <Button size="sm" onClick={() => handleCreate(true)} className={cn('rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground')}>
            <Sparkles className="w-3.5 h-3.5" />
            Generate & Open Builder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherPaperSetup;
