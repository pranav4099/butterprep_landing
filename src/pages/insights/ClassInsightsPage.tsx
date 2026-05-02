import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Users, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { buildClassSections, getClassSubjectData } from '@/data/teacherInsightsData';
import ExamTypeDropdown from '@/components/ExamTypeDropdown';

/** Returns a human-readable label + icon config for a score */
const getPerformanceLabel = (score: number) => {
  if (score >= 70) return { label: 'Good', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 };
  if (score >= 55) return { label: 'Average', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle };
  return { label: 'Needs Attention', color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle };
};

const PerformanceBadge = ({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) => {
  const perf = getPerformanceLabel(score);
  const Icon = perf.icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold",
      perf.bg, perf.color,
      size === 'md' ? 'text-[11px] px-2.5 py-1' : 'text-[9px] px-2 py-0.5'
    )}>
      <Icon className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {perf.label}
    </span>
  );
};

const ClassInsightsPage = () => {
  const { classNum } = useParams<{ classNum: string }>();
  const navigate = useNavigate();
  const { selectedExamType, setSelectedExamType } = useAuth();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const classNumber = Number(classNum);
  const examSections = useMemo(() => buildClassSections(selectedExamType || 'FA1'), [selectedExamType]);
  const classSections = useMemo(() => examSections.filter(cs => cs.classNum === classNumber), [examSections, classNumber]);

  const classAvg = useMemo(() => {
    if (classSections.length === 0) return 0;
    return Math.round(classSections.map(s => s.avgScore).reduce((a, b) => a + b, 0) / classSections.length);
  }, [classSections]);

  const bestSection = useMemo(() => classSections.length > 0 ? classSections.reduce((a, b) => a.avgScore > b.avgScore ? a : b) : null, [classSections]);

  const selectedSection = useMemo(() => classSections.find(cs => cs.id === selectedSectionId) || null, [classSections, selectedSectionId]);

  const sectionSubjects = useMemo(() => {
    if (!selectedSection) return [];
    return [...selectedSection.subjects].sort((a, b) => b.avgScore - a.avgScore);
  }, [selectedSection]);

  const handleBack = () => {
    if (selectedSubjectId) {
      setSelectedSubjectId(null);
    } else if (selectedSectionId) {
      setSelectedSectionId(null);
    } else {
      navigate('/insights');
    }
  };

  const backLabel = selectedSubjectId
    ? `Back to Section ${selectedSection?.section}`
    : selectedSectionId
      ? `Back to Class ${classNumber}`
      : 'Back to Insights';

  if (classSections.length === 0) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/insights')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Insights</span>
        </button>
        <p className="text-sm text-muted-foreground">No data found for Class {classNum}.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">{backLabel}</span>
      </button>

      

      {selectedSubjectId && selectedSection ? (() => {
        const sub = selectedSection.subjects.find(s => s.id === selectedSubjectId);
        if (!sub) return null;
        const subjectData = getClassSubjectData(selectedSection, sub, selectedExamType || 'FA1');

        return (
          <div className="space-y-4">
            <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent" />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Class {classNumber} · Section {selectedSection.section}</p>
                    <h2 className="text-lg font-bold text-foreground tracking-tight mt-0.5">{sub.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">Chapter-wise performance breakdown</p>
                  </div>
                  <div className="text-right space-y-1.5">
                    <p className={cn(
                      "text-4xl font-extrabold leading-none tracking-tight",
                      sub.avgScore >= 70 ? "text-success" : sub.avgScore >= 55 ? "text-primary" : "text-warning"
                    )}>
                      {sub.avgScore}<span className="text-lg font-normal text-muted-foreground">%</span>
                    </p>
                    <PerformanceBadge score={sub.avgScore} size="md" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 px-1">
              <span className="text-[10px] text-muted-foreground font-medium">Performance scale:</span>
              {[
                { label: '70%+ Good', cls: 'bg-success/10 text-success' },
                { label: '55-69% Average', cls: 'bg-warning/10 text-warning' },
                { label: '<55% Needs Attention', cls: 'bg-destructive/10 text-destructive' },
              ].map(l => (
                <span key={l.label} className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full", l.cls)}>{l.label}</span>
              ))}
            </div>

            <div className="space-y-2.5">
              {[...subjectData.chapters].sort((a, b) => a.avgScore - b.avgScore).map((ch) => {
                const chColor = ch.avgScore >= 75 ? 'success' : ch.avgScore >= 55 ? 'warning' : 'destructive';
                const chBarColor = chColor === 'success' ? 'bg-success' : chColor === 'warning' ? 'bg-warning' : 'bg-destructive';
                return (
                  <Card key={ch.id} className="border-0 card-shadow rounded-xl">
                    <CardContent className="p-3.5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold", `bg-${chColor}/10 text-${chColor}`)}>
                          {ch.avgScore}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{ch.name}</p>
                          <PerformanceBadge score={ch.avgScore} />
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", chBarColor)} style={{ width: `${ch.avgScore}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })() : selectedSectionId && selectedSection ? (
        <div className="space-y-4">
          <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Class {classNumber}</p>
                  <h2 className="text-lg font-bold text-foreground tracking-tight mt-0.5">Section {selectedSection.section}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{selectedSection.totalStudents} students · Tap a subject for chapters</p>
                </div>
                <div className="text-right space-y-1.5">
                  <p className={cn(
                    "text-4xl font-extrabold leading-none tracking-tight",
                    selectedSection.avgScore >= 70 ? "text-success" : selectedSection.avgScore >= 55 ? "text-primary" : "text-warning"
                  )}>
                    {selectedSection.avgScore}<span className="text-lg font-normal text-muted-foreground">%</span>
                  </p>
                  <PerformanceBadge score={selectedSection.avgScore} size="md" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {sectionSubjects.map(sub => {
              const color = sub.avgScore >= 70 ? 'success' : sub.avgScore >= 55 ? 'warning' : 'destructive';
              const barColor = color === 'success' ? 'bg-success' : color === 'warning' ? 'bg-warning' : 'bg-destructive';
              return (
                <Card
                  key={sub.id}
                  className="border-0 card-shadow rounded-xl cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
                  onClick={() => setSelectedSubjectId(sub.id)}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold", `bg-${color}/10 text-${color}`)}>
                          {sub.avgScore}%
                        </div>
                        <div>
                          <span className="font-medium text-sm text-foreground">{sub.name}</span>
                          <div className="mt-0.5">
                            <PerformanceBadge score={sub.avgScore} />
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${sub.avgScore}%` }} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="border-0 card-shadow-elevated rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-success/4" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">School Insights</p>
                  <h2 className="text-lg font-bold text-foreground tracking-tight mt-0.5">Class {classNumber}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{classSections.length} section(s) · Select a section to explore</p>
                </div>
                <div className="text-right space-y-1.5">
                  <p className={cn(
                    "text-4xl font-extrabold leading-none tracking-tight",
                    classAvg >= 70 ? "text-success" : classAvg >= 55 ? "text-primary" : "text-warning"
                  )}>
                    {classAvg}<span className="text-lg font-normal text-muted-foreground">%</span>
                  </p>
                  <PerformanceBadge score={classAvg} size="md" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section navigation boxes */}
          <div className="grid grid-cols-2 gap-3">
            {classSections.map(cs => {
              const isBest = bestSection?.id === cs.id;
              const color = cs.avgScore >= 70 ? 'success' : cs.avgScore >= 55 ? 'warning' : 'destructive';
              return (
                <Card
                  key={cs.id}
                  className={cn(
                    "border-0 card-shadow rounded-xl cursor-pointer hover:shadow-lg transition-all relative overflow-hidden",
                    isBest && "ring-2 ring-success/30"
                  )}
                  onClick={() => setSelectedSectionId(cs.id)}
                >
                  {isBest && (
                    <div className="absolute top-0 right-0 bg-success text-success-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                      TOP
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-foreground">Section {cs.section}</h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className={cn(
                      "text-3xl font-extrabold leading-none tracking-tight",
                      color === 'success' ? 'text-success' : color === 'warning' ? 'text-warning' : 'text-destructive'
                    )}>
                      {cs.avgScore}<span className="text-sm font-normal text-muted-foreground">%</span>
                    </p>
                    <div className="mt-2">
                      <PerformanceBadge score={cs.avgScore} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{cs.totalStudents} students</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2.5">
                      <div className={cn(
                        "h-full rounded-full transition-all",
                        color === 'success' ? 'bg-success' : color === 'warning' ? 'bg-warning' : 'bg-destructive'
                      )} style={{ width: `${cs.avgScore}%` }} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassInsightsPage;
