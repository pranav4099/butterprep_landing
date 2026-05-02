import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';

interface AcademicYearData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const AcademicYear = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYearData | null>(null);
  const [years, setYears] = useState<AcademicYearData[]>([
    { id: '1', name: '2024-2025', startDate: '2024-04-01', endDate: '2025-03-31', isActive: true },
    { id: '2', name: '2023-2024', startDate: '2023-04-01', endDate: '2024-03-31', isActive: false },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingYear) {
      setYears(years.map(y => y.id === editingYear.id ? { ...y, ...formData } : y));
      toast({ title: 'Academic year updated successfully' });
    } else {
      const newYear: AcademicYearData = { id: Date.now().toString(), ...formData, isActive: false };
      setYears([...years, newYear]);
      toast({ title: 'Academic year added successfully' });
    }
    setFormData({ name: '', startDate: '', endDate: '' });
    setEditingYear(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (year: AcademicYearData) => {
    setEditingYear(year);
    setFormData({ name: year.name, startDate: year.startDate, endDate: year.endDate });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setYears(years.filter(y => y.id !== id));
    toast({ title: 'Academic year deleted' });
  };

  const handleSetActive = (id: string) => {
    setYears(years.map(y => ({ ...y, isActive: y.id === id })));
    toast({ title: 'Active academic year updated' });
  };

  const hasActiveYear = years.some(y => y.isActive);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Academic Year</h2>
          <p className="text-muted-foreground text-sm mt-1">Set the active academic year for your school</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingYear(null); setFormData({ name: '', startDate: '', endDate: '' }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Year
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingYear ? 'Edit' : 'Add'} Academic Year</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Year Name</Label>
                <Input id="name" placeholder="e.g., 2026–27" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full">{editingYear ? 'Update' : 'Add'} Academic Year</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Helpful hint */}
      {!hasActiveYear && years.length > 0 && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Set an active academic year to proceed to the next step.
          </p>
        </div>
      )}

      <Card className="card-shadow mt-5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {years.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-medium">{year.name}</TableCell>
                  <TableCell>{year.startDate}</TableCell>
                  <TableCell>{year.endDate}</TableCell>
                  <TableCell>
                    {year.isActive ? (
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleSetActive(year.id)}>Set Active</Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(year)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(year.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MasterDataStepFooter currentStepId="academic-year" canProceed={hasActiveYear} />
    </div>
  );
};

export default AcademicYear;
