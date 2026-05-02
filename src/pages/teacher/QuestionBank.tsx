// Teacher Question Bank — list view with three tabs (My Bank, School Bank, Pending).
// CRUD via QuestionEditorDialog, bulk import via BulkImportDialog, bulk actions
// (delete / submit-for-approval) on selected rows.
import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { questionBankStore, type BankQuestion, type BankFilter } from '@/data/questionBankData';
import { syllabusBank } from '@/data/syllabusData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Library, Plus, Upload, Trash2, Send, BookOpen } from 'lucide-react';
import QuestionCard from '@/components/question-bank/QuestionCard';
import BankFilters from '@/components/question-bank/BankFilters';
import QuestionEditorDialog from '@/components/question-bank/QuestionEditorDialog';
import BulkImportDialog from '@/components/question-bank/BulkImportDialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type TabKey = 'my' | 'school' | 'pending';

const TeacherQuestionBank: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.username || 'teacher-current';
  const userName = user?.username || 'You';

  const [tab, setTab] = useState<TabKey>('my');
  const [filter, setFilter] = useState<BankFilter>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editorOpen, setEditorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<BankQuestion | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BankQuestion | null>(null);

  // Tab-specific scope on top of filters
  const scopedFilter: BankFilter = useMemo(() => {
    if (tab === 'my') return { ...filter, visibility: 'private', visibleTo: userId };
    if (tab === 'school') return { ...filter, visibility: 'approved' };
    return { ...filter, visibility: 'pending' };
  }, [tab, filter, userId]);

  const { results } = useQuestionBank(scopedFilter);

  // Tab counts (independent of filter rail so badges stay stable)
  const all = useQuestionBank({ visibleTo: userId }).results;
  const counts = useMemo(() => ({
    my: all.filter(q => q.visibility === 'private' && q.createdBy === userId).length,
    school: all.filter(q => q.visibility === 'approved').length,
    pending: all.filter(q => q.visibility === 'pending').length,
  }), [all, userId]);

  // Class/subject/chapter options for the filter rail
  const classes = useMemo(() => Array.from(new Set(syllabusBank.map(s => s.className))), []);
  const subjects = useMemo(() => Array.from(new Set(syllabusBank
    .filter(s => !filter.className || s.className === filter.className)
    .map(s => s.subject))), [filter.className]);
  const chapters = useMemo(() => Array.from(new Set(syllabusBank
    .filter(s => (!filter.className || s.className === filter.className) && (!filter.subject || s.subject === filter.subject))
    .flatMap(s => s.chapters.map(c => c.name)))), [filter.className, filter.subject]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const clearSelection = () => setSelected(new Set());

  const handleSave = (
    q: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>,
    mode: 'private' | 'pending',
  ) => {
    if (editing) {
      questionBankStore.update(editing.id, q);
      toast({ title: 'Question updated' });
    } else {
      questionBankStore.add(q);
      toast({
        title: mode === 'private' ? 'Saved to My Bank' : 'Submitted for approval',
        description: mode === 'pending' ? 'An admin will review it shortly.' : undefined,
      });
    }
    setEditing(null);
  };

  const handleBulkSubmit = () => {
    questionBankStore.bulkUpdate(Array.from(selected), { visibility: 'pending' });
    toast({ title: `${selected.size} question${selected.size === 1 ? '' : 's'} submitted for approval` });
    clearSelection();
  };
  const handleBulkDelete = () => {
    questionBankStore.bulkRemove(Array.from(selected));
    toast({ title: `${selected.size} question${selected.size === 1 ? '' : 's'} deleted` });
    clearSelection();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Library className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Question Bank</h1>
            <p className="text-xs text-muted-foreground">Reusable, vetted questions you and your school can pull into any paper.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4" /> Bulk import
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setEditorOpen(true); }}>
            <Plus className="w-4 h-4" /> Add question
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={v => { setTab(v as TabKey); clearSelection(); }}>
        <TabsList className="h-12 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="my" className="rounded-lg px-4 gap-2">
            My Bank <Badge variant="secondary" className="text-[10px]">{counts.my}</Badge>
          </TabsTrigger>
          <TabsTrigger value="school" className="rounded-lg px-4 gap-2">
            <BookOpen className="w-3.5 h-3.5" /> School Bank <Badge variant="secondary" className="text-[10px]">{counts.school}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg px-4 gap-2">
            Pending <Badge variant="secondary" className="text-[10px]">{counts.pending}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
            <BankFilters filter={filter} onChange={setFilter} classes={classes} subjects={subjects} chapters={chapters} />

            <div className="space-y-3">
              {/* Bulk action bar */}
              {selected.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-primary/5">
                  <span className="text-xs text-foreground">{selected.size} selected</span>
                  <div className="ml-auto flex items-center gap-2">
                    {tab === 'my' && (
                      <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleBulkSubmit}>
                        <Send className="w-3.5 h-3.5" /> Submit for approval
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive" onClick={handleBulkDelete}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={clearSelection}>Clear</Button>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">{results.length} question{results.length === 1 ? '' : 's'}</p>

              {results.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-card p-10 text-center">
                  <Library className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground font-medium">No questions here yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tab === 'my' && 'Add a question or import from CSV to start building your bank.'}
                    {tab === 'school' && 'No approved school-wide questions match your filters.'}
                    {tab === 'pending' && 'Nothing waiting for admin review.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {results.map(q => (
                    <QuestionCard
                      key={q.id}
                      q={q}
                      selected={selected.has(q.id)}
                      onToggle={toggle}
                      onEdit={(tab === 'my' || q.createdBy === userId) ? (qq) => { setEditing(qq); setEditorOpen(true); } : undefined}
                      onDelete={(tab === 'my' || q.createdBy === userId) ? setConfirmDelete : undefined}
                      onSubmitForApproval={tab === 'my' ? (qq) => {
                        questionBankStore.update(qq.id, { visibility: 'pending' });
                        toast({ title: 'Submitted for approval' });
                      } : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <QuestionEditorDialog
        open={editorOpen}
        onOpenChange={(o) => { setEditorOpen(o); if (!o) setEditing(null); }}
        initial={editing}
        currentUserId={userId}
        currentUserName={userName}
        onSave={handleSave}
      />
      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        currentUserId={userId}
        currentUserName={userName}
        defaultClassName="Class 10"
        defaultSubject="Science"
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the question from the bank.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  questionBankStore.remove(confirmDelete.id);
                  toast({ title: 'Question deleted' });
                }
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherQuestionBank;
