import React, { useState, useCallback, useRef } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  RotateCcw,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import YearContextChip from '@/components/enrollment/YearContextChip';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Mock Data ─────────────────────────────────────────────────────────────────

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

const statusConfig: Record<RowStatus, { icon: React.ElementType; label: string; rowClass: string; badgeClass: string }> = {
  valid: { icon: CheckCircle2, label: 'Valid', rowClass: '', badgeClass: 'bg-success/10 text-success border-success/20' },
  error: { icon: XCircle, label: 'Error', rowClass: 'bg-destructive/5', badgeClass: 'bg-destructive/10 text-destructive border-destructive/20' },
  warning: { icon: AlertTriangle, label: 'Warning', rowClass: 'bg-warning/5', badgeClass: 'bg-warning/10 text-warning border-warning/20' },
  unchanged: { icon: MinusCircle, label: 'Unchanged', rowClass: 'bg-muted/30', badgeClass: 'bg-muted text-muted-foreground border-border' },
};

// ── Component ─────────────────────────────────────────────────────────────────

const BulkEnrollmentImport = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'preview' | 'importing' | 'done'>('idle');
  const [fileName, setFileName] = useState('');
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);

  const summary = {
    processed: previewRows.length,
    added: previewRows.filter(r => r.status === 'valid').length,
    unchanged: previewRows.filter(r => r.status === 'unchanged').length,
    rejected: previewRows.filter(r => r.status === 'error').length,
    warnings: previewRows.filter(r => r.status === 'warning').length,
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({ title: 'Invalid file type', description: 'Please upload a CSV or XLSX file.', variant: 'destructive' });
      return;
    }
    setFileName(file.name);
    setUploadState('uploading');
    // Simulate parse delay
    await new Promise(r => setTimeout(r, 1200));
    setPreviewRows(mockPreview);
    setUploadState('preview');
    toast({ title: 'File parsed', description: `${mockPreview.length} rows found.` });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleImport = useCallback(async () => {
    setUploadState('importing');
    await new Promise(r => setTimeout(r, 1500));
    setUploadState('done');
    toast({ title: 'Import complete', description: `${summary.added} enrollments added successfully.` });
  }, [summary.added, toast]);

  const handleRetryFailed = useCallback(() => {
    setPreviewRows(prev => prev.filter(r => r.status === 'error'));
    toast({ title: 'Retry queue loaded', description: `${summary.rejected} failed rows ready for correction.` });
  }, [summary.rejected, toast]);

  const handleReset = useCallback(() => {
    setUploadState('idle');
    setPreviewRows([]);
    setFileName('');
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

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Bulk Enrollment Import</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Upload a CSV to enroll students into optional subjects in bulk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <YearContextChip />
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Upload area */}
      {(uploadState === 'idle' || uploadState === 'uploading') && (
        <Card
          className={cn(
            'card-shadow border-2 border-dashed transition-all duration-200 cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40',
            uploadState === 'uploading' && 'pointer-events-none opacity-80'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
        >
          <CardContent className="py-16 flex flex-col items-center gap-4">
            {uploadState === 'uploading' ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <div className="text-center">
                  <p className="font-medium text-foreground">Parsing {fileName}…</p>
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
                if (file) handleFileSelect(file);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      {(uploadState === 'preview' || uploadState === 'importing' || uploadState === 'done') && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <SummaryCard
              label="Rows Processed"
              value={summary.processed}
              icon={FileSpreadsheet}
              color="text-foreground"
              bg="bg-muted"
            />
            <SummaryCard
              label="Enrollments Added"
              value={summary.added}
              icon={CheckCircle2}
              color="text-success"
              bg="bg-success/10"
            />
            <SummaryCard
              label="Unchanged"
              value={summary.unchanged}
              icon={MinusCircle}
              color="text-muted-foreground"
              bg="bg-muted"
            />
            <SummaryCard
              label="Rejected"
              value={summary.rejected}
              icon={XCircle}
              color="text-destructive"
              bg="bg-destructive/10"
            />
          </div>

          {/* Validation grid */}
          <Card className="card-shadow mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Validation Preview</CardTitle>
                <div className="flex gap-1.5 text-xs text-muted-foreground">
                  {fileName && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <FileSpreadsheet className="w-3 h-3" />
                      {fileName}
                    </Badge>
                  )}
                </div>
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
                    const cfg = statusConfig[row.status];
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

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {uploadState === 'preview' && (
              <>
                <Button onClick={handleImport} className="gap-1.5">
                  <ArrowRight className="w-4 h-4" />
                  Import {summary.added} Enrollments
                </Button>
                {summary.rejected > 0 && (
                  <Button variant="outline" onClick={handleRetryFailed} className="gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry {summary.rejected} Failed Rows
                  </Button>
                )}
                <Button variant="ghost" onClick={handleReset}>
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
                <Button variant="outline" onClick={handleReset} className="ml-auto gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Import Another File
                </Button>
              </>
            )}
          </div>
        </>
      )}

      <MasterDataStepFooter currentStepId="bulk-enrollment" canProceed={true} />
    </div>
  );
};

// ── Summary Card ──────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon: Icon, color, bg }) => (
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

export default BulkEnrollmentImport;
