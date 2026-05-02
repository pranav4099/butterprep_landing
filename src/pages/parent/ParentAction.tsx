import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, BookOpen, AlertTriangle, Trophy } from 'lucide-react';
import { useParent } from '@/contexts/ParentContext';
import { getActionPayload, ExamActionPlan, SubjectActionPlan, STATUS_META } from '@/data/parentActionData';
import { cn } from '@/lib/utils';

type ExamKey = 'fa1' | 'fa2' | 'sa1' | 'fa3' | 'fa4' | 'sa2';

const EXAM_SEQUENCE: { id: ExamKey; label: string; full: string }[] = [
  { id: 'fa1', label: 'FA1', full: 'Formative Assessment 1' },
  { id: 'fa2', label: 'FA2', full: 'Formative Assessment 2' },
  { id: 'sa1', label: 'SA1', full: 'Summative Assessment 1' },
  { id: 'fa3', label: 'FA3', full: 'Formative Assessment 3' },
  { id: 'fa4', label: 'FA4', full: 'Formative Assessment 4' },
  { id: 'sa2', label: 'SA2', full: 'Summative Assessment 2' },
];

const TERMS: { name: string; ids: ExamKey[] }[] = [
  { name: 'Term 1', ids: ['fa1', 'fa2', 'sa1'] },
  { name: 'Term 2', ids: ['fa3', 'fa4', 'sa2'] },
];

const subjectPillClass = (status: SubjectActionPlan['status']) => {
  if (status === 'keep_going') return 'bg-success/5 border-success/15 text-success';
  if (status === 'revise') return 'bg-primary/5 border-primary/15 text-primary';
  return 'bg-warning/5 border-warning/15 text-warning';
};

const ParentAction: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChild } = useParent();

  if (!selectedChild) return null;

  const payload = getActionPayload(selectedChild.id);
  const examMap = new Map<string, ExamActionPlan>(payload.exams.map(e => [e.exam_id, e]));

  const renderCard = (key: ExamKey, label: string, full: string) => {
    const exam = examMap.get(key);
    const isSA = label.startsWith('SA');

    if (!exam) {
      return (
        <Card key={key} className="border-0 card-shadow rounded-xl opacity-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground">{full}</p>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                Upcoming
              </span>
            </div>
          </CardContent>
        </Card>
      );
    }

    const focusSubjects = exam.subjects.filter(s => s.status === 'needs_focus');
    const strongSubjects = exam.subjects.filter(s => s.status === 'keep_going');
    const bestSubject = strongSubjects[0];
    const focusSubject = focusSubjects[0];

    return (
      <Card
        key={key}
        className="border-0 card-shadow rounded-xl overflow-hidden cursor-pointer hover:card-shadow-elevated transition-shadow tap-target"
        onClick={() => {
          const first = [...exam.subjects].sort(
            (a, b) => STATUS_META[a.status].rank - STATUS_META[b.status].rank
          )[0];
          if (first) {
            navigate(`/parent/action/${exam.exam_id}/${encodeURIComponent(first.subject)}`);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                isSA ? 'bg-[hsl(var(--purple))]/10' : 'bg-primary/10'
              )}
            >
              <span
                className={cn(
                  'text-xs font-bold',
                  isSA ? 'text-[hsl(var(--purple))]' : 'text-primary'
                )}
              >
                {label}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{full}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {exam.subjects.length} subjects · {strongSubjects.length} on track
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
          </div>

          {/* Subject status pills */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {exam.subjects.map(subj => (
              <div
                key={subj.subject}
                className={cn(
                  'flex-shrink-0 px-2.5 py-1.5 rounded-lg border',
                  subjectPillClass(subj.status)
                )}
              >
                <p className="text-[11px] font-medium text-foreground">{subj.subject}</p>
                <p className="text-[10px] font-semibold mt-0.5 capitalize">
                  {subj.status === 'keep_going' ? 'On track' : subj.status === 'revise' ? 'Revise' : 'Focus'}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {bestSubject && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-success/8 text-success px-2 py-0.5 rounded-full font-medium">
                <Trophy className="w-3 h-3" /> Strong: {bestSubject.subject}
              </span>
            )}
            {focusSubject && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-warning/8 text-warning px-2 py-0.5 rounded-full font-medium">
                <AlertTriangle className="w-3 h-3" /> Focus: {focusSubject.subject}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Action Plan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {selectedChild.name} · Class {selectedChild.className}-{selectedChild.section} · 2025–26
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TERMS.map(term => (
          <div key={term.name} className="space-y-3">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
              {term.name}
            </p>
            {term.ids.map(id => {
              const meta = EXAM_SEQUENCE.find(e => e.id === id)!;
              return renderCard(id, meta.label, meta.full);
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentAction;
