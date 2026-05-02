import React, { useState } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';

interface GradeRange {
  min: number;
  max: number;
}

interface Grade {
  id: string;
  name: string;
  ranges: Record<number, GradeRange>;
}


const MarksAndGrading = () => {
  const { toast } = useToast();
  
  const [weightages, setWeightages] = useState<number[]>([10, 20, 50, 100]);
  const [newWeightage, setNewWeightage] = useState('');
  const [showAddWeightage, setShowAddWeightage] = useState(false);

  const [grades, setGrades] = useState<Grade[]>([
    { id: '1', name: 'A+', ranges: { 10: { min: 9, max: 10 }, 20: { min: 18, max: 20 }, 50: { min: 45, max: 50 }, 100: { min: 90, max: 100 } } },
    { id: '2', name: 'A', ranges: { 10: { min: 8, max: 8 }, 20: { min: 16, max: 17 }, 50: { min: 40, max: 44 }, 100: { min: 80, max: 89 } } },
    { id: '3', name: 'B+', ranges: { 10: { min: 7, max: 7 }, 20: { min: 14, max: 15 }, 50: { min: 35, max: 39 }, 100: { min: 70, max: 79 } } },
    { id: '4', name: 'B', ranges: { 10: { min: 6, max: 6 }, 20: { min: 12, max: 13 }, 50: { min: 30, max: 34 }, 100: { min: 60, max: 69 } } },
    { id: '5', name: 'C', ranges: { 10: { min: 5, max: 5 }, 20: { min: 10, max: 11 }, 50: { min: 25, max: 29 }, 100: { min: 50, max: 59 } } },
    { id: '6', name: 'D', ranges: { 10: { min: 4, max: 4 }, 20: { min: 8, max: 9 }, 50: { min: 20, max: 24 }, 100: { min: 40, max: 49 } } },
    { id: '7', name: 'F', ranges: { 10: { min: 0, max: 3 }, 20: { min: 0, max: 7 }, 50: { min: 0, max: 19 }, 100: { min: 0, max: 39 } } },
  ]);

  const [editingCell, setEditingCell] = useState<{ gradeId: string; weightage: number } | null>(null);
  const [editValues, setEditValues] = useState({ min: '', max: '' });
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [editGradeName, setEditGradeName] = useState('');
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');

  const handleCellClick = (gradeId: string, weightage: number) => {
    const grade = grades.find(g => g.id === gradeId);
    if (grade) {
      const range = grade.ranges[weightage] || { min: 0, max: 0 };
      setEditValues({ min: range.min.toString(), max: range.max.toString() });
      setEditingCell({ gradeId, weightage });
    }
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const min = parseInt(editValues.min) || 0;
    const max = parseInt(editValues.max) || 0;
    setGrades(grades.map(g => g.id === editingCell.gradeId ? { ...g, ranges: { ...g.ranges, [editingCell.weightage]: { min, max } } } : g));
    setEditingCell(null);
    toast({ title: 'Range updated' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveCell();
    if (e.key === 'Escape') setEditingCell(null);
  };

  const handleAddWeightage = () => {
    const value = parseInt(newWeightage);
    if (value > 0 && !weightages.includes(value)) {
      setWeightages([...weightages, value].sort((a, b) => a - b));
      setGrades(grades.map(g => ({ ...g, ranges: { ...g.ranges, [value]: { min: 0, max: 0 } } })));
      setNewWeightage('');
      setShowAddWeightage(false);
      toast({ title: 'Weightage added' });
    }
  };

  const handleRemoveWeightage = (w: number) => {
    if (weightages.length <= 1) return;
    setWeightages(weightages.filter(x => x !== w));
    setGrades(grades.map(g => { const { [w]: _, ...rest } = g.ranges; return { ...g, ranges: rest }; }));
  };

  const handleAddGrade = () => {
    if (!newGradeName.trim()) return;
    setGrades([...grades, { id: Date.now().toString(), name: newGradeName.trim(), ranges: Object.fromEntries(weightages.map(w => [w, { min: 0, max: 0 }])) }]);
    setNewGradeName('');
    setShowAddGrade(false);
    toast({ title: 'Grade added' });
  };

  const handleRemoveGrade = (id: string) => {
    if (grades.length <= 1) return;
    setGrades(grades.filter(g => g.id !== id));
  };

  const handleGradeClick = (id: string, name: string) => { setEditingGrade(id); setEditGradeName(name); };
  const handleSaveGrade = () => {
    if (!editingGrade || !editGradeName.trim()) return;
    setGrades(grades.map(g => g.id === editingGrade ? { ...g, name: editGradeName.trim() } : g));
    setEditingGrade(null);
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Marks & Grading</h2>
          <p className="text-muted-foreground text-sm mt-1">Define how marks are calculated and graded</p>
        </div>
        {showAddWeightage ? (
          <div className="flex items-center gap-2">
            <Input type="number" placeholder="%" value={newWeightage} onChange={(e) => setNewWeightage(e.target.value)} className="w-24" autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddWeightage(); if (e.key === 'Escape') setShowAddWeightage(false); }} />
            <Button size="icon" variant="ghost" onClick={handleAddWeightage}><Check className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setShowAddWeightage(false)}><X className="w-4 h-4" /></Button>
          </div>
        ) : (
          <Button onClick={() => setShowAddWeightage(true)}><Plus className="w-4 h-4 mr-2" />Add Weightage</Button>
        )}
      </div>


      {/* Grade matrix */}
      <Card className="card-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 bg-muted/50 font-semibold">Grade</TableHead>
                {weightages.map((w) => (
                  <TableHead key={w} className="text-center min-w-[120px]">
                    <div className="flex items-center justify-center gap-1">
                      <span>{w}%</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => handleRemoveWeightage(w)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-semibold bg-muted/30 p-0">
                    {editingGrade === grade.id ? (
                      <div className="flex items-center gap-1 px-2">
                        <Input value={editGradeName} onChange={(e) => setEditGradeName(e.target.value)} className="w-16 h-8 text-sm font-semibold" autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveGrade(); if (e.key === 'Escape') setEditingGrade(null); }} />
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveGrade}><Check className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleRemoveGrade(grade.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <span className="cursor-pointer hover:text-primary px-4 py-2 block" onClick={() => handleGradeClick(grade.id, grade.name)}>{grade.name}</span>
                    )}
                  </TableCell>
                  {weightages.map((w) => {
                    const isEditing = editingCell?.gradeId === grade.id && editingCell?.weightage === w;
                    const range = grade.ranges[w] || { min: 0, max: 0 };
                    return (
                      <TableCell key={w} className={cn("text-center cursor-pointer transition-colors", isEditing ? "p-1" : "hover:bg-muted/50")} onClick={() => !isEditing && handleCellClick(grade.id, w)}>
                        {isEditing ? (
                          <div className="flex items-center gap-1 justify-center">
                            <Input type="number" value={editValues.min} onChange={(e) => setEditValues({ ...editValues, min: e.target.value })} className="w-14 h-8 text-center text-sm" autoFocus onKeyDown={handleKeyDown} />
                            <span className="text-muted-foreground">-</span>
                            <Input type="number" value={editValues.max} onChange={(e) => setEditValues({ ...editValues, max: e.target.value })} className="w-14 h-8 text-center text-sm" onKeyDown={handleKeyDown} />
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveCell}><Check className="w-3 h-3" /></Button>
                          </div>
                        ) : (
                          <span className="text-sm">{range.min} - {range.max}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="bg-muted/30 p-2" colSpan={weightages.length + 1}>
                  {showAddGrade ? (
                    <div className="flex items-center gap-2">
                      <Input placeholder="Grade name" value={newGradeName} onChange={(e) => setNewGradeName(e.target.value)} className="w-24 h-8" autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddGrade(); if (e.key === 'Escape') setShowAddGrade(false); }} />
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleAddGrade}><Check className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowAddGrade(false)}><X className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setShowAddGrade(true)} className="text-muted-foreground"><Plus className="w-3 h-3 mr-1" />Add Grade</Button>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-3">Click on any cell to edit the mark range. Press Enter to save or Escape to cancel.</p>

      <MasterDataStepFooter currentStepId="marks-grading" canProceed={grades.length > 0} />
    </div>
  );
};

export default MarksAndGrading;
