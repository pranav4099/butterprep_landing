// AI Paper Studio — Editor & Review (Step 6)
// Wraps the existing DocumentEditor with a right-side AI panel and Question Bank drawer.
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Check, AlertTriangle, Eye, UserPlus, Sparkles, Search, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import DocumentEditor from '@/components/question-papers/DocumentEditor';
import StudioEditorPanel from '@/components/paper-studio/StudioEditorPanel';
import QuestionBankDrawer from '@/components/paper-studio/QuestionBankDrawer';
import type { PaperDetails, Section, SubpartStyle, Question, QuestionType, QuestionPaper } from '@/types/questionPaper';
import { computePaperMarks, autoNumberQuestions } from '@/types/questionPaper';
import { usePapers } from '@/hooks/usePapers';
import { teachers } from '@/data/teacherData';

const StudioEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getPaper, updatePaper, publishPaper } = usePapers();

  const existing = id ? getPaper(id) : null;
  const [paperId] = useState(existing?.id || crypto.randomUUID());
  const [details, setDetails] = useState<PaperDetails>(existing?.details || {
    id: paperId, institutionName: 'ButterPrep School', logoUrl: '',
    className: 'Class 10', subject: 'Science', examName: 'Annual Exam',
    date: new Date().toLocaleDateString('en-GB'), duration: '3 Hours',
    targetMarks: 80, instructions: 'All questions are compulsory unless stated otherwise.',
  });
  const [sections, setSections] = useState<Section[]>(existing?.sections || []);
  const [subpartStyle, setSubpartStyle] = useState<SubpartStyle>(existing?.subpartStyle || 'alpha');
  const [panelOpen, setPanelOpen] = useState(true);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankPrefs, setBankPrefs] = useState<{ type?: QuestionType; marks?: number }>({});
  const [assignSearch, setAssignSearch] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);

  // Auto-number
  useEffect(() => {
    const numbered = autoNumberQuestions(sections);
    const hasChange = numbered.some((s, i) =>
      s.questions.some((q, j) => q.displayNumber !== sections[i]?.questions[j]?.displayNumber)
    );
    if (hasChange) setSections(numbered);
  }, [sections.length, sections.map(s => s.questions.length).join(',')]);

  const currentMarks = useMemo(() => computePaperMarks(sections), [sections]);
  const remaining = details.targetMarks - currentMarks;
  const isMatch = currentMarks === details.targetMarks;
  const isOver = currentMarks > details.targetMarks;

  const handleSaveDraft = () => {
    const paper: QuestionPaper = {
      id: paperId, details,
      sections: autoNumberQuestions(sections),
      subpartStyle, status: 'draft',
      createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      currentMarks,
    };
    updatePaper(paper);
    toast.success('Draft saved');
  };

  const handleOpenBank = (type?: string, marks?: number) => {
    setBankPrefs({ type: type as QuestionType | undefined, marks });
    setBankOpen(true);
  };

  const handlePickFromBank = (q: any) => {
    // Insert as a new question into the first section that matches the type, or the first section.
    const targetSection = sections.find(s => (s.questionType || 'short-answer') === q.type) || sections[0];
    if (!targetSection) {
      toast.error('Add a section first');
      return;
    }
    const newQ: Question = {
      id: crypto.randomUUID(),
      internalId: crypto.randomUUID(),
      displayNumber: 0,
      type: q.type,
      text: q.text,
      marks: q.marks,
      subparts: [],
      hasOr: false,
      options: q.options,
    };
    (newQ as any).chapter = q.chapter;
    (newQ as any).difficulty = q.difficulty;
    (newQ as any).source = 'bank';
    setSections(prev => prev.map(s =>
      s.id === targetSection.id ? { ...s, questions: [...s.questions, newQ] } : s
    ));
    toast.success('Inserted from bank', { description: `Section ${targetSection.label}` });
  };

  if (!existing && id) {
    return (
      <div className="h-screen flex items-center justify-center text-center p-8">
        <div className="max-w-sm">
          <p className="text-sm text-muted-foreground mb-3">Paper not found.</p>
          <Button onClick={() => navigate('/question-papers')}>Back to Papers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => navigate('/question-papers')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Papers
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple to-info flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-semibold truncate">
              {details.className} — {details.subject}
            </h2>
            <Badge className="bg-purple-light text-purple text-[10px] hidden md:inline-flex">AI Studio · Edit & Review</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Target: <strong className="text-purple">{details.targetMarks}</strong></span>
            <span className="text-muted-foreground">Current: <strong className={cn(isMatch ? 'text-success' : isOver ? 'text-destructive' : 'text-foreground')}>{currentMarks}</strong></span>
            <Badge className={cn(
              'text-xs',
              isMatch ? 'bg-success/10 text-success border-success/30'
                : isOver ? 'bg-destructive/10 text-destructive border-destructive/30'
                : 'bg-warning-light text-warning border-warning/30',
            )}>
              {isMatch ? <><Check className="w-3 h-3 mr-1" />Matched</>
                : isOver ? <><AlertTriangle className="w-3 h-3 mr-1" />{Math.abs(remaining)} over</>
                : <>{remaining} remaining</>}
            </Badge>
          </div>
          <div className="h-5 w-px bg-border" />
          <Button variant="outline" size="sm" onClick={() => { handleSaveDraft(); navigate(`/question-papers/${paperId}/preview`); }}>
            <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft
          </Button>
          <Popover open={assignOpen} onOpenChange={setAssignOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!isMatch}>
                <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Assign
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="end">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search teachers..." value={assignSearch} onChange={e => setAssignSearch(e.target.value)} className="pl-8 h-8 text-sm" />
              </div>
              <ScrollArea className="max-h-52">
                {teachers.filter(t => t.name.toLowerCase().includes(assignSearch.toLowerCase())).map(t => (
                  <button
                    key={t.id}
                    className="w-full text-left px-2.5 py-1.5 rounded-sm text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      handleSaveDraft();
                      publishPaper(paperId);
                      toast.success(`Paper assigned to ${t.name}`);
                      setAssignOpen(false);
                      navigate('/question-papers');
                    }}
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">{t.subjects.map(s => s.name).join(', ')}</span>
                  </button>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm" onClick={() => setPanelOpen(p => !p)} className="hidden lg:inline-flex">
            {panelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Editor + Right panel */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-h-0">
          <DocumentEditor
            details={details} setDetails={setDetails}
            sections={sections} setSections={setSections}
            subpartStyle={subpartStyle} setSubpartStyle={setSubpartStyle}
          />
        </div>
        {panelOpen && (
          <aside className="hidden lg:flex w-[360px] shrink-0 min-h-0">
            <StudioEditorPanel
              details={details}
              sections={sections}
              setSections={setSections}
              onOpenBank={handleOpenBank}
            />
          </aside>
        )}
      </div>

      {/* Question Bank drawer */}
      <QuestionBankDrawer
        open={bankOpen}
        onOpenChange={setBankOpen}
        className={details.className}
        subject={details.subject}
        preferredType={bankPrefs.type}
        preferredMarks={bankPrefs.marks}
        onPick={handlePickFromBank}
      />
    </div>
  );
};

export default StudioEditor;
