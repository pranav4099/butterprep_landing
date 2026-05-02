import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Award, AlertTriangle, ChevronRight, BarChart3, Scale, ClipboardCheck, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTeacherMetrics } from '@/hooks/useTeacherMetrics';

interface Props {
  selectedExamType: string;
}

const TeacherPerformanceOverview = ({ selectedExamType }: Props) => {
  const navigate = useNavigate();
  const { teacherMetrics, gradingFairness } = useTeacherMetrics(selectedExamType);

  const totalTeachers = teacherMetrics.length;
  const topTeacher = [...teacherMetrics].sort((a, b) => b.avgScore - a.avgScore)[0];
  const avgScore = totalTeachers > 0
    ? Math.round(teacherMetrics.reduce((s, t) => s + t.avgScore, 0) / totalTeachers)
    : 0;
  const needsSupportTeachers = teacherMetrics.filter(t => t.avgScore < 55).length;
  const totalPapers = teacherMetrics.reduce((s, t) => s + t.papersTotal, 0);
  const reviewedPapers = teacherMetrics.reduce((s, t) => s + t.papersReviewed, 0);
  const reviewRate = totalPapers > 0 ? Math.round((reviewedPapers / totalPapers) * 100) : 0;
  const overallPassRate = totalTeachers > 0
    ? Math.round(teacherMetrics.reduce((s, t) => s + t.passRate, 0) / totalTeachers)
    : 0;

  const aspects = [
    {
      key: 'academic',
      title: 'Academic Performance',
      desc: 'Avg scores, top & bottom teachers, subject comparison',
      value: `${avgScore}%`,
      sub: `Top: ${topTeacher?.teacher.name?.split(' ')[0] || '–'}`,
      icon: BarChart3,
      color: 'primary',
      route: '/insights/teachers/academic',
    },
    {
      key: 'fairness',
      title: 'Grading Fairness',
      desc: 'Teacher marks vs AI-suggested marks',
      value: `${gradingFairness.reviewCount}`,
      sub: `${gradingFairness.reviewCount > 0 ? 'need review' : 'all fair'} · avg ${gradingFairness.avgAbsGap} mark gap`,
      icon: Scale,
      color: gradingFairness.reviewCount > 0 ? 'destructive' : 'success',
      route: '/insights/teachers/fairness',
    },
    {
      key: 'workload',
      title: 'Workload & Coverage',
      desc: 'Papers reviewed, syllabus coverage, turnaround',
      value: `${reviewRate}%`,
      sub: `${reviewedPapers}/${totalPapers} papers reviewed`,
      icon: ClipboardCheck,
      color: 'primary',
      route: '/insights/teachers/workload',
    },
    {
      key: 'outcomes',
      title: 'Student Outcomes',
      desc: 'Pass rates, improvement & support needs',
      value: `${overallPassRate}%`,
      sub: `${needsSupportTeachers} teachers below 55%`,
      icon: Target,
      color: needsSupportTeachers > 0 ? 'warning' : 'success',
      route: '/insights/teachers/outcomes',
    },
  ];

  return (
    <Card className="border-0 card-shadow rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Teacher Performance</h3>
              <p className="text-[10px] text-muted-foreground">{totalTeachers} teachers · tap an aspect to dig deeper</p>
            </div>
          </div>
          <div className="hidden md:flex gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-success font-medium">
              <Award className="w-3 h-3" /> Top: {topTeacher?.teacher.name} ({topTeacher?.avgScore}%)
            </span>
            {needsSupportTeachers > 0 && (
              <span className="flex items-center gap-1.5 text-destructive font-medium">
                <AlertTriangle className="w-3 h-3" /> {needsSupportTeachers} below 55%
              </span>
            )}
          </div>
        </div>

        {/* 4 aspect cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aspects.map(a => (
            <button
              key={a.key}
              onClick={() => navigate(a.route)}
              className={cn(
                'group flex items-center gap-3 p-4 rounded-xl border bg-card text-left transition-all hover:shadow-md hover:border-primary/30',
                'border-border/60'
              )}
            >
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', `bg-${a.color}/10`)}>
                <a.icon className={cn('w-5 h-5', `text-${a.color}`)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-bold text-foreground truncate">{a.title}</p>
                  <span className={cn('text-sm font-extrabold ml-auto', `text-${a.color}`)}>{a.value}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.desc}</p>
                <p className={cn('text-[10px] font-semibold mt-1', `text-${a.color}`)}>{a.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherPerformanceOverview;
