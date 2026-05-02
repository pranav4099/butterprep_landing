import { useMemo } from 'react';
import { buildClassSections, getClassSubjectData } from '@/data/teacherInsightsData';
import { teachers } from '@/data/teacherData';
import type { TeacherProfile } from '@/data/teacherData';

const EXAM_SEQUENCE = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];

export interface ClassDetail {
  label: string;
  classNum: number;
  sectionLetter: string;
  subjectName: string;
  score: number;
  prevScore: number | null;
  change: number;
}

export interface TeacherMetrics {
  teacher: TeacherProfile;
  avgScore: number;
  prevAvgScore: number | null;
  trend: 'up' | 'down' | 'stable';
  change: number;
  classesHandled: string;
  classCount: number;
  subjectsLabel: string;
  needsSupportCount: number;
  improvingCount: number;
  totalStudents: number;
  weakAreas: string[];
  classDetails: ClassDetail[];
  // Workload & coverage (deterministic mock)
  papersReviewed: number;
  papersTotal: number;
  syllabusCoverage: number; // %
  avgTurnaroundDays: number;
  // Outcomes
  passRate: number; // % students >= 35
  topPerformerCount: number; // % >= 80
}

export interface FairnessRow {
  teacher: TeacherProfile;
  subjectsLabel: string;
  teacherAvg: number;
  aiAvg: number;
  gap: number;
  absGap: number;
  severity: 'fair' | 'minor' | 'review';
  flaggedPct: number;
  direction: 'lenient' | 'strict' | 'aligned';
}

const hash = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export function useTeacherMetrics(selectedExamType: string) {
  const prevExamIdx = EXAM_SEQUENCE.indexOf(selectedExamType) - 1;
  const prevExamType = prevExamIdx >= 0 ? EXAM_SEQUENCE[prevExamIdx] : null;

  const currentSections = useMemo(() => buildClassSections(selectedExamType), [selectedExamType]);
  const prevSections = useMemo(() => prevExamType ? buildClassSections(prevExamType) : null, [prevExamType]);

  const teacherMetrics: TeacherMetrics[] = useMemo(() => {
    return teachers.map(teacher => {
      const scores: number[] = [];
      const prevScoresArr: number[] = [];
      let needsSupport = 0;
      let improving = 0;
      let totalStudents = 0;
      let passing = 0;
      let topPerformers = 0;
      const weakAreaSet = new Set<string>();
      const classDetails: ClassDetail[] = [];

      teacher.assignments.forEach(a => {
        const cs = currentSections.find(s => s.classNum === a.classNum && s.section === a.section);
        if (!cs) return;
        const sub = cs.subjects.find(s => s.id === a.subjectId);
        if (!sub) return;

        scores.push(sub.avgScore);

        const subData = getClassSubjectData(cs, sub, selectedExamType);
        needsSupport += subData.students.filter(s => s.status === 'needs-support').length;
        improving += subData.students.filter(s => s.trendDirection === 'up').length;
        totalStudents += subData.students.length;
        passing += subData.students.filter(s => s.score >= 35).length;
        topPerformers += subData.students.filter(s => s.score >= 80).length;

        subData.chapters.filter(ch => ch.avgScore < 55).forEach(ch => weakAreaSet.add(ch.name));

        let prevScore: number | null = null;
        if (prevSections) {
          const pcs = prevSections.find(s => s.classNum === a.classNum && s.section === a.section);
          const psub = pcs?.subjects.find(s => s.id === a.subjectId);
          if (psub) {
            prevScoresArr.push(psub.avgScore);
            prevScore = psub.avgScore;
          }
        }

        classDetails.push({
          label: `Class ${a.classNum}-${a.section}`,
          classNum: a.classNum,
          sectionLetter: a.section,
          subjectName: a.subjectName,
          score: sub.avgScore,
          prevScore,
          change: prevScore !== null ? sub.avgScore - prevScore : 0,
        });
      });

      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const prevAvgScore = prevScoresArr.length > 0 ? Math.round(prevScoresArr.reduce((a, b) => a + b, 0) / prevScoresArr.length) : null;
      const change = prevAvgScore !== null ? avgScore - prevAvgScore : 0;
      const trend: 'up' | 'down' | 'stable' = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';
      const subjectsLabel = teacher.subjects.map(s => s.name).join(', ');

      // Workload + outcomes (deterministic mock)
      const seed = hash(teacher.id + selectedExamType);
      const papersTotal = totalStudents;
      const papersReviewed = Math.max(0, totalStudents - (seed % 5));
      const syllabusCoverage = Math.min(100, 70 + (seed % 30));
      const avgTurnaroundDays = 1 + (seed % 5);
      const passRate = totalStudents > 0 ? Math.round((passing / totalStudents) * 100) : 0;
      const topPerformerCount = topPerformers;

      return {
        teacher,
        avgScore,
        prevAvgScore,
        trend,
        change,
        classesHandled: `${teacher.assignments.length} classes`,
        classCount: teacher.assignments.length,
        subjectsLabel,
        needsSupportCount: needsSupport,
        improvingCount: improving,
        totalStudents,
        weakAreas: Array.from(weakAreaSet).slice(0, 3),
        classDetails: classDetails.sort((a, b) => a.classNum - b.classNum || a.sectionLetter.localeCompare(b.sectionLetter)),
        papersReviewed,
        papersTotal,
        syllabusCoverage,
        avgTurnaroundDays,
        passRate,
        topPerformerCount,
      };
    });
  }, [currentSections, prevSections, selectedExamType]);

  const gradingFairness = useMemo(() => {
    const rows: FairnessRow[] = teacherMetrics.map(tm => {
      const seed = hash(tm.teacher.id + selectedExamType);
      const teacherAvg = tm.avgScore;
      const rawGap = ((seed % 21) - 8); // -8 .. +12
      const aiAvg = Math.max(0, Math.min(100, teacherAvg - rawGap));
      const gap = teacherAvg - aiAvg;
      const absGap = Math.abs(gap);
      const severity: 'fair' | 'minor' | 'review' = absGap <= 3 ? 'fair' : absGap <= 7 ? 'minor' : 'review';
      const flaggedPct = Math.min(60, Math.round((seed % 35) + absGap * 1.2));
      const direction: 'lenient' | 'strict' | 'aligned' = gap > 0 ? 'lenient' : gap < 0 ? 'strict' : 'aligned';
      return {
        teacher: tm.teacher,
        subjectsLabel: tm.subjectsLabel,
        teacherAvg, aiAvg, gap, absGap, severity, flaggedPct, direction,
      };
    });

    return {
      rows: rows.sort((a, b) => b.absGap - a.absGap),
      reviewCount: rows.filter(r => r.severity === 'review').length,
      minorCount: rows.filter(r => r.severity === 'minor').length,
      fairCount: rows.filter(r => r.severity === 'fair').length,
      avgAbsGap: rows.length > 0 ? Math.round((rows.reduce((s, r) => s + r.absGap, 0) / rows.length) * 10) / 10 : 0,
    };
  }, [teacherMetrics, selectedExamType]);

  return { teacherMetrics, gradingFairness, currentSections, prevSections };
}
