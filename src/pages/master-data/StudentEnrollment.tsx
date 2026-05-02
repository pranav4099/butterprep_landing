import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Search, CheckCircle2, Save, Loader2, X, User, Upload, Download,
  FileSpreadsheet, XCircle, AlertTriangle, MinusCircle, ArrowRight,
  GripVertical, BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import YearContextChip from '@/components/enrollment/YearContextChip';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';

// ── Data ──────────────────────────────────────────────────────────────────────

const allSubjects = [
  { id: 'math', name: 'Mathematics' },
  { id: 'english', name: 'English' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'science', name: 'Science' },
  { id: 'social', name: 'Social Science' },
  { id: 'computer', name: 'Computer Science' },
  { id: 'art', name: 'Art & Craft' },
  { id: 'pe', name: 'Physical Education' },
  { id: 'music', name: 'Music' },
  { id: 'sanskrit', name: 'Sanskrit' },
];

const subjectMap = Object.fromEntries(allSubjects.map(s => [s.id, s.name]));

// Per-section: which subjects are compulsory, which are available as optional
const sectionSubjectConfig: Record<string, { compulsory: string[]; optional: string[] }> = {
  '10-A': { compulsory: ['math', 'english', 'hindi'], optional: ['science', 'social', 'computer', 'art'] },
  '10-B': { compulsory: ['math', 'english', 'hindi'], optional: ['science', 'social', 'pe', 'music'] },
  '10-C': { compulsory: ['math', 'english', 'hindi'], optional: ['science', 'social', 'computer', 'sanskrit'] },
  '9-A':  { compulsory: ['math', 'english', 'hindi'], optional: ['science', 'social', 'computer'] },
  '9-B':  { compulsory: ['math', 'english', 'hindi'], optional: ['science', 'social', 'art'] },
};

const classNames = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
const sectionNames = ['A', 'B', 'C'];

