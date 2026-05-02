import React, { useMemo, useState } from 'react';
import { FileText, CheckCircle2, Clock, RefreshCw, ChevronDown, Search, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  getTeacherAssignments,
  reportStatusStore,
  useReportStatus,
} from '@/data/reportStatusStore';

const exams = [
  { id: 'FA1', name: 'FA1 (Formative Assessment 1)' },
  { id: 'FA2', name: 'FA2 (Formative Assessment 2)' },
  { id: 'SA1', name: 'SA1 (Summative Assessment 1)' },
  { id: 'FA3', name: 'FA3 (Formative Assessment 3)' },
  { id: 'FA4', name: 'FA4 (Formative Assessment 4)' },
  { id: 'SA2', name: 'SA2 (Summative Assessment 2)' },
];

const TeacherReports = () => {
  const { user, selectedExamType, setSelectedExamType } = useAuth();
  const selectedExam = exams.find(e => e.id === selectedExamType) || exams[0];
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  useReportStatus(); // subscribe re-render

  const assignments = useMemo(() => getTeacherAssignments(selectedExam.id), [selectedExam.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(
      a =>
        a.className.toLowerCase().includes(q) ||
        a.section.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q),
    );
  }, [assignments, search]);

  const total = assignments.length;
  const generated = assignments.filter(a =>
    reportStatusStore.has(a.className, a.section, a.subject, selectedExam.id),
  ).length;
  const pending = total - generated;
  const pct = total ? Math.round((generated / total) * 100) : 0;

  const handleGenerate = (className: string, section: string, subject: string) => {
    const key = `${className}-${section}-${subject}`;
    setBusyKey(key);
    setTimeout(() => {
      reportStatusStore.markGenerated(className, section, subject, selectedExam.id, user?.username);
      setBusyKey(null);
      toast.success(`Reports generated for ${className} • ${section} • ${subject}`);
    }, 600);
  };

  const handleGenerateAll = () => {
    const remaining = assignments.filter(
      a => !reportStatusStore.has(a.className, a.section, a.subject, selectedExam.id),
    );
    if (!remaining.length) {
      toast.info('All reports already generated for this exam.');
      return;
    }
    setBusyKey('__all__');
    setTimeout(() => {
      reportStatusStore.markBatch(remaining, selectedExam.id, user?.username);
      setBusyKey(null);
      toast.success(`Generated ${remaining.length} report sets`);
    }, 800);
  };

  // group by class for display
  const grouped = useMemo(() => {
    const m = new Map<string, typeof filtered>();
    filtered.forEach(a => {
      if (!m.has(a.className)) m.set(a.className, []);
      m.get(a.className)!.push(a);
    });
    return Array.from(m.entries());
  }, [filtered]);

  return (
    <div className="space-y-5">
      {/* Exam selector */}
      <div className="relative">
        <button
          onClick={() => setExamDropdownOpen(!examDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full"
        >
          <span className="text-sm font-medium text-foreground flex-1 text-left truncate">
            {selectedExam.name}
          </span>
          <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform shrink-0', examDropdownOpen && 'rotate-180')} />
        </button>
        {examDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {exams.map(exam => (
              <button
                key={exam.id}
                onClick={() => { setSelectedExamType(exam.id); setExamDropdownOpen(false); }}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors',
                  selectedExam.id === exam.id && 'bg-primary/10 text-primary',
                )}
              >
                {exam.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-foreground">Student Reports</h1>
            <p className="text-sm text-muted-foreground">Generate detailed performance reports for your assigned classes</p>
          </div>
        </div>
        <Button onClick={handleGenerateAll} disabled={busyKey === '__all__'} className="gap-2 shrink-0">
          <Sparkles className={cn('w-4 h-4', busyKey === '__all__' && 'animate-pulse')} />
          {busyKey === '__all__' ? 'Generating…' : 'Generate All'}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-shadow border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{total}</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-l-4 border-l-success">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Generated</p>
            <p className="text-2xl font-bold text-success">{generated}</p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-l-4 border-l-warning">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">{pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search class, section, subject…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grouped list */}
      <div className="space-y-4">
        {grouped.map(([className, rows]) => (
          <Card key={className} className="card-shadow">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{className}</h3>
                <Badge variant="outline" className="text-xs">
                  {rows.filter(r => reportStatusStore.has(r.className, r.section, r.subject, selectedExam.id)).length}/{rows.length} done
                </Badge>
              </div>
              <div className="divide-y divide-border">
                {rows.map(r => {
                  const entry = reportStatusStore.get(r.className, r.section, r.subject, selectedExam.id);
                  const key = `${r.className}-${r.section}-${r.subject}`;
                  const busy = busyKey === key;
                  return (
                    <div key={key} className="flex items-center justify-between py-3 gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {r.section} • {r.subject}
                        </p>
                        {entry ? (
                          <p className="text-xs text-success flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Generated {new Date(entry.generatedAt).toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            Not generated yet
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={entry ? 'outline' : 'default'}
                        disabled={busy}
                        onClick={() => handleGenerate(r.className, r.section, r.subject)}
                        className="gap-1.5 shrink-0"
                      >
                        <RefreshCw className={cn('w-3.5 h-3.5', busy && 'animate-spin')} />
                        {entry ? 'Re-generate' : busy ? 'Generating…' : 'Generate'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        {grouped.length === 0 && (
          <Card className="card-shadow">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No assignments match your search.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherReports;
