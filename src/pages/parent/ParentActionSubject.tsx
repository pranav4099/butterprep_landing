import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ScrollText, NotebookPen, Sparkles, ThumbsUp, AlertTriangle } from 'lucide-react';
import { useParent } from '@/contexts/ParentContext';
import { getExamActionPlan, getSubjectActionPlan, STATUS_META, SubjectActionPlan } from '@/data/parentActionData';
import { cn } from '@/lib/utils';

const subjectChipClass = (status: SubjectActionPlan['status'], active: boolean) => {
  const base = 'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap';
  if (active) {
    if (status === 'keep_going') return `${base} bg-success text-success-foreground border-success shadow-sm`;
    if (status === 'revise') return `${base} bg-primary text-primary-foreground border-primary shadow-sm`;
    return `${base} bg-warning text-warning-foreground border-warning shadow-sm`;
  }
  if (status === 'keep_going') return `${base} bg-success/5 text-success border-success/20 hover:bg-success/10`;
  if (status === 'revise') return `${base} bg-primary/5 text-primary border-primary/20 hover:bg-primary/10`;
  return `${base} bg-warning/5 text-warning border-warning/20 hover:bg-warning/10`;
};

const ParentActionSubject: React.FC = () => {
  const { examId = '', subject = '' } = useParams();
  const decodedSubject = decodeURIComponent(subject);
  const navigate = useNavigate();
  const { selectedChild } = useParent();
  const tabsRef = useRef<HTMLDivElement>(null);

  const exam = selectedChild ? getExamActionPlan(selectedChild.id, examId) : null;
  const sortedSubjects = useMemo(
    () => (exam ? [...exam.subjects].sort((a, b) => STATUS_META[a.status].rank - STATUS_META[b.status].rank) : []),
    [exam]
  );
  const currentIndex = sortedSubjects.findIndex(
    s => s.subject.toLowerCase() === decodedSubject.toLowerCase()
  );

  const goToSubject = (subj: string) => {
    navigate(`/parent/action/${examId}/${encodeURIComponent(subj)}`);
  };

  // Auto-scroll active chip into view
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeEl = tabsRef.current.querySelector<HTMLButtonElement>('[data-active="true"]');
    activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [decodedSubject]);

  if (!selectedChild) return null;
  const data = getSubjectActionPlan(selectedChild.id, examId, decodedSubject);

  if (!data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/parent/action')} className="-ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card className="border-0 card-shadow rounded-2xl">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Subject action plan not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { subject: plan } = data;
  const examData = data.exam;
  const topics = plan.weak_topics.slice(0, 3);

  // Derive AI strengths and focus from precomputed data (no live calls).
  const strengths = [plan.encouragement].filter(Boolean);
  const focusAreas = plan.marks_lost_due_to.slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/parent/action')}
          className="-ml-2 h-8 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{plan.subject} Action Plan</h1>
          <p className="text-sm text-muted-foreground">Based on {examData.exam_name} answer review</p>
        </div>
      </div>

      {/* Subject tabs — quick navigation between subjects in this exam */}
      {sortedSubjects.length > 1 && (
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1"
        >
          {sortedSubjects.map(s => {
            const active = s.subject.toLowerCase() === plan.subject.toLowerCase();
            return (
              <button
                key={s.subject}
                data-active={active}
                onClick={() => goToSubject(s.subject)}
                className={subjectChipClass(s.status, active)}
              >
                {s.subject}
              </button>
            );
          })}
        </div>
      )}

      {/* AI Suggestion: strengths + focus */}
      <Card className="border-0 card-shadow rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-[hsl(var(--purple))]/8 via-primary/5 to-transparent p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--purple))]/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[hsl(var(--purple))]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">AI Suggestion</h2>
              <p className="text-[11px] text-muted-foreground">Personalised insight for parents</p>
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed">{plan.summary}</p>

          {strengths.length > 0 && (
            <div className="rounded-xl bg-success/5 border border-success/15 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-success" />
                <p className="text-[11px] font-bold text-success uppercase tracking-wide">What went well</p>
              </div>
              <ul className="space-y-1">
                {strengths.map((s, i) => (
                  <li key={i} className="text-sm text-foreground leading-snug flex gap-2">
                    <span className="text-success mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {focusAreas.length > 0 && (
            <div className="rounded-xl bg-warning/5 border border-warning/15 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                <p className="text-[11px] font-bold text-warning uppercase tracking-wide">Where help is needed</p>
              </div>
              <ul className="space-y-1">
                {focusAreas.map((s, i) => (
                  <li key={i} className="text-sm text-foreground leading-snug flex gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Topics to revise */}
      {topics.length > 0 && (
        <Section
          icon={<ScrollText className="w-4 h-4 text-primary" />}
          iconBg="bg-primary/10"
          title="Chapters & Topics to Revise"
        >
          <div className="flex flex-col gap-2">
            {topics.map((t, i) => (
              <div
                key={t}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50"
              >
                <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{t}</span>
              </div>
            ))}
          </div>
        </Section>
      )}


    </div>
  );
};

const Section: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}> = ({ icon, iconBg, title, children }) => (
  <Card className="border-0 card-shadow rounded-2xl">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>{icon}</div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </CardContent>
  </Card>
);

export default ParentActionSubject;
