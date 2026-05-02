import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';
import { useMasterData } from '@/contexts/MasterDataContext';

const examTypes = ['Unit Test', 'Mid-Term', 'Quarterly', 'Half-Yearly', 'Annual', 'Pre-Board'];


interface Exam {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
}

const CreateExam = () => {
  const navigate = useNavigate();
  const { updateStepProgress } = useMasterData();

  const [exams, setExams] = useState<Exam[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetForm = () => {
    setName('');
    setType('');
    setStartDate('');
    setEndDate('');
    setEditingExam(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    setName(exam.name);
    setType(exam.type);
    setStartDate(exam.startDate);
    setEndDate(exam.endDate);
    setDialogOpen(true);
  };


  const handleSave = () => {
    if (!name.trim() || !type || !startDate || !endDate) {
      toast.error('Please fill all fields.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date.');
      return;
    }

    if (editingExam) {
      setExams(prev => prev.map(e => e.id === editingExam.id ? { ...e, name, type, startDate, endDate } : e));
      toast.success('Exam updated successfully.');
    } else {
      const newExam: Exam = { id: crypto.randomUUID(), name, type, startDate, endDate };
      const updated = [...exams, newExam];
      setExams(updated);
      updateStepProgress('create-exam', updated.length, 1);
      toast.success('Exam created successfully.');
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = exams.filter(e => e.id !== id);
    setExams(updated);
    updateStepProgress('create-exam', updated.length, 1);
    toast.success('Exam deleted.');
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Create Exam</h2>
          <p className="text-muted-foreground text-sm mt-1">Schedule exams and assign classes & subjects</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> New Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card className="card-shadow">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No exams created yet. Click "New Exam" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map(exam => (
            <Card key={exam.id} className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-foreground text-sm">{exam.name}</h3>
                      <Badge variant="secondary" className="text-xs">{exam.type}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(exam.startDate)} – {formatDate(exam.endDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(exam)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(exam.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExam ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Exam Name</Label>
                <Input placeholder="e.g. Mid-Term 2025" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Exam Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {examTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingExam ? 'Update Exam' : 'Create Exam'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MasterDataStepFooter currentStepId="create-exam" />
    </div>
  );
};

export default CreateExam;
