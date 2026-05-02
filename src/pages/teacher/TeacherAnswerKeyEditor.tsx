import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Check, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TeacherAnswerKeyEditor = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const { getWorkflow, updateAnswerKeyEntry, finalizeAnswerKey } = usePaperWorkflow();
  const { getPaper } = usePapers();

  const workflow = paperId ? getWorkflow(paperId) : undefined;
  const paper = paperId ? getPaper(paperId) : undefined;
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);

  if (!workflow || !paper || !['answer-key-draft', 'answer-key-finalized'].includes(workflow.workflowStatus)) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Answer key not available</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/teacher/qp-review')}>
          Back to Reviews
        </Button>
      </div>
    );
  }

  const isFinalized = workflow.workflowStatus === 'answer-key-finalized';
  const answerKey = workflow.answerKey;
  const activeEntry = selectedQuestion ? answerKey.find(e => e.questionId === selectedQuestion) : answerKey[0];
  const activeQuestion = activeEntry
    ? paper.sections.flatMap(s => s.questions).find(q => q.id === activeEntry.questionId)
    : null;

  const handleUpdateAnswer = (field: string, value: string | string[]) => {
    if (!activeEntry || isFinalized) return;
    updateAnswerKeyEntry(paperId!, activeEntry.questionId, { [field]: value });
  };

  const handleFinalize = () => {
    finalizeAnswerKey(paperId!);
    setShowFinalizeDialog(false);
    toast.success('Answer key finalized successfully!');
    navigate('/teacher/qp-review');
  };

  const editedCount = answerKey.filter(e => e.isEdited).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/qp-review/${paperId}`)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Paper
            </Button>
            <div className="h-5 w-px bg-border" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Answer Key Editor</h2>
              <p className="text-xs text-muted-foreground">{paper.details.className} — {paper.details.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WorkflowStatusBadge status={workflow.workflowStatus} />
            <span className="text-xs text-muted-foreground">
              {editedCount}/{answerKey.length} edited
            </span>
            {!isFinalized && (
              <Button size="sm" onClick={() => setShowFinalizeDialog(true)}>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Finalize Answer Key
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Question Navigator */}
          <div className="lg:col-span-3">
            <Card className="card-shadow sticky top-20">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Questions</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-2 pt-0 max-h-[70vh] overflow-y-auto">
                {paper.sections.map(section => (
                  <div key={section.id} className="mb-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                      Section {section.label}
                    </p>
                    {section.questions.map(q => {
                      const entry = answerKey.find(e => e.questionId === q.id);
                      const isActive = (activeEntry?.questionId === q.id);
                      return (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQuestion(q.id)}
                          className={cn(
                            'w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all mb-0.5',
                            isActive
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Q{q.displayNumber}</span>
                            <div className="flex items-center gap-1">
                              {entry?.isEdited && (
                                <Edit3 className="w-3 h-3 text-primary" />
                              )}
                              <Badge variant="outline" className="text-[9px] px-1 py-0">{q.marks}m</Badge>
                            </div>
                          </div>
                          <p className="truncate mt-0.5 text-[10px]">{q.text.slice(0, 40)}...</p>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center: Question Reference */}
          <div className="lg:col-span-4">
            <Card className="card-shadow sticky top-20">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Question Reference</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {activeQuestion ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Q{activeQuestion.displayNumber}</Badge>
                      <Badge variant="outline" className="text-xs">Section {activeEntry?.sectionLabel}</Badge>
                      <Badge variant="outline" className="text-xs">{activeQuestion.marks} marks</Badge>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{activeQuestion.text}</p>
                    {activeQuestion.options && activeQuestion.options.length > 0 && (
                      <div className="space-y-1 bg-muted/30 rounded-lg p-3">
                        {activeQuestion.options.map((opt, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            ({String.fromCharCode(97 + i)}) {opt}
                          </p>
                        ))}
                      </div>
                    )}
                    {activeQuestion.subparts.length > 0 && (
                      <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                        {activeQuestion.subparts.map(sp => (
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
            <Card className="card-shadow sticky top-20">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {isFinalized ? 'Final Answer' : 'Edit Answer'}
                  </CardTitle>
                  {activeEntry?.isEdited && (
                    <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edited
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {activeEntry ? (
                  <div className="space-y-4">
                    {/* Model Answer */}
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Model Answer</label>
                      <Textarea
                        value={activeEntry.answer}
                        onChange={e => handleUpdateAnswer('answer', e.target.value)}
                        className="min-h-[100px] text-sm"
                        disabled={isFinalized}
                      />
                    </div>

                    {/* Key Points */}
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">
                        Key Points / Expected Answers
                      </label>
                      <div className="space-y-1.5">
                        {activeEntry.keyPoints.map((point, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground shrink-0 w-4">{i + 1}.</span>
                            <Input
                              value={point}
                              onChange={e => {
                                const updated = [...activeEntry.keyPoints];
                                updated[i] = e.target.value;
                                handleUpdateAnswer('keyPoints', updated);
                              }}
                              className="h-8 text-xs"
                              disabled={isFinalized}
                            />
                          </div>
                        ))}
                        {!isFinalized && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary"
                            onClick={() => handleUpdateAnswer('keyPoints', [...activeEntry.keyPoints, ''])}
                          >
                            + Add Key Point
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Marking Guidance */}
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1.5 block">Marking Guidance</label>
                      <Textarea
                        value={activeEntry.markingGuidance}
                        onChange={e => handleUpdateAnswer('markingGuidance', e.target.value)}
                        className="min-h-[60px] text-sm"
                        disabled={isFinalized}
                      />
                    </div>

                    {!isFinalized && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => toast.success('Answer saved')}
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save Changes
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
      </div>

      {/* Finalize Dialog */}
      <AlertDialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize Answer Key</AlertDialogTitle>
            <AlertDialogDescription>
              Once finalized, the answer key will be locked and submitted. You have edited {editedCount} out of {answerKey.length} answers. Are you sure you want to finalize?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize}>
              Finalize & Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherAnswerKeyEditor;
