import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Copy, Edit2, Search, Trash2, Eye, UserCheck, ClipboardCheck, FileEdit, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePapers } from '@/hooks/usePapers';
import { usePaperWorkflow } from '@/contexts/PaperWorkflowContext';
import WorkflowStatusBadge from '@/components/question-papers/WorkflowStatusBadge';
import AssignTeacherModal from '@/components/question-papers/AssignTeacherModal';
import PageHeader from '@/components/admin/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import DataPagination from '@/components/admin/DataPagination';
import { usePagination } from '@/hooks/usePagination';

const QuestionPapers = () => {
  const navigate = useNavigate();
  const { papers, deletePaper, duplicatePaper } = usePapers();
  const { getWorkflow, assignPaper } = usePaperWorkflow();
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [assignModalPaper, setAssignModalPaper] = useState<string | null>(null);

  const uniqueClasses = [...new Set(papers.map(p => p.details.className))].filter(Boolean);

  const filtered = useMemo(() => papers.filter(p => {
    if (filterClass !== 'all' && p.details.className !== filterClass) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search && !p.details.subject.toLowerCase().includes(search.toLowerCase()) &&
        !p.details.examName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [papers, filterClass, filterStatus, search]);

  const { page, setPage, pageCount, pageItems, rangeLabel } = usePagination(filtered, 10);

  const assignTarget = assignModalPaper ? papers.find(p => p.id === assignModalPaper) : null;

  const handleAssign = (teacherId: string, teacherName: string, dueDate: string, note: string) => {
    if (!assignModalPaper) return;
    assignPaper(assignModalPaper, teacherId, teacherName, dueDate, note);
    toast.success(`Paper assigned to ${teacherName}`);
    setAssignModalPaper(null);
  };

  const totalPapers = papers.length;
  const assignedCount = papers.filter(p => getWorkflow(p.id)).length;
  const readyCount = papers.filter(p => p.status === 'published').length;
  const draftCount = papers.filter(p => p.status === 'draft' && !getWorkflow(p.id)).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Question Papers"
        description="Create, generate, review, and assign standardized question papers"
        icon={FileEdit}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/question-papers/create')}
              className="border-input"
            >
              <Plus className="w-4 h-4 mr-2" /> Create New Paper
            </Button>
            <Button
              onClick={() => navigate('/question-papers/ai-studio')}
              className="bg-gradient-to-r from-purple to-info hover:opacity-90 text-white shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Create with AI
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Papers', value: totalPapers, icon: FileText, tone: 'bg-purple-light text-purple' },
          { label: 'Under Review', value: assignedCount, icon: ClipboardCheck, tone: 'bg-info-light text-info' },
          { label: 'Ready to Assign', value: readyCount, icon: CheckCircle2, tone: 'bg-success/10 text-success' },
          { label: 'Drafts', value: draftCount, icon: Edit2, tone: 'bg-warning-light text-warning' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-card card-shadow p-5 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', s.tone)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionCard
        title="All Papers"
        description={rangeLabel}
        toolbar={
          <div className="flex items-center gap-2">
            <div className="relative w-44 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={filterClass} onValueChange={(v) => { setFilterClass(v); setPage(1); }}>
              <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        footer={<DataPagination page={page} pageCount={pageCount} onChange={setPage} rangeLabel={rangeLabel} />}
      >
        {pageItems.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No papers found. Create your first question paper.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pageItems.map(paper => {
              const wf = getWorkflow(paper.id);
              return (
                <div key={paper.id} className="rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                      if (wf) navigate(`/question-papers/${paper.id}/tracking`);
                      else if (paper.status === 'published') navigate(`/question-papers/${paper.id}/preview`);
                      else navigate(`/question-papers/${paper.id}/edit`);
                    }}>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-medium text-foreground">{paper.details.subject}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{paper.details.className}</span>
                        {wf
                          ? <WorkflowStatusBadge status={wf.workflowStatus} />
                          : <Badge variant="outline" className={cn('text-xs', paper.status === 'published' ? 'bg-success/10 text-success border-success/30' : 'bg-warning-light text-warning border-warning/30')}>
                              {paper.status === 'published' ? 'Published' : 'Draft'}
                            </Badge>
                        }
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>{paper.details.examName}</span>
                        <span>•</span>
                        <span>{paper.details.targetMarks} Marks</span>
                        <span>•</span>
                        <span>{paper.details.duration}</span>
                        {wf && (<><span>•</span><span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" />{wf.assignedTeacherName}</span></>)}
                        {!wf && paper.status === 'draft' && (
                          <><span>•</span><span className={cn('font-medium', paper.currentMarks < paper.details.targetMarks ? 'text-warning' : 'text-success')}>
                            {paper.currentMarks}/{paper.details.targetMarks} marks
                          </span></>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!wf && (
                        <Button variant="ghost" size="sm" title="Assign to Teacher" onClick={() => setAssignModalPaper(paper.id)}>
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                      {wf && (
                        <Button variant="ghost" size="sm" title="Track Review" onClick={() => navigate(`/question-papers/${paper.id}/tracking`)}>
                          <ClipboardCheck className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="Preview" onClick={() => navigate(`/question-papers/${paper.id}/preview`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!wf && (
                        <Button variant="ghost" size="sm" title="Edit" onClick={() => navigate(`/question-papers/${paper.id}/edit`)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="Duplicate" onClick={() => { duplicatePaper(paper.id); toast.success('Paper duplicated'); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Delete" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete paper?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{paper.details.subject} — {paper.details.examName}". This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { deletePaper(paper.id); toast.success('Paper deleted'); }}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <AssignTeacherModal
        open={!!assignModalPaper}
        onOpenChange={(v) => { if (!v) setAssignModalPaper(null); }}
        paperSubject={assignTarget?.details.subject || ''}
        paperClass={assignTarget?.details.className || ''}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default QuestionPapers;
