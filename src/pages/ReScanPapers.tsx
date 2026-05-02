import React, { useRef, useState, useMemo } from 'react';
import { Upload, User, BookOpen, Clock, CheckCircle2, AlertCircle, ScanSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import DataPagination from '@/components/admin/DataPagination';
import { usePagination } from '@/hooks/usePagination';

interface ReScanRequest {
  id: string;
  studentName: string;
  rollNo: string;
  className: string;
  section: string;
  subject: string;
  requestedBy: string;
  requestedOn: string;
  status: 'pending' | 're-uploaded';
}

const initialRequests: ReScanRequest[] = [
  { id: '1', studentName: 'Aarav Mehta', rollNo: '14', className: 'Class 10', section: 'A', subject: 'Mathematics', requestedBy: 'Dr. Sharma', requestedOn: '28 Mar 2026', status: 'pending' },
  { id: '2', studentName: 'Priya Singh', rollNo: '22', className: 'Class 10', section: 'B', subject: 'Science', requestedBy: 'Mrs. Patel', requestedOn: '27 Mar 2026', status: 'pending' },
  { id: '3', studentName: 'Rohan Gupta', rollNo: '8', className: 'Class 9', section: 'A', subject: 'English', requestedBy: 'Mr. Gupta', requestedOn: '26 Mar 2026', status: 'pending' },
  { id: '4', studentName: 'Ananya Verma', rollNo: '31', className: 'Class 9', section: 'C', subject: 'Hindi', requestedBy: 'Ms. Verma', requestedOn: '25 Mar 2026', status: 're-uploaded' },
  { id: '5', studentName: 'Kabir Joshi', rollNo: '5', className: 'Class 10', section: 'C', subject: 'Social Studies', requestedBy: 'Mr. Singh', requestedOn: '27 Mar 2026', status: 'pending' },
  { id: '6', studentName: 'Diya Nair', rollNo: '19', className: 'Class 10', section: 'D', subject: 'Mathematics', requestedBy: 'Dr. Sharma', requestedOn: '26 Mar 2026', status: 'pending' },
];

const ReScanPapers = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filtered = useMemo(() => requests.filter(r => {
    if (filterClass !== 'all' && r.className !== filterClass) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  }), [requests, filterClass, filterStatus]);

  const { page, setPage, pageCount, pageItems, rangeLabel } = usePagination(filtered, 10);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const reUploadedCount = requests.filter(r => r.status === 're-uploaded').length;
  const uniqueClasses = [...new Set(requests.map(r => r.className))];

  const handleReUpload = (id: string) => fileInputRefs.current[id]?.click();
  const handleFileSelected = (id: string) =>
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 're-uploaded' as const } : r));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Re-Scan Requests"
        description="Track and resolve scanning issues — blurry pages, missing content, wrong papers, and other upload errors."
        icon={ScanSearch}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {[
          { label: 'Pending', value: pendingCount, icon: AlertCircle, tone: 'bg-destructive/10 text-destructive' },
          { label: 'Re-uploaded', value: reUploadedCount, icon: CheckCircle2, tone: 'bg-success-light text-success' },
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
        title="Requests"
        description={rangeLabel}
        toolbar={
          <div className="flex items-center gap-2">
            <Select value={filterClass} onValueChange={(v) => { setFilterClass(v); setPage(1); }}>
              <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="re-uploaded">Re-uploaded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        footer={<DataPagination page={page} pageCount={pageCount} onChange={setPage} rangeLabel={rangeLabel} />}
      >
        {pageItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No re-scan requests found.</div>
        ) : (
          <div className="space-y-2">
            {pageItems.map(r => (
              <div
                key={r.id}
                className={cn(
                  'rounded-xl border bg-card hover:shadow-sm transition-all p-4',
                  r.status === 'pending' && 'border-l-4 border-l-destructive',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-foreground">{r.studentName}</span>
                      <span className="text-sm text-muted-foreground">Roll No. {r.rollNo}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span>{r.className} — {r.section}</span>
                      <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{r.subject}</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{r.requestedBy}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{r.requestedOn}</span>
                    </div>
                  </div>
                  {r.status === 'pending' ? (
                    <>
                      <input
                        type="file" accept="image/*,.pdf" className="hidden"
                        ref={el => { fileInputRefs.current[r.id] = el; }}
                        onChange={() => handleFileSelected(r.id)}
                      />
                      <Button size="sm" onClick={() => handleReUpload(r.id)} className="shrink-0">
                        <Upload className="w-4 h-4 mr-1.5" /> Re-upload
                      </Button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success text-white text-sm font-medium shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Re-uploaded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default ReScanPapers;