interface Student {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  section: string;
  enrolledSubjects: string[]; // subjects the student is enrolled in (from optional pool)
  lastUpdated: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const generateStudents = (): Student[] => {
  const names = [
    'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Singh', 'Karthik Reddy',
    'Meera Iyer', 'Arjun Nair', 'Diya Chopra', 'Vikram Das', 'Sneha Rao',
    'Aditya Kumar', 'Ishaan Verma', 'Neha Joshi', 'Siddharth Bhat', 'Kavya Menon',
    'Rahul Mehta', 'Pooja Tiwari', 'Arnav Saxena', 'Riya Agarwal', 'Harsh Pandey',
  ];
  const students: Student[] = [];
  let id = 1;
  ['10', '9'].forEach(cls => {
    ['A', 'B', 'C'].forEach(sec => {
      const cfg = sectionSubjectConfig[`${cls}-${sec}`];
      const available = cfg?.optional || ['science', 'social'];
      names.slice(0, 6 + Math.floor(Math.random() * 4)).forEach((name, idx) => {
        const selectedOpt = available.slice(0, 1 + Math.floor(Math.random() * (available.length - 1)));
        students.push({
          id: `s${id++}`,
          name,
          rollNo: String(idx + 1).padStart(3, '0'),
          className: `Class ${cls}`,
          section: sec,
          enrolledSubjects: selectedOpt,
          lastUpdated: '2026-02-10',
          saveStatus: 'idle',
        });
      });
    });
  });
  return students;
};

// ── Bulk Import ───────────────────────────────────────────────────────────────

type RowStatus = 'valid' | 'error' | 'warning' | 'unchanged';

interface PreviewRow {
  row: number;
  studentName: string;
  rollNo: string;
  className: string;
  section: string;
  optionalSubjects: string;
  status: RowStatus;
  reason?: string;
}

const mockPreview: PreviewRow[] = [
  { row: 1, studentName: 'Aarav Sharma', rollNo: '001', className: 'Class 10', section: 'A', optionalSubjects: 'Science, Computer Science', status: 'valid' },
  { row: 2, studentName: 'Priya Patel', rollNo: '002', className: 'Class 10', section: 'A', optionalSubjects: 'Science, Art & Craft', status: 'valid' },
  { row: 3, studentName: 'Unknown Student', rollNo: '099', className: 'Class 10', section: 'A', optionalSubjects: 'Science', status: 'error', reason: 'Student not found in system' },
  { row: 4, studentName: 'Rohan Gupta', rollNo: '003', className: 'Class 10', section: 'A', optionalSubjects: 'Science, Social Science', status: 'unchanged', reason: 'No changes detected' },
  { row: 5, studentName: 'Ananya Singh', rollNo: '004', className: 'Class 10', section: 'B', optionalSubjects: 'Music, Dance', status: 'error', reason: '"Dance" is not available in Section B' },
  { row: 6, studentName: 'Karthik Reddy', rollNo: '005', className: 'Class 10', section: 'B', optionalSubjects: 'Science, PE', status: 'valid' },
  { row: 7, studentName: 'Meera Iyer', rollNo: '006', className: 'Class 10', section: 'A', optionalSubjects: 'Science, Computer Science', status: 'valid' },
  { row: 8, studentName: 'Arjun Nair', rollNo: '007', className: 'Class 9', section: 'A', optionalSubjects: '', status: 'warning', reason: 'No optional subjects specified' },
];

const bulkStatusConfig: Record<RowStatus, { icon: React.ElementType; label: string; rowClass: string; badgeClass: string }> = {
  valid: { icon: CheckCircle2, label: 'Valid', rowClass: '', badgeClass: 'bg-success/10 text-success border-success/20' },
  error: { icon: XCircle, label: 'Error', rowClass: 'bg-destructive/5', badgeClass: 'bg-destructive/10 text-destructive border-destructive/20' },
  warning: { icon: AlertTriangle, label: 'Warning', rowClass: 'bg-warning/5', badgeClass: 'bg-warning/10 text-warning border-warning/20' },
  unchanged: { icon: MinusCircle, label: 'Unchanged', rowClass: 'bg-muted/30', badgeClass: 'bg-muted text-muted-foreground border-border' },
};

const SummaryCard: React.FC<{ label: string; value: number; icon: React.ElementType; color: string; bg: string }> = ({ label, value, icon: Icon, color, bg }) => (
  <Card className="card-shadow">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

type EnrollmentStatus = 'none' | 'partial' | 'enrolled';

function getClassEnrollmentStatus(students: Student[], className: string): EnrollmentStatus {
  const classStudents = students.filter(s => s.className === className);
  if (classStudents.length === 0) return 'none';
  const hasEnrolled = classStudents.some(s => s.enrolledSubjects.length > 0);
  const allEnrolled = classStudents.every(s => s.enrolledSubjects.length > 0);
  if (allEnrolled) return 'enrolled';
  if (hasEnrolled) return 'partial';
  return 'none';
}

const enrollmentStatusConfig: Record<EnrollmentStatus, { label: string; dot: string; text: string }> = {
  enrolled: { label: 'Done', dot: 'bg-teal', text: 'text-teal' },
  partial: { label: 'Partial', dot: 'bg-warning', text: 'text-warning' },
  none: { label: 'Pending', dot: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
};

// ── Draggable Subject Pill ────────────────────────────────────────────────────

type Bucket = 'compulsory' | 'optional';

const SubjectPill: React.FC<{
  id: string;
  name: string;
  bucket?: Bucket;
  onRemove?: () => void;
}> = ({ id, name, bucket, onRemove }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('subject-id', id);
    if (bucket) e.dataTransfer.setData('source-bucket', bucket);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg text-sm font-medium',
        'border cursor-grab active:cursor-grabbing select-none transition-all',
        'hover:shadow-sm active:shadow-md active:scale-[1.02]',
        bucket === 'compulsory' && 'bg-teal/10 border-teal/25 text-foreground',
        bucket === 'optional' && 'bg-sky/10 border-sky/25 text-foreground',
        !bucket && 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      <GripVertical className="w-3 h-3 text-muted-foreground/50 shrink-0" />
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
          aria-label={`Remove ${name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// ── Drop Zone ─────────────────────────────────────────────────────────────────

const DropZone = React.forwardRef<HTMLDivElement, {
  bucket: Bucket;
  label: string;
  subjects: string[];
  onDrop: (subjectId: string, sourceBucket?: Bucket) => void;
  onRemove: (subjectId: string) => void;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}>(({ bucket, label, subjects, onDrop, onRemove, accentColor, accentBg, accentBorder }, ref) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const subjectId = e.dataTransfer.getData('subject-id');
    const source = e.dataTransfer.getData('source-bucket') as Bucket | '';
    if (subjectId && !subjects.includes(subjectId)) {
      onDrop(subjectId, source || undefined);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'rounded-xl border-2 border-dashed p-4 min-h-[120px] transition-all duration-200',
        dragOver ? `${accentBorder} ${accentBg} scale-[1.01] shadow-sm` : 'border-border/60 bg-muted/[0.02]',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-xs font-bold uppercase tracking-wider', accentColor)}>{label}</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{subjects.length}</Badge>
      </div>
      {subjects.length === 0 ? (
        <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/60 italic">
          Drag subjects here
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {subjects.map(id => (
            <SubjectPill
              key={id}
              id={id}
              name={subjectMap[id] || id}
              bucket={bucket}
              onRemove={() => onRemove(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
});
DropZone.displayName = 'DropZone';

// ── Component ─────────────────────────────────────────────────────────────────

const StudentEnrollment = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(generateStudents);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [activeSection, setActiveSection] = useState('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(() => {
    const initial = generateStudents().find(s => s.className === 'Class 10' && s.section === 'A');
    return initial?.id || null;
  });
  const [activeTab, setActiveTab] = useState('manual');
  const [savingStudent, setSavingStudent] = useState<string | null>(null);

  // Bulk import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'preview' | 'importing' | 'done'>('idle');
  const [bulkFileName, setBulkFileName] = useState('');
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);

  const classNum = selectedClass.replace('Class ', '');
  const sectionKey = `${classNum}-${activeSection}`;
  const sectionConfig = sectionSubjectConfig[sectionKey] || { compulsory: ['math', 'english', 'hindi'], optional: [] };

  const sectionStudents = useMemo(() => {
    return students.filter(s => s.className === selectedClass && s.section === activeSection);
  }, [students, selectedClass, activeSection]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return sectionStudents;
    const q = searchQuery.toLowerCase();
    return sectionStudents.filter(s =>
      s.name.toLowerCase().includes(q) || s.rollNo.includes(searchQuery)
    );
  }, [sectionStudents, searchQuery]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const sectionStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sectionNames.forEach(sec => {
      counts[sec] = students.filter(s => s.className === selectedClass && s.section === sec).length;
    });
    return counts;
  }, [students, selectedClass]);

  // Auto-select first student when section/class changes (not on every filter)
  const sectionKey2 = `${selectedClass}-${activeSection}`;
  const prevSectionKeyRef = useRef(sectionKey2);
  React.useEffect(() => {
    if (prevSectionKeyRef.current !== sectionKey2) {
      prevSectionKeyRef.current = sectionKey2;
      const first = students.find(s => s.className === selectedClass && s.section === activeSection);
      if (first) setSelectedStudentId(first.id);
      else setSelectedStudentId(null);
    }
  }, [sectionKey2, students, selectedClass, activeSection]);

  // Available subjects = optional subjects from section config that this student hasn't enrolled in
  const studentCompulsory = sectionConfig.compulsory;
  const studentOptional = selectedStudent?.enrolledSubjects || [];
  const availablePool = useMemo(() => {
    if (!selectedStudent) return [];
    const assigned = new Set([...studentCompulsory, ...studentOptional]);
    return sectionConfig.optional.filter(id => !assigned.has(id));
  }, [selectedStudent, studentCompulsory, studentOptional, sectionConfig]);

  const handleDropToBucket = useCallback((targetBucket: Bucket, subjectId: string, sourceBucket?: Bucket) => {
    if (!selectedStudentId) return;
    if (targetBucket === 'compulsory') return; // Can't add to compulsory

    setStudents(prev => prev.map(s => {
      if (s.id !== selectedStudentId) return s;
      const next = [...s.enrolledSubjects];
      if (!next.includes(subjectId)) next.push(subjectId);
      return { ...s, enrolledSubjects: next, saveStatus: 'idle' };
    }));
  }, [selectedStudentId]);

  const handleRemoveFromBucket = useCallback((bucket: Bucket, subjectId: string) => {
    if (!selectedStudentId) return;
    if (bucket === 'compulsory') return; // Can't remove compulsory

    setStudents(prev => prev.map(s => {
      if (s.id !== selectedStudentId) return s;
      return { ...s, enrolledSubjects: s.enrolledSubjects.filter(id => id !== subjectId), saveStatus: 'idle' };
    }));
  }, [selectedStudentId]);

  const handleSaveStudent = useCallback(async (studentId: string) => {
    setSavingStudent(studentId);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, saveStatus: 'saving' } : s));
    await new Promise(r => setTimeout(r, 500));
    setStudents(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, saveStatus: 'saved', lastUpdated: new Date().toISOString().split('T')[0] }
        : s
    ));
    setSavingStudent(null);
    toast({ title: 'Enrollment saved' });
    setTimeout(() => {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, saveStatus: 'idle' } : s));
    }, 2000);
  }, [toast]);

  // Bulk import handlers
  const bulkSummary = {
    processed: previewRows.length,
    added: previewRows.filter(r => r.status === 'valid').length,
    unchanged: previewRows.filter(r => r.status === 'unchanged').length,
    rejected: previewRows.filter(r => r.status === 'error').length,
  };

  const handleBulkFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({ title: 'Invalid file type', description: 'Please upload a CSV or XLSX file.', variant: 'destructive' });
      return;
    }
    setBulkFileName(file.name);
    setUploadState('uploading');
    await new Promise(r => setTimeout(r, 1200));
    setPreviewRows(mockPreview);
    setUploadState('preview');
    toast({ title: 'File parsed', description: `${mockPreview.length} rows found.` });
  }, [toast]);

  const handleBulkDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleBulkFileSelect(file);
  }, [handleBulkFileSelect]);

  const handleBulkImport = useCallback(async () => {
    setUploadState('importing');
    await new Promise(r => setTimeout(r, 1500));
    setUploadState('done');
    toast({ title: 'Import complete', description: `${bulkSummary.added} enrollments added successfully.` });
  }, [bulkSummary.added, toast]);

  const handleBulkReset = useCallback(() => {
    setUploadState('idle');
    setPreviewRows([]);
    setBulkFileName('');
  }, []);

  const downloadTemplate = useCallback(() => {
    const csv = 'Student Name,Roll No,Class,Section,Optional Subjects\nAarav Sharma,001,Class 10,A,"Science, Computer Science"\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enrollment_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Template downloaded' });
  }, [toast]);

  const isSaving = savingStudent === selectedStudentId;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Student Subject Enrollment</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Assign subjects to individual students by class and section
          </p>
        </div>
        <YearContextChip />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger
            value="manual"
            className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
          >
            <User className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </TabsTrigger>
        </TabsList>

        {/* ── Manual Entry Tab ── */}
        <TabsContent value="manual" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
            {/* Class sidebar */}
            <Card className="card-shadow h-fit sticky top-6">
              <CardContent className="p-2">
                <div className="space-y-0.5">
                  {classNames.map(c => {
                    const status = getClassEnrollmentStatus(students, c);
                    const cfg = enrollmentStatusConfig[status];
                    const isActive = c === selectedClass;
                    return (
                      <button
                        key={c}
                        onClick={() => { setSelectedClass(c); setActiveSection('A'); setSelectedStudentId(null); setSearchQuery(''); }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                          isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/60 text-foreground'
                        )}
                      >
                        <span>{c}</span>
                        <span className="flex items-center gap-1.5">
                          <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                          <span className={cn('text-[11px] font-medium', cfg.text)}>{cfg.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Main panel */}
            <Card className="card-shadow">
              <CardContent className="p-5 space-y-5">
                {/* Title + section tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-foreground">{selectedClass}</h3>
                  <Tabs value={activeSection} onValueChange={(v) => { setActiveSection(v); setSelectedStudentId(null); setSearchQuery(''); }}>
                    <TabsList className="h-9">
                      {sectionNames.map(sec => {
                        const count = sectionStudentCounts[sec] || 0;
                        return (
                          <TabsTrigger
                            key={sec}
                            value={sec}
                            className="text-xs px-5 py-2 gap-1.5 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                          >
                            Sec {sec}
                            {count > 0 && (
                              <span className="text-[10px] rounded-full px-1.5 font-bold ml-0.5 data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground bg-teal/15 text-teal">
                                {count}
                              </span>
                            )}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Student search filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search student by name or roll no…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search results dropdown */}
                {searchQuery && filteredStudents.length > 0 && (
                  <div className="border border-border rounded-lg bg-background shadow-md max-h-[200px] overflow-y-auto">
                    {filteredStudents.map(s => {
                      const isActive = s.id === selectedStudentId;
                      return (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedStudentId(s.id); setSearchQuery(''); }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors border-b border-border/50 last:border-0',
                            isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/60 text-foreground'
                          )}
                        >
                          <span className="flex-1 truncate">{s.name}</span>
                          <span className="text-[11px] text-muted-foreground shrink-0">Roll #{s.rollNo}</span>
                          {s.enrolledSubjects.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {searchQuery && filteredStudents.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-xs border border-border rounded-lg">
                    No students found matching "{searchQuery}"
                  </div>
                )}

                {/* Subject buckets for selected student */}
                {selectedStudent ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{selectedStudent.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            Roll #{selectedStudent.rollNo} · {selectedStudent.className} · Sec {selectedStudent.section}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSaveStudent(selectedStudent.id)}
                        disabled={isSaving}
                        className="gap-1.5"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {isSaving ? 'Saving…' : 'Save'}
                      </Button>
                    </div>

                    {/* Available pool */}
                    {availablePool.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                          Available Subjects ({availablePool.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {availablePool.map(id => (
                            <SubjectPill key={id} id={id} name={subjectMap[id] || id} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Two buckets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DropZone
                        bucket="compulsory"
                        label="Compulsory"
                        subjects={studentCompulsory}
                        onDrop={() => {}}
                        onRemove={() => {}}
                        accentColor="text-teal"
                        accentBg="bg-teal/5"
                        accentBorder="border-teal/40"
                      />
                      <DropZone
                        bucket="optional"
                        label="Optional"
                        subjects={studentOptional}
                        onDrop={(id, src) => handleDropToBucket('optional', id, src)}
                        onRemove={(id) => handleRemoveFromBucket('optional', id)}
                        accentColor="text-sky"
                        accentBg="bg-sky/5"
                        accentBorder="border-sky/40"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {studentCompulsory.length + studentOptional.length} subjects assigned
                      </span>
                      {selectedStudent.saveStatus === 'saved' && (
                        <span className="text-xs text-success flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Saved
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <User className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm">Search for a student to manage their subjects</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Bulk Import Tab ── */}
        <TabsContent value="bulk" className="space-y-4 mt-0">
          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download Template
            </Button>
          </div>

          {(uploadState === 'idle' || uploadState === 'uploading') && (
            <Card
              className={cn(
                'card-shadow border-2 border-dashed transition-all duration-200 cursor-pointer',
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
                uploadState === 'uploading' && 'pointer-events-none opacity-80'
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleBulkDrop}
              onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
            >
              <CardContent className="py-16 flex flex-col items-center gap-4">
                {uploadState === 'uploading' ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <div className="text-center">
                      <p className="font-medium text-foreground">Parsing {bulkFileName}…</p>
                      <p className="text-sm text-muted-foreground mt-1">Validating rows and checking subject mappings</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">Drag &amp; drop your CSV file here</p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse · CSV, XLSX supported</p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBulkFileSelect(file);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {(uploadState === 'preview' || uploadState === 'importing' || uploadState === 'done') && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard label="Rows Processed" value={bulkSummary.processed} icon={FileSpreadsheet} color="text-foreground" bg="bg-muted" />
                <SummaryCard label="Enrollments Added" value={bulkSummary.added} icon={CheckCircle2} color="text-success" bg="bg-success/10" />
                <SummaryCard label="Unchanged" value={bulkSummary.unchanged} icon={MinusCircle} color="text-muted-foreground" bg="bg-muted" />
                <SummaryCard label="Rejected" value={bulkSummary.rejected} icon={XCircle} color="text-destructive" bg="bg-destructive/10" />
              </div>

              <Card className="card-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Validation Preview</CardTitle>
                    {bulkFileName && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <FileSpreadsheet className="w-3 h-3" />
                        {bulkFileName}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[50px] font-semibold">#</TableHead>
                        <TableHead className="font-semibold">Student</TableHead>
                        <TableHead className="w-[70px] font-semibold">Roll</TableHead>
                        <TableHead className="font-semibold">Class</TableHead>
                        <TableHead className="font-semibold">Sec</TableHead>
                        <TableHead className="font-semibold">Optional Subjects</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map(row => {
                        const cfg = bulkStatusConfig[row.status];
                        const Icon = cfg.icon;
                        return (
                          <TableRow key={row.row} className={cfg.rowClass}>
                            <TableCell className="text-muted-foreground text-xs">{row.row}</TableCell>
                            <TableCell className="font-medium">{row.studentName}</TableCell>
                            <TableCell className="text-muted-foreground">{row.rollNo}</TableCell>
                            <TableCell className="text-sm">{row.className}</TableCell>
                            <TableCell className="text-sm">{row.section}</TableCell>
                            <TableCell className="text-sm">{row.optionalSubjects || '—'}</TableCell>
                            <TableCell>
                              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border', cfg.badgeClass)}>
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {row.reason || '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              <div className="flex items-center gap-3 flex-wrap">
                {uploadState === 'preview' && (
                  <>
                    <Button onClick={handleBulkImport} className="gap-1.5">
                      <ArrowRight className="w-4 h-4" />
                      Import {bulkSummary.added} Enrollments
                    </Button>
                    <Button variant="ghost" onClick={handleBulkReset}>
                      Upload Different File
                    </Button>
                  </>
                )}
                {uploadState === 'importing' && (
                  <Button disabled className="gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing…
                  </Button>
                )}
                {uploadState === 'done' && (
                  <>
                    <div className="flex items-center gap-2 text-success font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      Import completed successfully
                    </div>
                    <Button variant="outline" onClick={handleBulkReset} className="ml-auto gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      Import Another File
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <MasterDataStepFooter currentStepId="student-enrollment" canProceed={true} />
    </div>
  );
};

export default StudentEnrollment;
