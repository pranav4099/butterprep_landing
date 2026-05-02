import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, FileText, Key, Save, Check, Edit3, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePaperWorkflow } from '@/contexts/PaperWorkflowContext';
import { usePapers } from '@/hooks/usePapers';
import WorkflowStatusBadge from '@/components/question-papers/WorkflowStatusBadge';
import type { AnswerKeyEntry } from '@/types/paperWorkflow';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ActiveTab = 'question-paper' | 'answer-key';

const TeacherQPReview = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const { getWorkflow, updateStatus, addComment, generateAnswerKey, updateAnswerKeyEntry, finalizeAnswerKey } = usePaperWorkflow();
  const { getPaper } = usePapers();

  const workflow = paperId ? getWorkflow(paperId) : undefined;
  const paper = paperId ? getPaper(paperId) : undefined;

  const [activeTab, setActiveTab] = useState<ActiveTab>('question-paper');
  const [commentText, setCommentText] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  if (!workflow || !paper) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Paper not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/teacher/qp-review')}>
          Back to Reviews
        </Button>
      </div>
    );
  }

  const answerKeyAvailable = ['answer-key-draft', 'answer-key-finalized'].includes(workflow.workflowStatus);
  const canReview = workflow.workflowStatus === 'under-review';
  const isFinalized = workflow.workflowStatus === 'answer-key-finalized';
  const answerKey = workflow.answerKey;
  const activeEntry = selectedQuestion ? answerKey.find(e => e.questionId === selectedQuestion) : answerKey[0];
  const activeQuestion = activeEntry
    ? paper.sections.flatMap(s => s.questions).find(q => q.id === activeEntry.questionId)
    : null;
  const editedCount = answerKey.filter(e => e.isEdited).length;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(paperId!, { author: workflow.assignedTeacherName, role: 'teacher', text: commentText.trim() });
    setCommentText('');
    toast.success('Comment added');
  };

  const handleRequestChanges = () => {
    if (!commentText.trim()) { toast.error('Please add a comment explaining the changes needed'); return; }
    addComment(paperId!, { author: workflow.assignedTeacherName, role: 'teacher', text: commentText.trim() });
    updateStatus(paperId!, 'changes-requested', workflow.assignedTeacherName);
    setCommentText('');
    setShowChangesDialog(false);
    toast.success('Changes requested — Admin has been notified');
  };

  const handleApprove = () => {
    const entries: AnswerKeyEntry[] = paper.sections.flatMap(section =>
      section.questions.map(q => ({
        questionId: q.id, displayNumber: q.displayNumber, questionText: q.text,
        questionType: q.type, marks: q.marks, sectionLabel: section.label,
        answer: generateDemoAnswer(q.type, q.text, q.options),
        keyPoints: generateDemoKeyPoints(q.type, q.marks),
        markingGuidance: `${q.marks} mark${q.marks > 1 ? 's' : ''} — ${q.type === 'mcq' ? 'Direct answer' : 'Step-wise marking'}`,
        isEdited: false,
      }))
    );
    updateStatus(paperId!, 'approved', workflow.assignedTeacherName);
    generateAnswerKey(paperId!, entries);
    setShowApproveDialog(false);
    toast.success('Paper approved! Answer key draft generated — switch to the Answer Key tab.');
    setActiveTab('answer-key');
  };

  const handleUpdateAnswer = (field: string, value: string | string[]) => {
    if (!activeEntry || isFinalized) return;
    updateAnswerKeyEntry(paperId!, activeEntry.questionId, { [field]: value });
  };

  const handleFinalize = () => {
    finalizeAnswerKey(paperId!);
    setShowFinalizeDialog(false);
    toast.success('Answer key finalized successfully!');
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24 sm:pb-0">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="sm" className="px-2 shrink-0" onClick={() => navigate('/teacher/qp-review')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-foreground truncate">{paper.details.className} — {paper.details.subject}</h2>
              <p className="text-[11px] text-muted-foreground truncate">{paper.details.examName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <WorkflowStatusBadge status={workflow.workflowStatus} />
            {activeTab === 'answer-key' && !isFinalized && answerKeyAvailable && (
              <Button size="sm" className="hidden sm:inline-flex" onClick={() => setShowFinalizeDialog(true)}>
                <Check className="w-3.5 h-3.5 mr-1.5" /> Finalize
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky finalize */}
      {activeTab === 'answer-key' && !isFinalized && answerKeyAvailable && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border p-3">
          <Button className="w-full" onClick={() => setShowFinalizeDialog(true)}>
            <Check className="w-4 h-4 mr-1.5" /> Finalize Answer Key
          </Button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 max-w-md">
          <button
            onClick={() => setActiveTab('question-paper')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === 'question-paper'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="w-4 h-4" /> Question Paper
          </button>
          <button
            onClick={() => answerKeyAvailable && setActiveTab('answer-key')}
            disabled={!answerKeyAvailable}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === 'answer-key'
                ? 'bg-card text-foreground shadow-sm'
                : answerKeyAvailable
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-muted-foreground/40 cursor-not-allowed'
            )}
          >
            <Key className="w-4 h-4" /> Answer Key
            {!answerKeyAvailable && <Lock className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 pt-4">
        {activeTab === 'question-paper' ? (
          <QuestionPaperTab
            paper={paper}
            workflow={workflow}
            canReview={canReview}
            answerKeyAvailable={answerKeyAvailable}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            commentText={commentText}
            setCommentText={setCommentText}
            onAddComment={handleAddComment}
            onShowApprove={() => setShowApproveDialog(true)}
            onShowChanges={() => setShowChangesDialog(true)}
            onSwitchToAnswerKey={() => setActiveTab('answer-key')}
            paperId={paperId!}
          />
        ) : (
          <AnswerKeyTab
            paper={paper}
            workflow={workflow}
            answerKey={answerKey}
            activeEntry={activeEntry}
            activeQuestion={activeQuestion}
            selectedQuestion={selectedQuestion}
            setSelectedQuestion={setSelectedQuestion}
            isFinalized={isFinalized}
            editedCount={editedCount}
            onUpdateAnswer={handleUpdateAnswer}
          />
        )}
      </div>

      {/* Dialogs */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Question Paper</AlertDialogTitle>
            <AlertDialogDescription>
              Once approved, an answer key draft will be automatically generated for your review. You can edit and finalize it in the Answer Key tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-success hover:bg-success/90">Approve & Generate Answer Key</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Changes</AlertDialogTitle>
            <AlertDialogDescription>Describe the changes needed. The admin will be notified and can update the paper.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea placeholder="Describe the changes needed..." value={commentText} onChange={e => setCommentText(e.target.value)} className="min-h-[80px]" />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommentText('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRequestChanges} className="bg-warning hover:bg-warning/90 text-white">Send Change Request</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize Answer Key</AlertDialogTitle>
            <AlertDialogDescription>
              Once finalized, the answer key will be locked and submitted. You have edited {editedCount} out of {answerKey.length} answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize}>Finalize & Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ─── Question Paper Tab ─── */
interface QPTabProps {
  paper: any;
  workflow: any;
  canReview: boolean;
  answerKeyAvailable: boolean;
  expandedSections: Record<string, boolean>;
  toggleSection: (id: string) => void;
  commentText: string;
  setCommentText: (v: string) => void;
  onAddComment: () => void;
  onShowApprove: () => void;
  onShowChanges: () => void;
  onSwitchToAnswerKey: () => void;
  paperId: string;
}

const QuestionPaperTab: React.FC<QPTabProps> = ({
  paper, workflow, canReview, answerKeyAvailable, expandedSections, toggleSection,
  commentText, setCommentText, onAddComment, onShowApprove, onShowChanges, onSwitchToAnswerKey,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
    {/* Left: Paper Preview */}
    <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
      <Card className="card-shadow">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-foreground">{paper.details.institutionName || 'School Name'}</h3>
            <p className="text-sm text-muted-foreground">{paper.details.examName}</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{paper.details.className}</span><span>•</span>
              <span>{paper.details.subject}</span><span>•</span>
              <span>Max Marks: {paper.details.targetMarks}</span><span>•</span>
              <span>Duration: {paper.details.duration}</span>
            </div>
          </div>
          {paper.details.instructions && (
            <div className="bg-muted/50 rounded-lg p-3 mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">General Instructions:</p>
              <p className="text-xs text-muted-foreground whitespace-pre-line">{paper.details.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {paper.sections.map((section: any) => (
        <Card key={section.id} className="card-shadow">
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4" onClick={() => toggleSection(section.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Section {section.label}</Badge>
                <CardTitle className="text-sm">{section.title}</CardTitle>
                <span className="text-xs text-muted-foreground">({section.totalMarks} marks)</span>
              </div>
              {expandedSections[section.id] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            {section.instructions && <p className="text-xs text-muted-foreground italic mt-1">{section.instructions}</p>}
          </CardHeader>
          {expandedSections[section.id] !== false && (
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-3">
                {section.questions.map((q: any) => (
                  <div key={q.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-primary shrink-0 mt-0.5">Q{q.displayNumber}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{q.text || '(No question text)'}</p>
                        {q.options?.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-1.5">
                            {q.options.map((opt: string, i: number) => (
                              <span key={i} className="text-xs text-muted-foreground">({String.fromCharCode(97 + i)}) {opt}</span>
                            ))}
                          </div>
                        )}
                        {q.subparts?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {q.subparts.map((sp: any) => (
                              <div key={sp.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span className="font-medium">{sp.label}</span><span>{sp.text}</span>
                                <Badge variant="outline" className="text-[10px] ml-auto shrink-0">{sp.marks}m</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                        {q.hasOr && q.orQuestion && (
                          <div className="mt-2 pt-2 border-t border-dashed border-border">
                            <p className="text-xs font-medium text-warning mb-1">OR</p>
                            <p className="text-sm text-foreground">{q.orQuestion.text}</p>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{q.marks}m</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>

    {/* Right: Review Panel */}
    <div className="space-y-4 order-1 lg:order-2">
      {canReview && (
        <Card className="card-shadow border-primary/20">
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Review Actions</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            <Button className="w-full bg-success hover:bg-success/90 text-white" onClick={onShowApprove}>
              <CheckCircle className="w-4 h-4 mr-2" /> Approve Paper
            </Button>
            <Button variant="outline" className="w-full border-warning/50 text-warning hover:bg-warning/10" onClick={onShowChanges}>
              <AlertTriangle className="w-4 h-4 mr-2" /> Request Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {answerKeyAvailable && (
        <Card className="card-shadow border-purple/20">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-purple" />
            </div>
            <p className="text-sm font-medium text-foreground">Paper Approved</p>
            <p className="text-xs text-muted-foreground mt-1">Answer key draft is ready for your review</p>
            <Button size="sm" className="mt-3" onClick={onSwitchToAnswerKey}>
              <Key className="w-3.5 h-3.5 mr-1.5" /> Go to Answer Key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick info */}
      <Card className="card-shadow">
        <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Paper Info</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span className="text-muted-foreground">Total Marks</span><span className="font-medium text-right">{paper.details.targetMarks}</span>
            <span className="text-muted-foreground">Duration</span><span className="font-medium text-right">{paper.details.duration}</span>
            <span className="text-muted-foreground">Sections</span><span className="font-medium text-right">{paper.sections.length}</span>
            <span className="text-muted-foreground">Questions</span><span className="font-medium text-right">{paper.sections.reduce((s: number, sec: any) => s + sec.questions.length, 0)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

/* ─── Answer Key Tab ─── */
interface AKTabProps {
  paper: any;
  workflow: any;
  answerKey: AnswerKeyEntry[];
  activeEntry: AnswerKeyEntry | undefined;
  activeQuestion: any;
  selectedQuestion: string | null;
  setSelectedQuestion: (id: string | null) => void;
  isFinalized: boolean;
  editedCount: number;
  onUpdateAnswer: (field: string, value: string | string[]) => void;
}

const AnswerKeyTab: React.FC<AKTabProps> = ({
  paper, answerKey, activeEntry, activeQuestion, selectedQuestion,
  setSelectedQuestion, isFinalized, editedCount, onUpdateAnswer,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
    {/* Left: Question Navigator */}
    <div className="lg:col-span-3">
      <Card className="card-shadow lg:sticky lg:top-32">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Questions</CardTitle>
            <span className="text-xs text-muted-foreground">{editedCount}/{answerKey.length} edited</span>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-2 pt-0 lg:max-h-[65vh] lg:overflow-y-auto">
          {/* Mobile: horizontal pills */}
          <div className="flex lg:hidden gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-hide">
            {paper.sections.flatMap((section: any) =>
              section.questions.map((q: any) => {
                const entry = answerKey.find((e: AnswerKeyEntry) => e.questionId === q.id);
                const isActive = activeEntry?.questionId === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestion(q.id)}
                    className={cn(
                      'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    Q{q.displayNumber}
                    {entry?.isEdited && <Edit3 className="w-3 h-3 inline ml-1" />}
                  </button>
                );
              })
            )}
          </div>
          {/* Desktop: section grouped list */}
          <div className="hidden lg:block">
            {paper.sections.map((section: any) => (
              <div key={section.id} className="mb-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">Section {section.label}</p>
                {section.questions.map((q: any) => {
                  const entry = answerKey.find((e: AnswerKeyEntry) => e.questionId === q.id);
                  const isActive = activeEntry?.questionId === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestion(q.id)}
                      className={cn(
                        'w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all mb-0.5',
                        isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Q{q.displayNumber}</span>
                        <div className="flex items-center gap-1">
                          {entry?.isEdited && <Edit3 className="w-3 h-3 text-primary" />}
                          <Badge variant="outline" className="text-[9px] px-1 py-0">{q.marks}m</Badge>
                        </div>
                      </div>
                      <p className="truncate mt-0.5 text-[10px]">{q.text.slice(0, 40)}...</p>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Center: Question Reference */}
    <div className="lg:col-span-4">
      <Card className="card-shadow lg:sticky lg:top-32">
        <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Question Reference</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {activeQuestion ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Q{activeQuestion.displayNumber}</Badge>
                <Badge variant="outline" className="text-xs">Section {activeEntry?.sectionLabel}</Badge>
                <Badge variant="outline" className="text-xs">{activeQuestion.marks} marks</Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{activeQuestion.text}</p>
              {activeQuestion.options?.length > 0 && (
                <div className="space-y-1 bg-muted/30 rounded-lg p-3">
                  {activeQuestion.options.map((opt: string, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">({String.fromCharCode(97 + i)}) {opt}</p>
                  ))}
                </div>
              )}
              {activeQuestion.subparts?.length > 0 && (
                <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                  {activeQuestion.subparts.map((sp: any) => (
                    <div key={sp.id} className="flex items-start gap-2 text-xs">
                      <span className="font-medium text-foreground">{sp.label}</span>
                      <span className="text-muted-foreground flex-1">{sp.text}</span>
                      <span className="text-muted-foreground shrink-0">[{sp.marks}m]</span>
                    </div>
                  ))}
                </div>
              )}
              {activeQuestion.hasOr && activeQuestion.orQuestion && (
                <div className="border-t border-dashed border-border pt-2">
                  <p className="text-xs font-medium text-warning mb-1">OR</p>
                  <p className="text-sm text-foreground">{activeQuestion.orQuestion.text}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a question to view</p>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Right: Answer Editor */}
    <div className="lg:col-span-5">
      <Card className="card-shadow lg:sticky lg:top-32">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{isFinalized ? 'Final Answer' : 'Edit Answer'}</CardTitle>
            {activeEntry?.isEdited && (
              <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                <Edit3 className="w-3 h-3 mr-1" /> Edited
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {activeEntry ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Model Answer</label>
                <Textarea value={activeEntry.answer} onChange={e => onUpdateAnswer('answer', e.target.value)} className="min-h-[100px] text-sm" disabled={isFinalized} />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Key Points / Expected Answers</label>
                <div className="space-y-1.5">
                  {activeEntry.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground shrink-0 w-4">{i + 1}.</span>
                      <Input
                        value={point}
                        onChange={e => {
                          const updated = [...activeEntry.keyPoints];
                          updated[i] = e.target.value;
                          onUpdateAnswer('keyPoints', updated);
                        }}
                        className="h-8 text-xs"
                        disabled={isFinalized}
                      />
                    </div>
                  ))}
                  {!isFinalized && (
                    <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => onUpdateAnswer('keyPoints', [...activeEntry.keyPoints, ''])}>
                      + Add Key Point
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Marking Guidance</label>
                <Textarea value={activeEntry.markingGuidance} onChange={e => onUpdateAnswer('markingGuidance', e.target.value)} className="min-h-[60px] text-sm" disabled={isFinalized} />
              </div>
              {!isFinalized && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success('Answer saved')}>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a question to edit its answer</p>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

function generateDemoAnswer(type: string, text: string, options?: string[]): string {
  if (type === 'mcq' && options?.length) return `(a) ${options[0]}`;
  if (type === 'true-false') return 'True';
  if (type === 'fill-blank') return '[Expected word/phrase]';
  if (type === 'short-answer') return 'Model answer covering key concepts with proper mathematical/scientific reasoning. Include diagrams where applicable.';
  if (type === 'long-answer') return 'Detailed model answer with step-by-step working, theorems/proofs where applicable, and final conclusion. Students should show all working for full marks.';
  if (type === 'case-study') return 'Reference the passage context. Answer each sub-question with specific data points from the case study.';
  return 'Expected answer with key points.';
}

function generateDemoKeyPoints(type: string, marks: number): string[] {
  if (type === 'mcq') return ['Correct option selected'];
  const points: string[] = [];
  for (let i = 1; i <= Math.min(marks, 4); i++) { points.push(`Key point ${i} — ${i} mark${i > 1 ? 's' : ''}`); }
  return points;
}

export default TeacherQPReview;
