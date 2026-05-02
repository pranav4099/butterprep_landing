import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';

interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'core' | 'non-core';
  className: string;
  displayOrder: number;
}

const subjectTypes = [
  { value: 'core', label: 'Core' },
  { value: 'non-core', label: 'Non-Core' },
];

const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const Subjects = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedClass, setSelectedClass] = useState('Class 10');

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', code: 'MATH', type: 'core', className: 'Class 10', displayOrder: 1 },
    { id: '2', name: 'Science', code: 'SCI', type: 'core', className: 'Class 10', displayOrder: 2 },
    { id: '3', name: 'English', code: 'ENG', type: 'core', className: 'Class 10', displayOrder: 3 },
    { id: '4', name: 'Social Studies', code: 'SS', type: 'core', className: 'Class 10', displayOrder: 4 },
    { id: '5', name: 'Hindi', code: 'HIN', type: 'non-core', className: 'Class 10', displayOrder: 5 },
    { id: '6', name: 'Computer Science', code: 'CS', type: 'non-core', className: 'Class 10', displayOrder: 6 },
    { id: '7', name: 'Mathematics', code: 'MATH', type: 'core', className: 'Class 9', displayOrder: 1 },
    { id: '8', name: 'Science', code: 'SCI', type: 'core', className: 'Class 9', displayOrder: 2 },
    { id: '9', name: 'English', code: 'ENG', type: 'core', className: 'Class 9', displayOrder: 3 },
  ]);

  const [formData, setFormData] = useState({ name: '', code: '', type: 'core' as Subject['type'], displayOrder: 1 });

  const filteredSubjects = subjects.filter(s => s.className === selectedClass).sort((a, b) => a.displayOrder - b.displayOrder);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, ...formData } : s));
      toast({ title: 'Subject updated successfully' });
    } else {
      setSubjects([...subjects, { id: Date.now().toString(), ...formData, className: selectedClass }]);
      toast({ title: 'Subject added successfully' });
    }
    setFormData({ name: '', code: '', type: 'core', displayOrder: filteredSubjects.length + 1 });
    setEditingSubject(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, code: subject.code, type: subject.type, displayOrder: subject.displayOrder });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    toast({ title: 'Subject deleted' });
  };

  const handleCopyFromClass = (sourceClass: string) => {
    const sourceSubjects = subjects.filter(s => s.className === sourceClass);
    const existingNames = filteredSubjects.map(s => s.name);
    const newSubjects = sourceSubjects
      .filter(s => !existingNames.includes(s.name))
      .map(s => ({ ...s, id: Date.now().toString() + Math.random(), className: selectedClass }));
    if (newSubjects.length > 0) {
      setSubjects([...subjects, ...newSubjects]);
      toast({ title: `${newSubjects.length} subjects copied from ${sourceClass}` });
    } else {
      toast({ title: 'All subjects already exist in this class' });
    }
  };

  const handleCopyToAllClasses = () => {
    const sourceSubjects = subjects.filter(s => s.className === selectedClass);
    if (sourceSubjects.length === 0) {
      toast({ title: 'No subjects to copy', description: 'Add subjects to this class first.' });
      return;
    }
    const otherClasses = classes.filter(c => c !== selectedClass);
    let totalCopied = 0;
    let newSubjects: Subject[] = [];
    for (const cls of otherClasses) {
      const existingNames = subjects.filter(s => s.className === cls).map(s => s.name);
      const toCopy = sourceSubjects
        .filter(s => !existingNames.includes(s.name))
        .map(s => ({ ...s, id: Date.now().toString() + Math.random() + cls, className: cls }));
      newSubjects = [...newSubjects, ...toCopy];
      totalCopied += toCopy.length;
    }
    if (totalCopied > 0) {
      setSubjects(prev => [...prev, ...newSubjects]);
      toast({ title: `Copied to ${otherClasses.length} classes`, description: `${totalCopied} subjects added across all classes.` });
    } else {
      toast({ title: 'All classes already have these subjects' });
    }
  };

  const typeColor: Record<string, string> = {
    core: 'default',
    'non-core': 'secondary',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Subjects</h2>
          <p className="text-muted-foreground text-sm mt-1">Subjects are class-specific — configure per class</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingSubject(null); setFormData({ name: '', code: '', type: 'core', displayOrder: filteredSubjects.length + 1 }); }}>
                <Plus className="w-4 h-4 mr-2" />Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingSubject ? 'Edit' : 'Add'} Subject for {selectedClass}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Subject Name</Label><Input placeholder="e.g., Mathematics" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div><Label>Subject Code</Label><Input placeholder="e.g., MATH" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required /></div>
                <div>
                  <Label>Subject Type</Label>
                  <Select value={formData.type} onValueChange={(v: Subject['type']) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{subjectTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Display Order</Label><Input type="number" min="1" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })} /></div>
                <Button type="submit" className="w-full">{editingSubject ? 'Update' : 'Add'} Subject</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Class selector + copy shortcut */}
      <div className="flex items-center gap-3 mt-5 mb-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Badge variant="secondary" className="text-xs">{filteredSubjects.length} subjects</Badge>
        <Button size="sm" className="ml-auto gap-1.5" onClick={handleCopyToAllClasses}>
          <Copy className="w-3.5 h-3.5" />Copy to All Classes
        </Button>
      </div>

      <Card className="card-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="text-muted-foreground">{subject.displayOrder}</TableCell>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell><Badge variant={typeColor[subject.type] as any} className="text-xs">{subject.type === 'core' ? 'Core' : 'Non-Core'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MasterDataStepFooter currentStepId="subjects" canProceed={subjects.length > 0} />
    </div>
  );
};

export default Subjects;
