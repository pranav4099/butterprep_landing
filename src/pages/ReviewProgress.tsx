import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, CheckCircle, Clock, Lock, ClipboardList } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import DataPagination from '@/components/admin/DataPagination';
import { usePagination } from '@/hooks/usePagination';

type AssignmentStatus = 'complete' | 'progress' | 'pending' | 'reviewed' | 'finalized';

const teachers: {
  name: string;
  batches: number;
  completed: number;
  total: number;
  percentage: number;
  assignments: { class: string; checked: number; total: number; percentage: number; status: AssignmentStatus }[];
}[] = [
  {
    name: 'Rajesh Kumar',
    batches: 3, completed: 135, total: 135, percentage: 100,
    assignments: [
      { class: 'Class 10 Section A - Mathematics', checked: 45, total: 45, percentage: 100, status: 'finalized' },
      { class: 'Class 10 Section B - Mathematics', checked: 42, total: 42, percentage: 100, status: 'reviewed' },
      { class: 'Class 10 Section C - Mathematics', checked: 48, total: 48, percentage: 100, status: 'reviewed' },
    ],
  },
  {
    name: 'Priya Sharma',
    batches: 3, completed: 122, total: 135, percentage: 90,
    assignments: [
      { class: 'Class 9 Section A - Science', checked: 42, total: 42, percentage: 100, status: 'finalized' },
      { class: 'Class 9 Section B - Science', checked: 45, total: 45, percentage: 100, status: 'reviewed' },
      { class: 'Class 9 Section C - Science', checked: 40, total: 48, percentage: 83, status: 'progress' },
    ],
  },
  {
    name: 'Amit Patel',
    batches: 2, completed: 45, total: 95, percentage: 47,
    assignments: [
      { class: 'Class 8 Section A - English', checked: 30, total: 45, percentage: 67, status: 'progress' },
      { class: 'Class 8 Section B - English', checked: 15, total: 50, percentage: 30, status: 'progress' },
    ],
  },
  {
    name: 'Sunita Verma',
    batches: 2, completed: 20, total: 100, percentage: 20,
    assignments: [
      { class: 'Class 10 Section A - Hindi', checked: 20, total: 45, percentage: 44, status: 'progress' },
      { class: 'Class 10 Section B - Hindi', checked: 0, total: 55, percentage: 0, status: 'pending' },
    ],
  },
];

const ReviewProgress = () => {
  const [expandedTeachers, setExpandedTeachers] = useState<string[]>(['Rajesh Kumar']);
  const { page, setPage, pageCount, pageItems, rangeLabel } = usePagination(teachers, 10);

  const toggleTeacher = (name: string) => {
    setExpandedTeachers(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'finalized': return <Lock className="w-5 h-5 text-emerald-600" />;
      case 'reviewed': case 'complete': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'progress': return <Clock className="w-5 h-5 text-warning" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    const map: Record<AssignmentStatus, { label: string; classes: string }> = {
      finalized: { label: 'Finalized', classes: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
      reviewed: { label: 'Reviewed', classes: 'bg-success/15 text-success border-success/40' },
      complete: { label: 'Complete', classes: 'bg-success/15 text-success border-success/40' },
      progress: { label: 'In Progress', classes: 'bg-warning/15 text-warning border-warning/40' },
      pending: { label: 'Pending', classes: 'bg-muted text-muted-foreground border-border' },
    };
    const { label, classes } = map[status];
    return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border', classes)}>{label}</span>;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Review Progress"
        description="Track paper checking progress for each teacher"
        icon={ClipboardList}
      />

      <SectionCard
        title="Teacher Assignments"
        description={rangeLabel}
        footer={<DataPagination page={page} pageCount={pageCount} onChange={setPage} rangeLabel={rangeLabel} />}
      >
        <div className="space-y-3">
          {pageItems.map((teacher) => (
            <div key={teacher.name} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => toggleTeacher(teacher.name)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTeachers.includes(teacher.name)
                    ? <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.batches} batches assigned</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{teacher.completed} / {teacher.total} papers</p>
                    <p className="text-xs text-muted-foreground">{teacher.percentage}% complete</p>
                  </div>
                  <Progress value={teacher.percentage} className="w-24 md:w-32 h-2" />
                </div>
              </button>

              {expandedTeachers.includes(teacher.name) && (
                <div className="px-4 pb-4 space-y-2 bg-muted/20">
                  {teacher.assignments.map((assignment, idx) => (
                    <div key={idx} className="p-3 md:p-4 rounded-lg border bg-card flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {getStatusIcon(assignment.status)}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground text-sm truncate">{assignment.class}</p>
                            {getStatusBadge(assignment.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {assignment.checked} / {assignment.total} papers checked
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Progress value={assignment.percentage} className="w-20 md:w-28 h-2" />
                        <span className="text-sm font-medium w-10 text-right tabular-nums">{assignment.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default ReviewProgress;
