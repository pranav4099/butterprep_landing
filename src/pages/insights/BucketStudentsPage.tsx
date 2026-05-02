import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { buildClassSections, getClassSubjectData } from '@/data/teacherInsightsData';
import type { StudentRecord } from '@/data/teacherInsightsData';
import TeacherStudentView from '@/pages/teacher/insights/TeacherStudentView';
import ExamTypeDropdown from '@/components/ExamTypeDropdown';

type BucketType = 'strong' | 'average' | 'needs-support';

const BUCKET_CONFIG: Record<BucketType, { label: string; emoji: string; color: string; desc: string }> = {
  'strong': { label: 'Strong', emoji: '🟢', color: 'success', desc: 'Scoring 70%+' },
  'average': { label: 'Average', emoji: '🟡', color: 'warning', desc: 'Scoring 55–69%' },
  'needs-support': { label: 'Needs Support', emoji: '🔴', color: 'destructive', desc: 'Scoring below 55%' },
};

interface StudentEntry {
  id: string;
  name: string;
  score: number;
  rollNo: string;
  record: StudentRecord;
}

interface SectionGroup {
  section: string;
  sectionId: string;
  students: StudentEntry[];
}

interface ClassGroup {
  classNum: number;
  sections: SectionGroup[];
  totalStudents: number;
}

const BucketStudentsPage = () => {
  const { bucket } = useParams<{ bucket: string }>();
  const navigate = useNavigate();
  const { selectedExamType, setSelectedExamType } = useAuth();
  const [selectedClassNum, setSelectedClassNum] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const bucketType = (bucket as BucketType) || 'strong';
  const config = BUCKET_CONFIG[bucketType] || BUCKET_CONFIG['strong'];

  const examSections = useMemo(() => buildClassSections(selectedExamType || 'FA1'), [selectedExamType]);

  const classGroups: ClassGroup[] = useMemo(() => {
    const classMap: Record<number, SectionGroup[]> = {};

    examSections.forEach(cs => {
      const studentsSet: Record<string, StudentEntry> = {};
      cs.subjects.forEach(sub => {
        const subData = getClassSubjectData(cs, sub, selectedExamType || 'FA1');
        subData.students.forEach(st => {
          if (!studentsSet[st.id]) {
            studentsSet[st.id] = { id: st.id, name: st.name, score: st.score, rollNo: st.rollNo, record: st };
          }
        });
      });

      const filtered = Object.values(studentsSet).filter(st => {
        if (bucketType === 'strong') return st.score >= 70;
        if (bucketType === 'average') return st.score >= 55 && st.score < 70;
        return st.score < 55;
      }).sort((a, b) => bucketType === 'needs-support' ? a.score - b.score : b.score - a.score);

      if (filtered.length > 0) {
        if (!classMap[cs.classNum]) classMap[cs.classNum] = [];
        classMap[cs.classNum].push({
          section: cs.section,
          sectionId: cs.id,
          students: filtered,
        });
      }
    });

    return Object.entries(classMap)
      .map(([num, sections]) => ({
        classNum: Number(num),
        sections: sections.sort((a, b) => a.section.localeCompare(b.section)),
        totalStudents: sections.reduce((sum, s) => sum + s.students.length, 0),
      }))
      .sort((a, b) => a.classNum - b.classNum);
  }, [examSections, selectedExamType, bucketType]);

  const totalStudents = classGroups.reduce((sum, cg) => sum + cg.totalStudents, 0);
  const selectedClass = classGroups.find(cg => cg.classNum === selectedClassNum) || null;

  // If a student is selected, show their detail view
  if (selectedStudent) {
    return (
      <div className="p-6">
        <TeacherStudentView
          student={selectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      </div>
    );
  }

  const handleBack = () => {
    if (selectedClassNum) {
      setSelectedClassNum(null);
    } else {
      navigate('/insights');
    }
  };

  const backLabel = selectedClassNum ? `Back to ${config.label} Students` : 'Back to Insights';

  return (
    <div className="p-6 space-y-5">
      <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">{backLabel}</span>
      </button>

      

      {selectedClass ? (
        <div className="space-y-4">
          <Card className={cn("border-0 card-shadow-elevated rounded-2xl overflow-hidden relative")}>
            <div className={cn("absolute inset-0 bg-gradient-to-br via-transparent to-transparent", `from-${config.color}/6`)} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{config.emoji} {config.label} Students</p>
                  <h2 className="text-lg font-bold text-foreground tracking-tight mt-0.5">Class {selectedClass.classNum}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{selectedClass.sections.length} section(s) · {config.desc}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-4xl font-extrabold leading-none tracking-tight", `text-${config.color}`)}>
                    {selectedClass.totalStudents}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedClass.sections.map(sec => (
            <Card key={sec.sectionId} className="border-0 card-shadow rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Section {sec.section}</p>
                  <span className="text-[10px] text-muted-foreground">({sec.students.length} students)</span>
                </div>
                <div className="space-y-1">
                  {sec.students.map((st, idx) => (
                    <div
                      key={`${st.rollNo}-${idx}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(st.record)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-muted-foreground font-mono w-6">{st.rollNo}</span>
                        <span className="text-xs font-medium text-foreground">{st.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs font-bold",
                          st.score >= 70 ? 'text-success' : st.score >= 55 ? 'text-warning' : 'text-destructive'
                        )}>
                          {st.score}%
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Card className={cn("border-0 card-shadow-elevated rounded-2xl overflow-hidden relative")}>
            <div className={cn("absolute inset-0 bg-gradient-to-br via-transparent to-transparent", `from-${config.color}/6`)} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{config.emoji}</span>
                    <h2 className="text-lg font-bold text-foreground tracking-tight">{config.label} Students</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">{config.desc} · Select a class to view students</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-4xl font-extrabold leading-none tracking-tight", `text-${config.color}`)}>
                    {totalStudents}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2.5">
            {classGroups.map(cg => (
              <Card
                key={cg.classNum}
                className="border-0 card-shadow rounded-xl cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setSelectedClassNum(cg.classNum)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", `bg-${config.color}/10 text-${config.color}`)}>
                        {cg.classNum}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Class {cg.classNum}</p>
                        <p className="text-[11px] text-muted-foreground">{cg.sections.length} section(s) · {cg.totalStudents} students</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {classGroups.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No students found in this category.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BucketStudentsPage;
