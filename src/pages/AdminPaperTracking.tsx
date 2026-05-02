import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, RefreshCw, Eye, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePaperWorkflow } from '@/contexts/PaperWorkflowContext';
import { usePapers } from '@/hooks/usePapers';
import WorkflowStatusBadge from '@/components/question-papers/WorkflowStatusBadge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminPaperTracking = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const navigate = useNavigate();
  const { getWorkflow, updateStatus, addComment } = usePaperWorkflow();
  const { getPaper } = usePapers();

  const workflow = paperId ? getWorkflow(paperId) : undefined;
  const paper = paperId ? getPaper(paperId) : undefined;

  const [commentText, setCommentText] = useState('');
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);

  if (!workflow || !paper) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Workflow not found for this paper.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/question-papers')}>Back to Papers</Button>
      </div>
    );
  }

  const isChangesRequested = workflow.workflowStatus === 'changes-requested';
  const isUnderReview = workflow.workflowStatus === 'under-review';

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(paperId!, { author: 'Admin', role: 'admin', text: commentText.trim() });
    setCommentText('');
    toast.success('Comment added');
  };

  const handleResubmit = () => {
    if (commentText.trim()) {
      addComment(paperId!, { author: 'Admin', role: 'admin', text: commentText.trim() });
    }
    updateStatus(paperId!, 'under-review', 'Admin');
    setCommentText('');
    setShowResubmitDialog(false);
    toast.success('Paper resubmitted for review');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/question-papers')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{paper.details.className} — {paper.details.subject}</h2>
          <p className="text-sm text-muted-foreground">{paper.details.examName} • Review Tracking</p>
        </div>
        <WorkflowStatusBadge status={workflow.workflowStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info + Actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Assignment Info */}
          <Card className="card-shadow">
            <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Assignment Details</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned Teacher</p>
                    <p className="font-medium text-foreground">{workflow.assignedTeacherName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium text-foreground">{workflow.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Marks</p>
                    <p className="font-medium text-foreground">{paper.details.targetMarks}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sections / Questions</p>
                    <p className="font-medium text-foreground">{paper.sections.length} / {paper.sections.reduce((s: number, sec: any) => s + sec.questions.length, 0)}</p>
                  </div>
                </div>
              </div>
              {workflow.assignNote && (
                <div className="mt-3 bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Note sent to teacher:</p>
                  <p className="text-sm text-foreground">{workflow.assignNote}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Banner */}
          {isChangesRequested && (
            <Card className="card-shadow border-warning/30 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">Changes Requested by Teacher</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Review the teacher's feedback below, edit the paper, and resubmit for review.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/question-papers/${paperId}/edit`)}>
                        <FileText className="w-3.5 h-3.5 mr-1.5" /> Edit Paper
                      </Button>
                      <Button size="sm" onClick={() => setShowResubmitDialog(true)}>
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Resubmit for Review
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Answer Key Status */}
          {['answer-key-draft', 'answer-key-finalized'].includes(workflow.workflowStatus) && (
            <Card className="card-shadow border-purple/30 bg-purple/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-purple" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      {workflow.workflowStatus === 'answer-key-finalized' ? 'Answer Key Finalized' : 'Answer Key Draft Generated'}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {workflow.workflowStatus === 'answer-key-finalized'
                        ? 'The teacher has reviewed and finalized the answer key. This paper is complete.'
                        : 'The answer key draft has been generated. Waiting for teacher to review and finalize.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Thread */}
          <Card className="card-shadow">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Review Comments ({workflow.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-3">
              {workflow.comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No comments yet. The teacher hasn't submitted feedback.</p>
              )}
              {workflow.comments.map((comment: any) => (
                <div key={comment.id} className={cn(
                  'rounded-lg p-3 text-sm',
                  comment.role === 'admin' ? 'bg-primary/5 border border-primary/10' : 'bg-muted/50 border border-border'
                )}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-foreground">{comment.author}</span>
                    <Badge variant="outline" className={cn(
                      'text-[10px] px-1.5 py-0',
                      comment.role === 'admin' ? 'border-primary/30 text-primary' : 'border-warning/30 text-warning'
                    )}>
                      {comment.role === 'admin' ? 'Admin' : 'Teacher'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground ml-auto">{new Date(comment.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-foreground text-sm">{comment.text}</p>
                </div>
              ))}

              {/* Admin reply box */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Textarea
                  placeholder="Add a reply or note..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleAddComment} disabled={!commentText.trim()}>
                  <Send className="w-3 h-3 mr-1.5" /> Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Timeline + Quick Actions */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="card-shadow">
            <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/question-papers/${paperId}/preview`)}>
                <Eye className="w-4 h-4 mr-2" /> View Paper
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/question-papers/${paperId}/edit`)}>
                <FileText className="w-4 h-4 mr-2" /> Edit Paper
              </Button>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="card-shadow">
            <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Status Timeline</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-3">
                {workflow.statusHistory.map((entry: any, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-1.5 flex flex-col items-center">
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full',
                        i === workflow.statusHistory.length - 1 ? 'bg-primary ring-2 ring-primary/20' : 'bg-muted-foreground/30'
                      )} />
                      {i < workflow.statusHistory.length - 1 && <div className="w-px h-6 bg-border mt-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <WorkflowStatusBadge status={entry.status} className="text-[10px]" />
                      <p className="text-[11px] text-muted-foreground mt-0.5">{entry.by} • {new Date(entry.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Paper Details */}
          <Card className="card-shadow">
            <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Paper Summary</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span className="font-medium">{paper.details.className}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Subject</span><span className="font-medium">{paper.details.subject}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Exam</span><span className="font-medium">{paper.details.examName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Marks</span><span className="font-medium">{paper.details.targetMarks}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{paper.details.duration}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sections</span><span className="font-medium">{paper.sections.length}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resubmit Dialog */}
      <AlertDialog open={showResubmitDialog} onOpenChange={setShowResubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resubmit Paper for Review</AlertDialogTitle>
            <AlertDialogDescription>
              This will notify the teacher that the paper has been updated and is ready for another review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Optional note about changes made..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="min-h-[60px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResubmit}>Resubmit for Review</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPaperTracking;
