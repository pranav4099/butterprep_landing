import React, { useState, useRef } from 'react';
import { Upload, User, BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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
  {
    id: '1',
    studentName: 'Aarav Mehta',
    rollNo: '14',
    className: 'Class 10',
    section: 'A',
    subject: 'Mathematics',
    requestedBy: 'Dr. Sharma',
    requestedOn: '28 Mar 2026',
    status: 'pending',
  },
  {
    id: '2',
    studentName: 'Priya Singh',
    rollNo: '22',
    className: 'Class 10',
    section: 'B',
    subject: 'Science',
    requestedBy: 'Mrs. Patel',
    requestedOn: '27 Mar 2026',
    status: 'pending',
  },
  {
    id: '3',
    studentName: 'Rohan Gupta',
    rollNo: '8',
    className: 'Class 9',
    section: 'A',
    subject: 'English',
    requestedBy: 'Mr. Gupta',
    requestedOn: '26 Mar 2026',
    status: 'pending',
  },
  {
    id: '4',
    studentName: 'Ananya Verma',
    rollNo: '31',
    className: 'Class 9',
    section: 'C',
    subject: 'Hindi',
    requestedBy: 'Ms. Verma',
    requestedOn: '25 Mar 2026',
    status: 're-uploaded',
  },
  {
    id: '5',
    studentName: 'Kabir Joshi',
    rollNo: '5',
    className: 'Class 10',
    section: 'C',
    subject: 'Social Studies',
    requestedBy: 'Mr. Singh',
    requestedOn: '27 Mar 2026',
    status: 'pending',
  },
  {
    id: '6',
    studentName: 'Diya Nair',
    rollNo: '19',
    className: 'Class 10',
    section: 'D',
    subject: 'Mathematics',
    requestedBy: 'Dr. Sharma',
    requestedOn: '26 Mar 2026',
    status: 'pending',
  },
];

const ReUploadPapers = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filtered = requests.filter(r => {
    if (filterClass !== 'all' && r.className !== filterClass) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const reUploadedCount = requests.filter(r => r.status === 're-uploaded').length;
  const uniqueClasses = [...new Set(requests.map(r => r.className))];

  const handleReUpload = (id: string) => {
    fileInputRefs.current[id]?.click();
  };

  const handleFileSelected = (id: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 're-uploaded' as const } : r))
    );
  };

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {pendingCount} Pending
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-light text-success text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {reUploadedCount} Re-uploaded
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-32 bg-background h-9 text-sm">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            <SelectItem value="all">All Classes</SelectItem>
            {uniqueClasses.map(cls => (
              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 bg-background h-9 text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-card z-50">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="re-uploaded">Re-uploaded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Request list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="p-8 text-center text-muted-foreground">
              No re-scan requests found.
            </CardContent>
          </Card>
        ) : (
          filtered.map(r => (
            <Card
              key={r.id}
              className={cn(
                'card-shadow transition-all',
                r.status === 'pending' && 'border-l-4 border-l-destructive'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {r.studentName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Roll No. {r.rollNo}
                      </span>
                    </div>

                    

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1.5">
                        {r.className} — {r.section}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {r.subject}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {r.requestedBy}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {r.requestedOn}
                      </span>
                    </div>
                  </div>

                  {r.status === 'pending' && (
                    <>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        ref={el => { fileInputRefs.current[r.id] = el; }}
                        onChange={() => handleFileSelected(r.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReUpload(r.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                      >
                        <Upload className="w-4 h-4 mr-1.5" />
                        Re-upload
                      </Button>
                    </>
                  )}
                  {r.status === 're-uploaded' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success text-white text-sm font-medium shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Re-uploaded
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReUploadPapers;
