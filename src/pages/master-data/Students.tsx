import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Search, Download, FileSpreadsheet } from 'lucide-react';
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
import DataPagination from '@/components/admin/DataPagination';
import { usePagination } from '@/hooks/usePagination';

interface Student {
  id: string;
  enrollmentNo: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  parentPhone: string;
}

const Students = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  const [students, setStudents] = useState<Student[]>([
    { id: '1', enrollmentNo: 'ENR001', rollNo: '1', firstName: 'Aarav', lastName: 'Sharma', class: 'Class 10', section: 'A', parentPhone: '9876543210' },
    { id: '2', enrollmentNo: 'ENR002', rollNo: '2', firstName: 'Priya', lastName: 'Patel', class: 'Class 10', section: 'A', parentPhone: '9876543211' },
    { id: '3', enrollmentNo: 'ENR003', rollNo: '3', firstName: 'Rohan', lastName: 'Gupta', class: 'Class 10', section: 'B', parentPhone: '9876543212' },
    { id: '4', enrollmentNo: 'ENR004', rollNo: '4', firstName: 'Sneha', lastName: 'Singh', class: 'Class 9', section: 'A', parentPhone: '9876543213' },
    { id: '5', enrollmentNo: 'ENR005', rollNo: '5', firstName: 'Arjun', lastName: 'Kumar', class: 'Class 9', section: 'B', parentPhone: '9876543214' },
  ]);

  const [formData, setFormData] = useState({ enrollmentNo: '', rollNo: '', firstName: '', lastName: '', class: '', section: '', parentPhone: '' });

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const sections = ['A', 'B', 'C', 'D'];

  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || s.enrollmentNo.includes(searchQuery);
    const matchesClass = filterClass === 'all' || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
      toast({ title: 'Student updated successfully' });
    } else {
      setStudents([...students, { id: Date.now().toString(), ...formData }]);
      toast({ title: 'Student added successfully' });
    }
    setFormData({ enrollmentNo: '', rollNo: '', firstName: '', lastName: '', class: '', section: '', parentPhone: '' });
    setEditingStudent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ enrollmentNo: student.enrollmentNo, rollNo: student.rollNo, firstName: student.firstName, lastName: student.lastName, class: student.class, section: student.section, parentPhone: student.parentPhone });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    toast({ title: 'Student deleted' });
  };

  const handleBulkUpload = () => {
    toast({ title: '📂 Upload feature coming soon', description: 'Excel upload will be available when backend is connected.' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Students</h2>
          <p className="text-muted-foreground text-sm mt-1">{students.length} students enrolled</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleBulkUpload}>
            <Upload className="w-4 h-4" />
            Import Excel
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Template
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingStudent(null); setFormData({ enrollmentNo: '', rollNo: '', firstName: '', lastName: '', class: '', section: '', parentPhone: '' }); }}>
                <Plus className="w-4 h-4 mr-2" />Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingStudent ? 'Edit' : 'Add'} Student</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="First name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Last name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enrollmentNo">Enrollment Number</Label>
                    <Input id="enrollmentNo" placeholder="e.g., ENR001" value={formData.enrollmentNo} onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="rollNo">Roll Number (Optional)</Label>
                    <Input id="rollNo" placeholder="e.g., 1" value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Class</Label>
                    <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Section</Label>
                    <Select value={formData.section} onValueChange={(v) => setFormData({ ...formData, section: v })}>
                      <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                      <SelectContent>{sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">{editingStudent ? 'Update' : 'Add'} Student</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mt-5 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or enrollment no..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter by class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <StudentsTable filteredStudents={filteredStudents} onEdit={handleEdit} onDelete={handleDelete} />

      <MasterDataStepFooter currentStepId="students" canProceed={students.length > 0} />
    </div>
  );
};

const StudentsTable: React.FC<{
  filteredStudents: Student[];
  onEdit: (s: Student) => void;
  onDelete: (id: string) => void;
}> = ({ filteredStudents, onEdit, onDelete }) => {
  const { page, setPage, pageCount, pageItems, rangeLabel } = usePagination(filteredStudents, 10);
  return (
    <Card className="card-shadow">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enrollment No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.enrollmentNo}</TableCell>
                <TableCell>{student.firstName} {student.lastName}</TableCell>
                <TableCell>{student.rollNo || '—'}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell><Badge variant="outline">{student.section}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(student)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(student.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">No students found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-3">
          <DataPagination page={page} pageCount={pageCount} onChange={setPage} rangeLabel={rangeLabel} />
        </div>
      </CardContent>
    </Card>
  );
};

export default Students;
