import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, ChevronRight, Plus, FileSearch, FilePlus2, Pencil, Eye, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePaperWorkflow } from '@/contexts/PaperWorkflowContext';
import { usePapers } from '@/hooks/usePapers';
import WorkflowStatusBadge from '@/components/question-papers/WorkflowStatusBadge';
import type { WorkflowStatus } from '@/types/paperWorkflow';

const statusTabs: { label: string; filter: WorkflowStatus[] }[] = [
  { label: 'All', filter: [] },
  { label: 'Pending Review', filter: ['under-review'] },
  { label: 'Answer Key', filter: ['answer-key-draft'] },
  { label: 'Completed', filter: ['approved', 'answer-key-finalized'] },
  { label: 'Changes Sent', filter: ['changes-requested'] },
];

const TeacherQPReviewList = () => {
  const navigate = useNavigate();

  const { getTeacherWorkflows } = usePaperWorkflow();
  const { getPaper } = usePapers();
  // Show all workflows for prototype (no real auth filtering)
  const allWorkflows = getTeacherWorkflows();
  const filtered = allWorkflows;

  const getActionLabel = (status: WorkflowStatus) => {
    switch (status) {
      case 'under-review': return 'Review Paper';
      case 'changes-requested': return 'View Changes';
      case 'approved': return 'View';
      case 'answer-key-draft': return 'Review Answer Key';
      case 'answer-key-finalized': return 'View Final';
      default: return 'View';
    }
  };

  const getActionVariant = (status: WorkflowStatus): 'default' | 'outline' => {
    return ['under-review', 'answer-key-draft'].includes(status) ? 'default' : 'outline';
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Review Question Papers</h1>
        <p className="text-sm text-muted-foreground mt-1">Review papers assigned to you</p>
      </div>

      <ReviewTabContent allWorkflows={allWorkflows} filtered={filtered} getPaper={getPaper} navigate={navigate} getActionLabel={getActionLabel} getActionVariant={getActionVariant} />
    </div>
  );
};

interface ReviewTabContentProps {
  allWorkflows: ReturnType<ReturnType<typeof usePaperWorkflow>['getTeacherWorkflows']>;
  filtered: ReturnType<ReturnType<typeof usePaperWorkflow>['getTeacherWorkflows']>;
  getPaper: ReturnType<typeof usePapers>['getPaper'];
  navigate: ReturnType<typeof useNavigate>;
  getActionLabel: (status: WorkflowStatus) => string;
  getActionVariant: (status: WorkflowStatus) => 'default' | 'outline';
}

const ReviewTabContent = ({ allWorkflows, filtered, getPaper, navigate, getActionLabel, getActionVariant }: ReviewTabContentProps) => {
  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Pending Review', count: allWorkflows.filter(w => w.workflowStatus === 'under-review').length, color: 'text-blue-600' },
          { label: 'Changes Sent', count: allWorkflows.filter(w => w.workflowStatus === 'changes-requested').length, color: 'text-warning' },
          { label: 'Answer Keys', count: allWorkflows.filter(w => w.workflowStatus === 'answer-key-draft').length, color: 'text-purple' },
          { label: 'Finalized', count: allWorkflows.filter(w => w.workflowStatus === 'answer-key-finalized').length, color: 'text-success' },
        ].map(s => (
          <Card key={s.label} className="card-shadow">
            <CardContent className="p-3 text-center">
              <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paper cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No papers in this category</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(workflow => {
            const paper = getPaper(workflow.paperId);
            if (!paper) return null;

            return (
              <Card key={workflow.paperId} className="card-shadow hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-foreground">{paper.details.subject}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{paper.details.className}</span>
                        <WorkflowStatusBadge status={workflow.workflowStatus} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{paper.details.examName}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {workflow.dueDate}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={getActionVariant(workflow.workflowStatus)}
                      size="sm"
                      className={cn(
                        'shrink-0',
                        getActionVariant(workflow.workflowStatus) === 'default' && 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      )}
                      onClick={() => navigate(`/teacher/qp-review/${workflow.paperId}`)}
                    >
                      {getActionLabel(workflow.workflowStatus)}
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const CreateTabContent = ({ navigate }: { navigate: ReturnType<typeof useNavigate> }) => {
  const { papers } = usePapers();
  const drafts = papers.filter(p => p.status === 'draft');
  const published = papers.filter(p => p.status === 'published');

  return (
    <div className="space-y-5">
      {/* Action banner */}
      <Card className="card-shadow rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <FilePlus2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Build a new question paper</h3>
              <p className="text-sm text-muted-foreground">Pick a template or start blank — sections, marks and answer keys all in one place.</p>
            </div>
          </div>
          <Button size="sm" className="gap-2 rounded-xl shrink-0" onClick={() => navigate('/teacher/qp-builder/new')}>
            <Plus className="w-4 h-4" /> New Paper
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-shadow rounded-2xl"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-0.5">Total</p><p className="text-2xl font-bold text-foreground">{papers.length}</p></CardContent></Card>
        <Card className="card-shadow rounded-2xl"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-0.5">Drafts</p><p className="text-2xl font-bold text-warning">{drafts.length}</p></CardContent></Card>
        <Card className="card-shadow rounded-2xl"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-0.5">Published</p><p className="text-2xl font-bold text-success">{published.length}</p></CardContent></Card>
      </div>

      {/* Papers list */}
      <div className="space-y-3">
        {papers.length === 0 ? (
          <Card className="card-shadow rounded-2xl">
            <CardContent className="p-12 text-center">
              <FilePlus2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No question papers yet. Create your first one.</p>
            </CardContent>
          </Card>
        ) : (
          papers.map(paper => {
            const isDraft = paper.status === 'draft';
            return (
              <Card key={paper.id} className="card-shadow rounded-2xl hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-foreground">{paper.details.subject || 'Untitled'}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{paper.details.className || '—'}</span>
                        <Badge className={cn('text-[10px] border', isDraft ? 'bg-warning-light text-warning border-warning/30' : 'bg-success/10 text-success border-success/30')}>
                          {isDraft ? 'Draft' : 'Published'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{paper.details.examName || 'No exam name'}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated {paper.updatedAt}</span>
                        <span>{paper.currentMarks}/{paper.details.targetMarks} marks</span>
                      </div>
                    </div>
                    <Button
                      variant={isDraft ? 'default' : 'outline'}
                      size="sm"
                      className={cn('shrink-0', isDraft && 'bg-primary hover:bg-primary/90 text-primary-foreground')}
                      onClick={() => navigate(`/teacher/qp-builder/${paper.id}`)}
                    >
                      {isDraft ? <><Pencil className="w-3.5 h-3.5 mr-1" />Continue</> : <><Eye className="w-3.5 h-3.5 mr-1" />View</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TeacherQPReviewList;
