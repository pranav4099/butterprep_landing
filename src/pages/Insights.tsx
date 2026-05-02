import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3, Download, Users, Building, Layers, User,
  TrendingUp, TrendingDown, CheckCircle,
  ChevronDown, ChevronRight,
  Search, Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { buildClassSections, getClassSubjectData, allStudents } from '@/data/teacherInsightsData';
import type { ClassSection, SubjectSummary } from '@/data/teacherInsightsData';
import TeacherClassDashboard from '@/pages/teacher/insights/TeacherClassDashboard';
import TeacherStudentView from '@/pages/teacher/insights/TeacherStudentView';
import SchoolWideDashboard from '@/pages/insights/SchoolWideDashboard';
import TrendsDashboard from '@/pages/insights/TrendsDashboard';

const tabs = [
  { id: 'school', label: 'School-wide', icon: Building, desc: 'For Management' },
  { id: 'class', label: 'Class-wise', icon: Layers, desc: 'For Teachers' },
  { id: 'student', label: 'Student-wise', icon: User, desc: 'For Mentors' },
  { id: 'trends', label: 'Trends', icon: TrendingUp, desc: 'Over Time' },
];

const CHART_COLORS = {
  strong: 'hsl(var(--success))',
  average: 'hsl(var(--warning))',
  needsSupport: 'hsl(var(--destructive))',
  primary: 'hsl(var(--primary))',
  muted: 'hsl(var(--muted))',
};

const PIE_COLORS = [CHART_COLORS.strong, CHART_COLORS.average, CHART_COLORS.needsSupport];

// Filter options for classwise/studentwise

