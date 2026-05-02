import React, { useMemo, useState } from 'react';
import { FileText, Download, CheckCircle2, Clock, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  REPORT_CATALOG,
  reportStatusStore,
  useReportStatus,
} from '@/data/reportStatusStore';

const buildCsvForSubject = (className: string, section: string, subject: string) => {
  const names = ['Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Singh', 'Arjun Kumar'];
  const rows = names.map((name, i) => {
    const marks = 60 + ((i * 7) % 35);
    const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : marks >= 60 ? 'B' : 'C';
    return [String(i + 1).padStart(2, '0'), name, marks, 100, grade].join(',');
  });
  return ['Roll No,Name,Marks,Max Marks,Grade', ...rows].join('\n');
};

type View =
  | { level: 'classes' }
  | { level: 'sections'; className: string }
  | { level: 'subjects'; className: string; section: string };

const PrintReports = () => {
  const { selectedExamType } = useAuth();
  const examType = selectedExamType || 'FA1';
  const [view, setView] = useState<View>({ level: 'classes' });
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'generating' | 'ready' | 'failed'>('all');
  useReportStatus();

  const isFailed = (className: string, section: string, subject: string) => {
    if (!reportStatusStore.has(className, section, subject, examType)) return false;
    const str = `${className}|${section}|${subject}|${examType}`;
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h) % 20 === 0;
  };

  // Stable "generating" classification (~15% of ready items) so it matches dashboard counts
  const isGenerating = (className: string, section: string, subject: string) => {
    if (!reportStatusStore.has(className, section, subject, examType)) return false;
    if (isFailed(className, section, subject)) return false;
    const str = `gen|${className}|${section}|${subject}|${examType}`;
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h) % 7 === 0;
  };

  const subjectMatchesFilter = (className: string, section: string, subject: string) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'failed') return isFailed(className, section, subject);
    if (statusFilter === 'generating') return isGenerating(className, section, subject);
    if (statusFilter === 'ready')
      return reportStatusStore.has(className, section, subject, examType)
        && !isFailed(className, section, subject)
        && !isGenerating(className, section, subject);
    return true;
  };

  const toggleFilter = (next: 'generating' | 'ready' | 'failed') =>
    setStatusFilter(prev => (prev === next ? 'all' : next));

  const dlKey = (c: string, s: string, sub: string) => `${c}|${s}|${sub}|${examType}`;
  const markDownloaded = (keys: string[]) =>
    setDownloaded(prev => {
      const next = new Set(prev);
      keys.forEach(k => next.add(k));
      return next;
    });

  // Stats for any scope
  const computeStats = (entries: Array<{ className: string; section: string; subject: string }>) => {
    let total = 0;
    let ready = 0;
    let failed = 0;
    entries.forEach(({ className, section, subject }) => {
      total++;
      if (reportStatusStore.has(className, section, subject, examType)) {
        if (isFailed(className, section, subject)) failed++;
        else ready++;
      }
    });
    const generating = Math.floor(ready * 0.15);
    return { total, generating, ready: ready - generating, failed };
  };

  const allEntries = useMemo(
    () =>
      REPORT_CATALOG.flatMap(c =>
        c.sections.flatMap(s =>
          s.subjects.map(sub => ({ className: c.className, section: s.name, subject: sub })),
        ),
      ),
    [],
  );

  const scopedEntries = useMemo(() => {
    if (view.level === 'classes') return allEntries;
    if (view.level === 'sections')
      return allEntries.filter(e => e.className === view.className);
    return allEntries.filter(
      e => e.className === view.className && e.section === view.section,
    );
  }, [view, allEntries]);

  const totals = useMemo(() => computeStats(scopedEntries), [scopedEntries, examType]);

  // Per-class quick stats for class grid
  const classStats = useMemo(() => {
    return REPORT_CATALOG.map(c => {
      const entries = c.sections.flatMap(s =>
        s.subjects.map(sub => ({ className: c.className, section: s.name, subject: sub })),
      );
      return { className: c.className, ...computeStats(entries) };
    });
  }, [examType]);

  const sectionStats = useMemo(() => {
    if (view.level === 'classes') return [];
    const cls = REPORT_CATALOG.find(c => c.className === view.className);
    if (!cls) return [];
    return cls.sections.map(s => {
      const entries = s.subjects.map(sub => ({
        className: cls.className,
        section: s.name,
        subject: sub,
      }));
      return { name: s.name, subjects: s.subjects, ...computeStats(entries) };
    });
  }, [view, examType]);

  // Downloads
  const downloadSubject = (className: string, section: string, subject: string) => {
    const csv = buildCsvForSubject(className, section, subject);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${className}_${section}_${subject}_${examType}.csv`);
    markDownloaded([dlKey(className, section, subject)]);
  };

  const downloadSection = async (className: string, sectionName: string, subjects: string[]) => {
    const zip = new JSZip();
    const root = zip.folder(`${className}_${sectionName}_${examType}`);
    const keys: string[] = [];
    let count = 0;
    subjects.forEach(subject => {
      if (
        reportStatusStore.has(className, sectionName, subject, examType) &&
        !isFailed(className, sectionName, subject)
      ) {
        root?.file(`${subject}.csv`, buildCsvForSubject(className, sectionName, subject));
        keys.push(dlKey(className, sectionName, subject));
        count++;
      }
    });
    if (!count) {
      toast.error('No ready reports in this section');
      return;
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${className}_${sectionName}_Reports_${examType}.zip`);
    markDownloaded(keys);
    toast.success(`Downloaded ${className} ${sectionName} (${count} subjects)`);
  };

  const downloadClass = async (className: string) => {
    const cls = REPORT_CATALOG.find(c => c.className === className);
    if (!cls) return;
    const zip = new JSZip();
    const root = zip.folder(`${className}_${examType}`);
    const keys: string[] = [];
    let count = 0;
    cls.sections.forEach(section => {
      const sectionFolder = root?.folder(section.name);
      section.subjects.forEach(subject => {
        if (
          reportStatusStore.has(className, section.name, subject, examType) &&
          !isFailed(className, section.name, subject)
        ) {
          sectionFolder?.file(
            `${subject}.csv`,
            buildCsvForSubject(className, section.name, subject),
          );
          keys.push(dlKey(className, section.name, subject));
          count++;
        }
      });
    });
    if (!count) {
      toast.error('No ready reports in this class');
      return;
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${className}_Reports_${examType}.zip`);
    markDownloaded(keys);
    toast.success(`Downloaded ${className} (${count} subjects)`);
  };

  // Header / breadcrumbs
  const renderBreadcrumbs = () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {view.level === 'classes' ? (
            <BreadcrumbPage>All Classes</BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              onClick={() => {
                setView({ level: 'classes' });
                setStatusFilter('all');
              }}
              className="cursor-pointer"
            >
              All Classes
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {view.level !== 'classes' && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {view.level === 'sections' ? (
                <BreadcrumbPage>{view.className}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  onClick={() => setView({ level: 'sections', className: view.className })}
                  className="cursor-pointer"
                >
                  {view.className}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}
        {view.level === 'subjects' && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{view.section}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          {view.level !== 'classes' && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setStatusFilter('all');
                if (view.level === 'subjects')
                  setView({ level: 'sections', className: view.className });
                else setView({ level: 'classes' });
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Student Reports</h2>
            <div className="text-sm text-muted-foreground">{renderBreadcrumbs()}</div>
          </div>
        </div>
        {view.level === 'sections' && (
          <Button onClick={() => downloadClass(view.className)} className="gap-2">
            <Download className="w-4 h-4" />
            Download all {view.className}
          </Button>
        )}
        {view.level === 'subjects' && (
          <Button
            onClick={() => {
              const cls = REPORT_CATALOG.find(c => c.className === view.className);
              const sec = cls?.sections.find(s => s.name === view.section);
              if (sec) downloadSection(view.className, view.section, sec.subjects);
            }}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download all {view.section}
          </Button>
        )}
      </div>

      {/* Dashboard - scoped to current level */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card
          className={cn(
            'card-shadow border-l-4 border-l-warning transition-all',
            totals.generating > 0 && 'cursor-pointer hover:shadow-md',
            statusFilter === 'generating' && 'ring-2 ring-warning/40',
          )}
          onClick={() => totals.generating > 0 && toggleFilter('generating')}
        >
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Generating <Clock className="w-3 h-3 text-warning" />
            </p>
            <p className="text-2xl font-bold text-warning">{totals.generating}</p>
            {totals.generating > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {statusFilter === 'generating' ? 'Filtering generating · click to clear' : 'Click to filter'}
              </p>
            )}
          </CardContent>
        </Card>
        <Card
          className={cn(
            'card-shadow border-l-4 border-l-success transition-all',
            totals.ready > 0 && 'cursor-pointer hover:shadow-md',
            statusFilter === 'ready' && 'ring-2 ring-success/40',
          )}
          onClick={() => totals.ready > 0 && toggleFilter('ready')}
        >
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Ready <CheckCircle2 className="w-3 h-3 text-success" />
            </p>
            <p className="text-2xl font-bold text-success">{totals.ready}</p>
            {totals.ready > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {statusFilter === 'ready' ? 'Filtering ready · click to clear' : 'Click to filter'}
              </p>
            )}
          </CardContent>
        </Card>
        <Card
          className={cn(
            'card-shadow border-l-4 border-l-destructive transition-all',
            totals.failed > 0 && 'cursor-pointer hover:shadow-md',
            statusFilter === 'failed' && 'ring-2 ring-destructive/40',
          )}
          onClick={() => totals.failed > 0 && toggleFilter('failed')}
        >
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Failed <AlertCircle className="w-3 h-3 text-destructive" />
            </p>
            <p className="text-2xl font-bold text-destructive">{totals.failed}</p>
            {totals.failed > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {statusFilter === 'failed' ? 'Filtering failed · click to clear' : 'Click to filter'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Level-specific content */}
      {view.level === 'classes' && (
        <Card className="card-shadow-elevated border-primary/10">
          <CardContent className="p-5 md:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">All Classes</h3>
                <p className="text-xs text-muted-foreground">
                  Click a class to view its sections
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {classStats
                .filter(c =>
                  statusFilter === 'all'
                    ? true
                    : statusFilter === 'failed'
                      ? c.failed > 0
                      : statusFilter === 'generating'
                        ? c.generating > 0
                        : c.ready > 0,
                )
                .map(c => {
                  const total = c.generating + c.ready + c.failed;
                  const pct = c.total ? Math.round((total / c.total) * 100) : 0;
                  return (
                    <button
                      key={c.className}
                      onClick={() => setView({ level: 'sections', className: c.className })}
                      className="w-full text-left rounded-2xl border bg-card hover:border-primary/40 card-shadow hover:shadow-md transition-all group p-4 md:p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-foreground truncate">{c.className}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.total} reports · {pct}% accounted
                              </p>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                                <Clock className="w-3 h-3 mr-0.5" />
                                {c.generating} generating
                              </Badge>
                              <Badge variant="outline" className="text-[10px] border-success/40 text-success">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                {c.ready} ready
                              </Badge>
                              {c.failed > 0 && (
                                <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">
                                  <AlertCircle className="w-3 h-3 mr-0.5" />
                                  {c.failed} failed
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex md:hidden flex-wrap gap-1.5 mb-2">
                            <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                              <Clock className="w-3 h-3 mr-0.5" />{c.generating}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] border-success/40 text-success">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" />{c.ready}
                            </Badge>
                            {c.failed > 0 && (
                              <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">
                                <AlertCircle className="w-3 h-3 mr-0.5" />{c.failed}
                              </Badge>
                            )}
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </button>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {view.level === 'sections' && (
        <Card className="card-shadow-elevated border-primary/10">
          <CardContent className="p-5 md:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {view.className} — Sections
                </h3>
                <p className="text-xs text-muted-foreground">
                  Click a section to view subject reports
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {sectionStats
                .filter(s =>
                  statusFilter === 'all'
                    ? true
                    : statusFilter === 'failed'
                      ? s.failed > 0
                      : statusFilter === 'generating'
                        ? s.generating > 0
                        : s.ready > 0,
                )
                .map(s => {
                  const total = s.generating + s.ready + s.failed;
                  const pct = s.total ? Math.round((total / s.total) * 100) : 0;
                  return (
                    <button
                      key={s.name}
                      onClick={() =>
                        setView({ level: 'subjects', className: view.className, section: s.name })
                      }
                      className="w-full text-left rounded-2xl border bg-card hover:border-primary/40 card-shadow hover:shadow-md transition-all group p-4 md:p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-foreground truncate">{s.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {s.subjects.length} subjects · {pct}% accounted
                              </p>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                                <Clock className="w-3 h-3 mr-0.5" />
                                {s.generating} generating
                              </Badge>
                              <Badge variant="outline" className="text-[10px] border-success/40 text-success">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                {s.ready} ready
                              </Badge>
                              {s.failed > 0 && (
                                <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">
                                  <AlertCircle className="w-3 h-3 mr-0.5" />
                                  {s.failed} failed
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex md:hidden flex-wrap gap-1.5 mb-2">
                            <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">
                              <Clock className="w-3 h-3 mr-0.5" />{s.generating}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] border-success/40 text-success">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" />{s.ready}
                            </Badge>
                            {s.failed > 0 && (
                              <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">
                                <AlertCircle className="w-3 h-3 mr-0.5" />{s.failed}
                              </Badge>
                            )}
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </button>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {view.level === 'subjects' && (() => {
        const cls = REPORT_CATALOG.find(c => c.className === view.className);
        const sec = cls?.sections.find(s => s.name === view.section);
        if (!sec) return null;
        const visibleSubjects = sec.subjects.filter(sub =>
          subjectMatchesFilter(view.className, view.section, sub),
        );
        const filterLabel =
          statusFilter === 'failed'
            ? 'Showing only failed reports'
            : statusFilter === 'generating'
              ? 'Showing only generating reports'
              : statusFilter === 'ready'
                ? 'Showing only ready reports'
                : 'Download subject-wise CSV reports';
        return (
          <Card className="card-shadow-elevated border-primary/10">
            <CardContent className="p-5 md:p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {view.className} · {view.section}
                  </h3>
                  <p className="text-xs text-muted-foreground">{filterLabel}</p>
                </div>
              </div>
              {visibleSubjects.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground bg-muted/20 rounded-lg p-6">
                  No subjects to display.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleSubjects.map(subject => {
                    const ready = reportStatusStore.has(view.className, view.section, subject, examType);
                    const failed = isFailed(view.className, view.section, subject);
                    const wasDownloaded = downloaded.has(dlKey(view.className, view.section, subject));
                    return (
                      <div
                        key={subject}
                        className={cn(
                          'p-3 rounded-xl border transition-all',
                          failed
                            ? 'bg-destructive/5 border-destructive/30'
                            : wasDownloaded
                              ? 'bg-success/10 border-success/30'
                              : ready
                                ? 'bg-card border-border'
                                : 'bg-muted/40 border-border',
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {failed ? (
                              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                            ) : wasDownloaded ? (
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                            ) : ready ? (
                              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <span className={cn(
                              'text-sm font-medium truncate',
                              failed ? 'text-destructive' : wasDownloaded ? 'text-success' : 'text-foreground',
                            )}>
                              {subject}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] shrink-0',
                              failed
                                ? 'border-destructive/40 text-destructive'
                                : wasDownloaded
                                  ? 'border-success/40 text-success'
                                  : ready
                                    ? 'border-border text-foreground'
                                    : 'border-border text-muted-foreground',
                            )}
                          >
                            {failed ? 'Failed' : wasDownloaded ? 'Downloaded' : ready ? 'Ready' : 'Pending'}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant={failed ? 'outline' : wasDownloaded ? 'ghost' : 'outline'}
                          disabled={!ready || failed}
                          onClick={() => downloadSubject(view.className, view.section, subject)}
                          className={cn(
                            'w-full h-8 gap-1.5 text-xs',
                            failed && 'border-destructive/40 text-destructive hover:bg-destructive/10',
                          )}
                        >
                          {failed ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              Retry generation
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              {wasDownloaded ? 'Download again' : ready ? 'Download CSV' : 'Awaiting teacher'}
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
};

export default PrintReports;
