import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Check, AlertTriangle, Eye, Copy, ArrowUp, ArrowDown, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import DocumentEditor from '@/components/question-papers/DocumentEditor';
import ValidationSidebar from '@/components/question-papers/ValidationSidebar';
import TemplatePicker from '@/components/question-papers/TemplatePicker';
import type { PaperDetails, Section, SubpartStyle, PaperTemplate, QuestionPaper, Question, QuestionType, AnswerRule } from '@/types/questionPaper';
import { computePaperMarks, autoNumberQuestions, sectionLabels, questionTypeLabels } from '@/types/questionPaper';
import { usePapers } from '@/hooks/usePapers';
import { teachers } from '@/data/teacherData';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const CreatePaper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isTeacherContext = location.pathname.startsWith('/teacher/');
  const listRoute = isTeacherContext ? '/teacher/qp-review?tab=create' : '/question-papers';
  const previewRoute = (pid: string) => isTeacherContext ? `/teacher/qp-builder/${pid}/preview` : `/question-papers/${pid}/preview`;
  const { getPaper, addPaper, updatePaper, publishPaper } = usePapers();

  const existingPaper = id ? getPaper(id) : null;
  const isEditMode = !!existingPaper;
  const isPublished = existingPaper?.status === 'published';

  const [showTemplatePicker, setShowTemplatePicker] = useState(!isEditMode && !isTeacherContext);
  const [paperId] = useState(existingPaper?.id || crypto.randomUUID());

  const [details, setDetails] = useState<PaperDetails>(
    existingPaper?.details || {
      id: paperId,
      institutionName: '',
      logoUrl: '',
      className: '',
      subject: '',
      examName: '',
      date: '',
      duration: '3 Hours',
      targetMarks: 80,
      instructions: 'All questions are compulsory unless stated otherwise.',
    }
  );

  const [sections, setSections] = useState<Section[]>(existingPaper?.sections || []);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [subpartStyle, setSubpartStyle] = useState<SubpartStyle>(existingPaper?.subpartStyle || 'alpha');

  // Auto-number questions whenever sections change
  useEffect(() => {
    const numbered = autoNumberQuestions(sections);
    // Only update if numbers actually changed
    const hasChange = numbered.some((s, i) =>
      s.questions.some((q, j) => q.displayNumber !== sections[i]?.questions[j]?.displayNumber)
    );
    if (hasChange) {
      setSections(numbered);
    }
  }, [sections.length, sections.map(s => s.questions.length).join(',')]);

  const currentMarks = useMemo(() => computePaperMarks(sections), [sections]);
  const remaining = details.targetMarks - currentMarks;
  const isMatch = currentMarks === details.targetMarks;
  const isOver = currentMarks > details.targetMarks;

  const handleSaveDraft = () => {
    const paper: QuestionPaper = {
      id: paperId,
      details,
      sections: autoNumberQuestions(sections),
      subpartStyle,
      status: 'draft',
      createdAt: existingPaper?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      currentMarks,
    };
    if (isEditMode) {
      updatePaper(paper);
    } else {
      addPaper(paper);
    }
    toast.success('Draft saved successfully');
  };

  const handlePublish = () => {
    handleSaveDraft();
    publishPaper(paperId);
    toast.success('Paper published successfully');
    navigate(listRoute);
  };

  const handleSelectTemplate = (template: PaperTemplate) => {
    setDetails(prev => ({ ...prev, targetMarks: template.targetMarks }));
    const newSections: Section[] = template.sections.map((ts) => {
      const questions: Question[] = Array.from({ length: ts.totalQuestions }, () => ({
        id: crypto.randomUUID(),
        internalId: crypto.randomUUID(),
        displayNumber: 0,
        type: ts.questionType || 'short-answer',
        text: '',
        marks: ts.marksPerQuestion || 1,
        subparts: [],
        hasOr: ts.answerRule === 'or-choice',
        options: ts.questionType === 'mcq' ? ['', '', '', ''] : undefined,
      }));
      return { ...ts, id: crypto.randomUUID(), questions, questionType: ts.questionType || 'short-answer' } as Section;
    });
    setSections(newSections);
    setShowTemplatePicker(false);
  };

  const handleGenerateSkeleton = (setups: { label: string; questionCount: number; marksPerQuestion: number; questionType: QuestionType; answerRule: AnswerRule; answerAnyK?: number }[]) => {
    const totalMarks = setups.reduce((sum, s) => {
      if (s.answerRule === 'any-k' && s.answerAnyK) return sum + s.answerAnyK * s.marksPerQuestion;
      return sum + s.questionCount * s.marksPerQuestion;
    }, 0);
    setDetails(prev => ({ ...prev, targetMarks: totalMarks }));

    const newSections: Section[] = setups.map((s, idx) => {
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
    });
    setSections(newSections);
    setShowTemplatePicker(false);
    toast.success(`Generated ${setups.length} sections with ${setups.reduce((s, sec) => s + sec.questionCount, 0)} questions`);
  };

  const handleStartBlank = () => {
    setShowTemplatePicker(false);
  };

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col">
      {/* Template picker modal */}
      <TemplatePicker
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelectTemplate={handleSelectTemplate}
        onStartBlank={handleStartBlank}
        onGenerateSkeleton={handleGenerateSkeleton}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(listRoute)}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h2 className="text-sm font-semibold text-foreground">
            {details.subject ? `${details.className} — ${details.subject}` : 'New Question Paper'}
          </h2>
          {isPublished && (
            <Badge className="bg-success/10 text-success border-success/30 text-[10px]">Published (Read Only)</Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Target: <strong className="text-purple">{details.targetMarks}</strong></span>
            <span className="text-muted-foreground">Current: <strong className={cn(isMatch ? 'text-success' : isOver ? 'text-destructive' : 'text-foreground')}>{currentMarks}</strong></span>
            <Badge className={cn(
              'text-xs',
              isMatch ? 'bg-success/10 text-success border-success/30' : isOver ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-warning-light text-warning border-warning/30'
            )}>
              {isMatch ? <><Check className="w-3 h-3 mr-1" />Matched</> : isOver ? <><AlertTriangle className="w-3 h-3 mr-1" />{Math.abs(remaining)} over</> : <>{remaining} remaining</>}
            </Badge>
          </div>
          <div className="h-5 w-px bg-border" />
          <Button variant="outline" size="sm" onClick={() => { handleSaveDraft(); navigate(previewRoute(paperId)); }}>
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Preview
          </Button>
          {!isPublished && (
            <>
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Draft
              </Button>
              <Popover open={assignOpen} onOpenChange={setAssignOpen}>
                <PopoverTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!isMatch}>
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    Assign
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2" align="end">
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search teachers..."
                      value={assignSearch}
                      onChange={e => setAssignSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                  <ScrollArea className="max-h-52">
                    {teachers
                      .filter(t => t.name.toLowerCase().includes(assignSearch.toLowerCase()))
                      .map(t => (
                        <button
                          key={t.id}
                          className="w-full text-left px-2.5 py-1.5 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => {
                            handleSaveDraft();
                            publishPaper(paperId);
                            toast.success(`Paper assigned to ${t.name}`);
                            setAssignOpen(false);
                            navigate(listRoute);
                          }}
                        >
                          <span className="font-medium">{t.name}</span>
                          <span className="text-xs text-muted-foreground ml-1.5">
                            {t.subjects.map(s => s.name).join(', ')}
                          </span>
                        </button>
                      ))}
                    {teachers.filter(t => t.name.toLowerCase().includes(assignSearch.toLowerCase())).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">No teachers found</p>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </div>

      {/* Editor + Sidebar */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-h-0">
          <DocumentEditor
            details={details}
            setDetails={setDetails}
            sections={sections}
            setSections={setSections}
            subpartStyle={subpartStyle}
            setSubpartStyle={setSubpartStyle}
            readOnly={isPublished}
          />
        </div>
        
      </div>
    </div>
  );
};

export default CreatePaper;
