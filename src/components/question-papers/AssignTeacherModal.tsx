import React, { useState, useMemo } from 'react';
import { Search, UserCheck, CalendarDays, StickyNote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { teachers, type TeacherProfile } from '@/data/teacherData';

interface AssignTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperSubject: string;
  paperClass: string;
  onAssign: (teacherId: string, teacherName: string, dueDate: string, note: string) => void;
}

const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  open, onOpenChange, paperSubject, paperClass, onAssign,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  // Suggest teachers who teach this subject, then show others
  const { suggested, others } = useMemo(() => {
    const subjectLower = paperSubject.toLowerCase();
    const s: TeacherProfile[] = [];
    const o: TeacherProfile[] = [];
    teachers.forEach(t => {
      const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.subjects.some(sub => sub.name.toLowerCase().includes(search.toLowerCase()));
      if (!matchesSearch) return;
      if (t.subjects.some(sub => sub.name.toLowerCase().includes(subjectLower))) {
        s.push(t);
      } else {
        o.push(t);
      }
    });
    return { suggested: s, others: o };
  }, [search, paperSubject]);

  const handleAssign = () => {
    if (!selectedTeacher || !dueDate) return;
    onAssign(selectedTeacher.id, selectedTeacher.name, dueDate, note);
    setSearch('');
    setSelectedTeacher(null);
    setDueDate('');
    setNote('');
  };

  const resetAndClose = (v: boolean) => {
    if (!v) { setSearch(''); setSelectedTeacher(null); setDueDate(''); setNote(''); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" /> Assign to Teacher
          </DialogTitle>
          <DialogDescription>
            Select a teacher to review the {paperClass} — {paperSubject} paper
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Teacher Search */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Select Teacher</Label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search by name or subject..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
              {suggested.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5 bg-success/5 border-b border-border">
                    Suggested — teaches {paperSubject}
                  </p>
                  {suggested.map(t => (
                    <TeacherRow key={t.id} teacher={t} selected={selectedTeacher?.id === t.id} onSelect={() => setSelectedTeacher(t)} />
                  ))}
                </div>
              )}
              {others.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5 bg-muted/50 border-b border-border">
                    Other Teachers
                  </p>
                  {others.map(t => (
                    <TeacherRow key={t.id} teacher={t} selected={selectedTeacher?.id === t.id} onSelect={() => setSelectedTeacher(t)} />
                  ))}
                </div>
              )}
              {suggested.length === 0 && others.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No teachers found</p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Due Date
            </Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-9 text-sm" />
          </div>

          {/* Note */}
          <div>
            <Label className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Note for Teacher <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea placeholder="Any specific instructions or areas to focus on..." value={note} onChange={e => setNote(e.target.value)} className="min-h-[60px] text-sm" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => resetAndClose(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedTeacher || !dueDate}>
            <UserCheck className="w-4 h-4 mr-1.5" /> Send for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TeacherRow: React.FC<{ teacher: TeacherProfile; selected: boolean; onSelect: () => void }> = ({ teacher, selected, onSelect }) => (
  <button
    onClick={onSelect}
    className={cn(
      'w-full text-left px-3 py-2 flex items-center justify-between transition-colors border-b border-border last:border-b-0',
      selected ? 'bg-primary/10' : 'hover:bg-muted/50'
    )}
  >
    <div>
      <p className="text-sm font-medium text-foreground">{teacher.name}</p>
      <p className="text-[11px] text-muted-foreground">
        {teacher.subjects.map(s => s.name).join(', ')}
      </p>
    </div>
    {selected && <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">Selected</Badge>}
  </button>
);

export default AssignTeacherModal;
