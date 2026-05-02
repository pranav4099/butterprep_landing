import React, { useState, useMemo } from 'react';
import {
  Users, BarChart3, Search, Filter, ChevronRight, ChevronDown,
  TrendingUp, TrendingDown, Minus, Sparkles, GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { buildClassSections, getClassSubjectData, allStudents } from '@/data/teacherInsightsData';
import type { ClassSection, SubjectSummary } from '@/data/teacherInsightsData';
import { useAuth } from '@/contexts/AuthContext';
import TeacherClassDashboard from './insights/TeacherClassDashboard';
import TeacherStudentView from './insights/TeacherStudentView';

const exams = [
  { id: 'FA1', name: 'FA1 (Formative Assessment 1)' },
  { id: 'FA2', name: 'FA2 (Formative Assessment 2)' },
  { id: 'SA1', name: 'SA1 (Summative Assessment 1)' },
  { id: 'FA3', name: 'FA3 (Formative Assessment 3)' },
  { id: 'FA4', name: 'FA4 (Formative Assessment 4)' },
  { id: 'SA2', name: 'SA2 (Summative Assessment 2)' },
];

type View =
  | { screen: 'tabs' }
  | { screen: 'analysis'; classSection: ClassSection; subject: SubjectSummary }
  | { screen: 'student-detail'; studentId: string };

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
const TeacherInsights = () => {
  const { selectedExamType, setSelectedExamType } = useAuth();
  const selectedExam = exams.find(e => e.id === selectedExamType) || exams[0];
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [view, setView] = useState<View>({ screen: 'tabs' });
  const [activeTab, setActiveTab] = useState<'class' | 'student'>('class');

  // Classwise filters
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Studentwise filters
  const [stuClassFilter, setStuClassFilter] = useState('');
  const [stuSectionFilter, setStuSectionFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'strong' | 'average' | 'needs-support'>('all');

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

  // Student stats summary (always from full list, not filtered by status)
  const studentStats = useMemo(() => {
    const strong = allStudents.filter(s => s.status === 'strong').length;
    const average = allStudents.filter(s => s.status === 'average').length;
    const needsSupport = allStudents.filter(s => s.status === 'needs-support').length;
    const avgScore = allStudents.length > 0
      ? Math.round(allStudents.reduce((sum, s) => sum + s.score, 0) / allStudents.length)
      : 0;
    return { strong, average, needsSupport, avgScore, total: allStudents.length };
  }, [stuClassFilter, stuSectionFilter]);

  // Analysis drill-in
  if (view.screen === 'analysis') {
    const data = getClassSubjectData(view.classSection, view.subject, selectedExamType);
    return (
      <TeacherClassDashboard
        data={data}
        onBack={() => setView({ screen: 'tabs' })}
      />
    );
  }

  // Student detail
  if (view.screen === 'student-detail') {
    const student = allStudents.find(s => s.id === view.studentId);
    if (!student) return null;
    return (
      <TeacherStudentView
        student={student}
        onBack={() => setView({ screen: 'tabs' })}
      />
    );
  }


  return (
    <div className="space-y-4">
      {/* ───── HEADER ───── */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Learning Patterns</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Actionable insights from exam performance</p>
      </div>

      {/* ───── EXAM TYPE DROPDOWN ───── */}
      <div className="relative">
        <button
          onClick={() => setExamDropdownOpen(!examDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full"
        >
          <span className="text-sm font-medium text-foreground flex-1 text-left truncate">
            {selectedExam.name}
          </span>
          <ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground transition-transform shrink-0",
            examDropdownOpen && "rotate-180"
          )} />
        </button>
        
        {examDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => { setSelectedExamType(exam.id); setExamDropdownOpen(false); }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors",
                  selectedExamType === exam.id && "bg-primary/10 text-primary"
                )}
              >
                {exam.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ───── TABS ───── */}
      <div className="flex bg-muted/50 rounded-2xl p-1 gap-1 border border-border/40">
        {[
          { key: 'class' as const, icon: BarChart3, label: 'Classwise' },
          { key: 'student' as const, icon: Users, label: 'Studentwise' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 tap-target",
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════ CLASSWISE TAB ═══════════ */}
      {activeTab === 'class' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="border-0 card-shadow rounded-2xl">
            <CardContent className="p-3 space-y-2">
              <div className="flex gap-2">
                <Select value={classFilter} onValueChange={v => { setClassFilter(v); setSectionFilter(''); setSubjectFilter(''); }}>
                  <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sectionFilter} onValueChange={v => { setSectionFilter(v); setSubjectFilter(''); }} disabled={!classFilter}>
                  <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={subjectFilter} onValueChange={setSubjectFilter} disabled={!sectionFilter}>
                  <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(classFilter || sectionFilter || subjectFilter) && (
                <button
                  onClick={() => { setClassFilter(''); setSectionFilter(''); setSubjectFilter(''); }}
                  className="text-[11px] text-primary font-medium hover:underline ml-1"
                >
                  Clear all filters
                </button>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          {classFilter && sectionFilter && subjectFilter ? (
            (() => {
              const cs = filteredSections.find(s => s.section === sectionFilter);
              const sub = cs?.subjects.find(s => s.id === subjectFilter);
              if (!cs || !sub) return <EmptyState icon={BarChart3} message="No data found for this selection" hint="Try a different filter combination" />;
              const data = getClassSubjectData(cs, sub, selectedExamType);
              return (
                <TeacherClassDashboard
                  data={data}
                  onBack={() => setSubjectFilter('')}
                  embedded
                />
              );
            })()
          ) : (
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
          )}
        </div>
      )}

      {/* ═══════════ STUDENTWISE TAB ═══════════ */}
      {activeTab === 'student' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="border-0 card-shadow rounded-2xl">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Select value={stuClassFilter} onValueChange={v => { setStuClassFilter(v); setStuSectionFilter(''); setStudentSearch(''); setStatusFilter('all'); }}>
                  <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stuSectionFilter} onValueChange={setStuSectionFilter} disabled={!stuClassFilter}>
                  <SelectTrigger className="flex-1 h-9 text-xs rounded-xl border-border/60 bg-muted/40">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(stuClassFilter || stuSectionFilter) && (
                <button
                  onClick={() => { setStuClassFilter(''); setStuSectionFilter(''); setStudentSearch(''); }}
                  className="text-[11px] text-primary font-medium hover:underline mt-2 ml-1"
                >
                  Clear all filters
                </button>
              )}
            </CardContent>
          </Card>

          {stuClassFilter && stuSectionFilter ? (
            <div className="space-y-4">
              {/* ───── Summary Stats ───── */}
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
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="text-[11px] text-primary font-medium hover:underline mt-2"
                    >
                      Show all students
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* ───── Search ───── */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or roll number..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border/60 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all card-shadow"
                />
              </div>

              {/* ───── Student List ───── */}
              <div className="space-y-2">
                {filteredStudents.map(s => {
                  const color = s.status === 'strong' ? 'success' : s.status === 'average' ? 'warning' : 'destructive';
                  const TrendIcon = s.trendDirection === 'up' ? TrendingUp : s.trendDirection === 'down' ? TrendingDown : Minus;
                  const trendColor = s.trendDirection === 'up' ? 'text-success' : s.trendDirection === 'down' ? 'text-destructive' : 'text-muted-foreground';
                  const statusLabel = s.status === 'needs-support' ? 'Needs Support' : s.status === 'strong' ? 'Strong' : 'Average';

                  return (
                    <Card
                      key={s.id}
                      className="border-0 card-shadow rounded-2xl cursor-pointer tap-target hover:card-shadow-elevated transition-all"
                      onClick={() => setView({ screen: 'student-detail', studentId: s.id })}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-center gap-3">
                          {/* Score Avatar */}
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
                            `bg-${color}/10`
                          )}>
                            <span className={cn("text-sm font-extrabold leading-none", `text-${color}`)}>{s.score}%</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-foreground truncate">{s.name}</p>
                              <div className={cn("flex items-center gap-0.5", trendColor)}>
                                <TrendIcon className="w-3 h-3" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-muted-foreground">Roll #{s.rollNo}</span>
                              <span className="text-muted-foreground/30">·</span>
                              <span className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                                `bg-${color}/8 text-${color}`
                              )}>
                                {statusLabel}
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                        </div>

                        {/* Quick topic preview */}
                        <div className="flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-hide">
                          {s.topicScores.slice(0, 4).map(t => {
                            const tColor = t.score >= 75 ? 'success' : t.score >= 50 ? 'warning' : 'destructive';
                            return (
                              <span
                                key={t.topic}
                                className={cn(
                                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap",
                                  `bg-${tColor}/6 text-${tColor}`
                                )}
                              >
                                {t.topic} · {t.score}%
                              </span>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <EmptyState icon={Users} message="No students found" hint="Try adjusting your search" />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 shadow-sm">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1.5">Select class and section</p>
              <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
                {!stuClassFilter
                  ? 'Choose a class to see your students\' performance overview and learning patterns.'
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
      )}
    </div>
  );
};

// ───── EMPTY STATE ─────
const EmptyState = ({ icon: Icon, message, hint }: { icon: React.ElementType; message: string; hint?: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">{message}</p>
    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
  </div>
);

export default TeacherInsights;
