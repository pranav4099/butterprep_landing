import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useParent } from '@/contexts/ParentContext';
import { cn } from '@/lib/utils';
import {
  ChevronRight, TrendingUp, TrendingDown, Minus,
  CheckCircle2, AlertTriangle
} from 'lucide-react';

const ParentSubjectsList = () => {
  const navigate = useNavigate();
  const { selectedChild, getExamResults, getSubjectInsight } = useParent();
  const allResults = getExamResults();

  if (!selectedChild) return null;

  const firstName = selectedChild.name.split(' ')[0];
  const subjects = [...new Set(allResults.map(r => r.subject))];

  const subjectData = subjects.map(subject => {
    const exams = allResults.filter(r => r.subject === subject).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const avg = Math.round(exams.reduce((s, r) => s + (r.score / r.total) * 100, 0) / exams.length);
    const latest = exams[exams.length - 1];
    const previous = exams.length >= 2 ? exams[exams.length - 2] : null;
    const latestPct = Math.round((latest.score / latest.total) * 100);
    const prevPct = previous ? Math.round((previous.score / previous.total) * 100) : null;
    const trend = prevPct !== null ? (latestPct > prevPct ? 'up' : latestPct < prevPct ? 'down' : 'stable') : 'stable';
    const insight = getSubjectInsight(subject);
    const strongCount = insight?.topicAnalysis.filter(t => t.status === 'strong').length || 0;
    const weakCount = insight?.topicAnalysis.filter(t => t.status === 'needs-practice').length || 0;

    return { subject, avg, exams, latest, trend, latestPct, strongCount, weakCount };
  }).sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Subjects</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {firstName}'s performance across all subjects
        </p>
      </div>

      <div className="space-y-2.5">
        {subjectData.map(({ subject, avg, exams, trend, latestPct, strongCount, weakCount }) => (
          <Card
            key={subject}
            className="border-0 card-shadow rounded-xl cursor-pointer hover:card-shadow-elevated transition-all tap-target"
            onClick={() => navigate(`/parent/subject/${encodeURIComponent(subject)}`)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm",
                avg >= 75 ? "bg-success/10 text-success" : avg >= 60 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
              )}>
                {avg}%
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{subject}</p>
                  {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-success" />}
                  {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-warning" />}
                  {trend === 'stable' && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span>{exams.length} exams</span>
                  {strongCount > 0 && (
                    <span className="flex items-center gap-0.5 text-success">
                      <CheckCircle2 className="w-3 h-3" /> {strongCount}
                    </span>
                  )}
                  {weakCount > 0 && (
                    <span className="flex items-center gap-0.5 text-warning">
                      <AlertTriangle className="w-3 h-3" /> {weakCount}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[11px] text-muted-foreground">Latest</p>
                <p className={cn("text-sm font-bold", latestPct >= 75 ? "text-success" : latestPct >= 60 ? "text-primary" : "text-warning")}>
                  {latestPct}%
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ParentSubjectsList;