// Filter options for classwise/studentwise
const classOptions = Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` }));
const sectionOptions = ['A', 'B', 'C', 'D'];
const subjectOptions = [
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'social', label: 'Social Science' },
];

const exams = [
  { id: 'FA1', name: 'FA1 (Formative Assessment 1)' },
  { id: 'FA2', name: 'FA2 (Formative Assessment 2)' },
  { id: 'SA1', name: 'SA1 (Summative Assessment 1)' },
  { id: 'FA3', name: 'FA3 (Formative Assessment 3)' },
  { id: 'FA4', name: 'FA4 (Formative Assessment 4)' },
  { id: 'SA2', name: 'SA2 (Summative Assessment 2)' },
];

// Empty state component
const EmptyState = ({ icon: Icon, message, hint }: { icon: React.ElementType; message: string; hint: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground mb-1">{message}</p>
    <p className="text-xs text-muted-foreground max-w-[240px]">{hint}</p>
  </div>
);

// ════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════
const Insights = () => {
  const [activeTab, setActiveTab] = useState('school');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Exam type — use AuthContext so drill-down pages stay in sync
  const { selectedExamType, setSelectedExamType } = useAuth();
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const selectedExam = exams.find(e => e.id === selectedExamType) || exams[0];

  // Classwise filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Studentwise filters
  const [stuClassFilter, setStuClassFilter] = useState('');
  const [stuSectionFilter, setStuSectionFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'strong' | 'average' | 'needs-support'>('all');

  // Classwise view state
  type ClassView =
    | { screen: 'filters' }
    | { screen: 'analysis'; classSection: ClassSection; subject: SubjectSummary };
  const [classView, setClassView] = useState<ClassView>({ screen: 'filters' });

  // Studentwise view state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const examClassSections = useMemo(() => buildClassSections(selectedExamType), [selectedExamType]);

  const filteredSections = useMemo(() => {
    return examClassSections.filter(cs => {
      if (classFilter && String(cs.classNum) !== classFilter) return false;
      if (sectionFilter && cs.section !== sectionFilter) return false;
      return true;
    });
  }, [classFilter, sectionFilter, examClassSections]);

  const filteredStudents = useMemo(() => {
    let students = allStudents;
    if (statusFilter !== 'all') {
      students = students.filter(s => s.status === statusFilter);
    }
    if (studentSearch) {
      students = students.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNo.includes(studentSearch)
      );
    }
    return students;
  }, [stuClassFilter, stuSectionFilter, studentSearch, statusFilter]);

  const studentStats = useMemo(() => {
    const strong = allStudents.filter(s => s.status === 'strong').length;
    const average = allStudents.filter(s => s.status === 'average').length;
    const needsSupport = allStudents.filter(s => s.status === 'needs-support').length;
    const avgScore = allStudents.length > 0
      ? Math.round(allStudents.reduce((sum, s) => sum + s.score, 0) / allStudents.length)
      : 0;
    return { strong, average, needsSupport, avgScore, total: allStudents.length };
  }, [stuClassFilter, stuSectionFilter]);

  const toggle = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const renderSchoolInsights = () => (
    <SchoolWideDashboard selectedExamType={selectedExamType} onExamTypeChange={setSelectedExamType} />
  );

  // ═══ B) CLASS-WISE (same as teacher portal) ═══
  const renderClassInsights = () => {
    // If viewing a specific class+section+subject analysis
    if (classView.screen === 'analysis') {
      const data = getClassSubjectData(classView.classSection, classView.subject, selectedExamType);
      return (
        <TeacherClassDashboard
          data={data}
          onBack={() => setClassView({ screen: 'filters' })}
        />
      );
    }

    // Embedded analysis when all filters are set
    if (classFilter && sectionFilter && subjectFilter) {
      const cs = filteredSections.find(s => s.section === sectionFilter);
      const sub = cs?.subjects.find(s => s.id === subjectFilter);
      if (!cs || !sub) return <EmptyState icon={BarChart3} message="No data found for this selection" hint="Try a different filter combination" />;
      const data = getClassSubjectData(cs, sub, selectedExamType);
      return (
        <div className="space-y-4">
          {/* Exam Type Dropdown */}
          <div className="relative">
            <button onClick={() => setExamDropdownOpen(!examDropdownOpen)} className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full">
              <span className="text-sm font-medium text-foreground flex-1 text-left truncate">{selectedExam.name}</span>
              <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform shrink-0", examDropdownOpen && "rotate-180")} />
            </button>
            {examDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {exams.map((exam) => (
                  <button key={exam.id} onClick={() => { setSelectedExamType(exam.id); setExamDropdownOpen(false); }} className={cn("w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors", selectedExamType === exam.id && "bg-primary/10 text-primary")}>{exam.name}</button>
                ))}
              </div>
            )}
          </div>
          {/* Filter Bar */}
          <Card className="border-0 card-shadow rounded-2xl">
            <CardContent className="p-3 space-y-2">
              <div className="flex gap-2">
                <Select value={classFilter} onValueChange={v => { setClassFilter(v); setSectionFilter(''); setSubjectFilter(''); }}>
                  <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={sectionFilter} onValueChange={v => { setSectionFilter(v); setSubjectFilter(''); }} disabled={!classFilter}>
                  <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={subjectFilter} onValueChange={setSubjectFilter} disabled={!sectionFilter}>
                  <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              {(classFilter || sectionFilter || subjectFilter) && (
                <button onClick={() => { setClassFilter(''); setSectionFilter(''); setSubjectFilter(''); }} className="text-[11px] text-primary font-medium hover:underline ml-1">
                  Clear all filters
                </button>
              )}
            </CardContent>
          </Card>

          <TeacherClassDashboard data={data} onBack={() => setSubjectFilter('')} embedded />
        </div>
      );
    }

    // Filter-first empty state
    return (
      <div className="space-y-4">
        {/* Exam Type Dropdown */}
        <div className="relative">
          <button onClick={() => setExamDropdownOpen(!examDropdownOpen)} className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full">
            <span className="text-sm font-medium text-foreground flex-1 text-left truncate">{selectedExam.name}</span>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform shrink-0", examDropdownOpen && "rotate-180")} />
          </button>
          {examDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              {exams.map((exam) => (
                <button key={exam.id} onClick={() => { setSelectedExamType(exam.id); setExamDropdownOpen(false); }} className={cn("w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors", selectedExamType === exam.id && "bg-primary/10 text-primary")}>{exam.name}</button>
              ))}
            </div>
          )}
        </div>
        {/* Filter Bar */}
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-3 space-y-2">
            <div className="flex gap-2">
              <Select value={classFilter} onValueChange={v => { setClassFilter(v); setSectionFilter(''); setSubjectFilter(''); }}>
                <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={sectionFilter} onValueChange={v => { setSectionFilter(v); setSubjectFilter(''); }} disabled={!classFilter}>
                <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter} disabled={!sectionFilter}>
                <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {(classFilter || sectionFilter || subjectFilter) && (
              <button onClick={() => { setClassFilter(''); setSectionFilter(''); setSubjectFilter(''); }} className="text-[11px] text-primary font-medium hover:underline ml-1">
                Clear all filters
              </button>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 shadow-sm">
            <Filter className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1.5">Select filters to view insights</p>
          <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
            {!classFilter
              ? 'Start by selecting a class to explore learning patterns and performance data.'
              : !sectionFilter
              ? 'Now select a section to narrow down your analysis.'
              : 'Finally, pick a subject to see detailed chapter and student analytics.'}
          </p>
          <div className="flex items-center gap-2 mt-6">
            {['Class', 'Section', 'Subject'].map((step, i) => {
              const done = i === 0 ? !!classFilter : i === 1 ? !!sectionFilter : !!subjectFilter;
              const active = i === 0 ? !classFilter : i === 1 ? classFilter && !sectionFilter : sectionFilter && !subjectFilter;
              return (
                <React.Fragment key={step}>
                  {i > 0 && <div className={cn("w-6 h-0.5 rounded", done ? "bg-primary" : "bg-border")} />}
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all",
                    done ? "bg-primary/10 text-primary" : active ? "bg-primary/5 text-primary ring-1 ring-primary/20" : "bg-muted text-muted-foreground"
                  )}>
                    {done ? '✓' : i + 1}
                    <span>{step}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ═══ C) STUDENT-WISE (same as teacher portal) ═══
  const renderStudentInsights = () => {
    // Student detail view
    if (selectedStudentId) {
      const student = allStudents.find(s => s.id === selectedStudentId);
      if (!student) return null;
      return (
        <TeacherStudentView
          student={student}
          onBack={() => setSelectedStudentId(null)}
        />
      );
    }

    return (
      <div className="space-y-4">
        {/* Exam Type Dropdown */}
        <div className="relative">
          <button onClick={() => setExamDropdownOpen(!examDropdownOpen)} className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full">
            <span className="text-sm font-medium text-foreground flex-1 text-left truncate">{selectedExam.name}</span>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform shrink-0", examDropdownOpen && "rotate-180")} />
          </button>
          {examDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              {exams.map((exam) => (
                <button key={exam.id} onClick={() => { setSelectedExamType(exam.id); setExamDropdownOpen(false); }} className={cn("w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors", selectedExamType === exam.id && "bg-primary/10 text-primary")}>{exam.name}</button>
              ))}
            </div>
          )}
        </div>
        {/* Filter Bar */}
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <Select value={stuClassFilter} onValueChange={v => { setStuClassFilter(v); setStuSectionFilter(''); setStudentSearch(''); setStatusFilter('all'); }}>
                <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map(o => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={stuSectionFilter} onValueChange={setStuSectionFilter} disabled={!stuClassFilter}>
                <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {(stuClassFilter || stuSectionFilter) && (
              <button onClick={() => { setStuClassFilter(''); setStuSectionFilter(''); setStudentSearch(''); }} className="text-[11px] text-primary font-medium hover:underline mt-2 ml-1">
                Clear all filters
              </button>
            )}
          </CardContent>
        </Card>

        {stuClassFilter && stuSectionFilter ? (
          <div className="space-y-4">
            {/* Summary Stats */}
            <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-success/4" />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Class {stuClassFilter}{stuSectionFilter}</p>
                    <p className="text-lg font-bold text-foreground tracking-tight">{studentStats.total} Students</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-3xl font-extrabold tracking-tight leading-none",
                      studentStats.avgScore >= 75 ? "text-success" : studentStats.avgScore >= 55 ? "text-primary" : "text-warning"
                    )}>
                      {studentStats.avgScore}<span className="text-sm font-normal text-muted-foreground">%</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Avg Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Strong', count: studentStats.strong, color: 'success', emoji: '🟢', key: 'strong' as const },
                    { label: 'Average', count: studentStats.average, color: 'warning', emoji: '🟡', key: 'average' as const },
                    { label: 'Support', count: studentStats.needsSupport, color: 'destructive', emoji: '🔴', key: 'needs-support' as const },
                  ].map(({ label, count, color, emoji, key }) => {
                    const isActive = statusFilter === key;
                    return (
                      <button
                        key={label}
                        onClick={() => setStatusFilter(isActive ? 'all' : key)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl transition-all tap-target text-left",
                          isActive
                            ? `bg-${color}/15 border-2 border-${color}/40 ring-1 ring-${color}/20`
                            : `bg-${color}/5 border border-${color}/10 hover:bg-${color}/8`
                        )}
                      >
                        <span className="text-base">{emoji}</span>
                        <div>
                          <p className={cn("text-lg font-bold leading-none", `text-${color}`)}>{count}</p>
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {statusFilter !== 'all' && (
                  <button onClick={() => setStatusFilter('all')} className="text-[11px] text-primary font-medium hover:underline mt-2">
                    Show all students
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search by name or roll number..."
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Student List */}
            <div className="space-y-2">
              {filteredStudents.map((student) => {
                const statusColor = student.status === 'strong' ? 'success' : student.status === 'average' ? 'warning' : 'destructive';
                const statusEmoji = student.status === 'strong' ? '🟢' : student.status === 'average' ? '🟡' : '🔴';
                const trendIcon = student.trendDirection === 'up' ? <TrendingUp className="w-3 h-3 text-success" /> :
                  student.trendDirection === 'down' ? <TrendingDown className="w-3 h-3 text-destructive" /> : null;

                return (
                  <Card
                    key={student.id}
                    className="border-0 card-shadow rounded-xl cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <CardContent className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold", `bg-${statusColor}/10 text-${statusColor}`)}>
                          {student.score}%
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{student.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] text-muted-foreground">Roll #{student.rollNo}</p>
                            <span className="text-[10px]">{statusEmoji}</span>
                            {trendIcon}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              })}
              {filteredStudents.length === 0 && (
                <EmptyState icon={Users} message="No students found" hint="Try adjusting your search or filters" />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 shadow-sm">
              <Filter className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1.5">Select filters to view students</p>
            <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
              {!stuClassFilter
                ? 'Start by selecting a class to see student performance.'
                : 'Now select a section to view the student list.'}
            </p>
            <div className="flex items-center gap-2 mt-6">
              {['Class', 'Section'].map((step, i) => {
                const done = i === 0 ? !!stuClassFilter : !!stuSectionFilter;
                const active = i === 0 ? !stuClassFilter : stuClassFilter && !stuSectionFilter;
                return (
                  <React.Fragment key={step}>
                    {i > 0 && <div className={cn("w-6 h-0.5 rounded", done ? "bg-primary" : "bg-border")} />}
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all",
                      done ? "bg-primary/10 text-primary" : active ? "bg-primary/5 text-primary ring-1 ring-primary/20" : "bg-muted text-muted-foreground"
                    )}>
                      {done ? '✓' : i + 1}
                      <span>{step}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Insights & Analytics</h2>
            <p className="text-sm text-muted-foreground">Data-driven, actionable insights from exam results</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 text-sm">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setExpandedSections({});
              setClassFilter(''); setSectionFilter(''); setSubjectFilter('');
              setStuClassFilter(''); setStuSectionFilter(''); setStudentSearch(''); setStatusFilter('all');
              setSelectedStudentId(null);
              setClassView({ screen: 'filters' });
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <div className="flex flex-col items-start">
              <span>{tab.label}</span>
              <span className={cn("text-[10px]", activeTab === tab.id ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{tab.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* AI Assistive Note */}
      <p className="text-[11px] text-muted-foreground mb-4 flex items-center gap-1.5">
        <CheckCircle className="w-3 h-3 text-success" />
        These insights are generated from exam data marked by teachers. Teachers remain in full control — AI is assistive only.
      </p>

      {activeTab === 'school' && renderSchoolInsights()}
      {activeTab === 'class' && renderClassInsights()}
      {activeTab === 'student' && renderStudentInsights()}
      {activeTab === 'trends' && <TrendsDashboard />}
    </div>
  );
};

export default Insights;
