import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PaperDetails, Section } from '@/types/questionPaper';

interface Props {
  details: PaperDetails;
  sections: Section[];
  currentMarks: number;
}

interface ValidationItem {
  label: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

const ValidationStep: React.FC<Props> = ({ details, sections, currentMarks }) => {
  const checks: ValidationItem[] = [];

  // 1. Paper details complete
  checks.push({
    label: 'Paper Details',
    status: details.className && details.subject && details.examName ? 'pass' : 'fail',
    message: details.className && details.subject && details.examName
      ? `${details.className} — ${details.subject} — ${details.examName}`
      : 'Class, Subject, or Exam name is missing',
  });

  // 2. Sections exist
  checks.push({
    label: 'Sections Added',
    status: sections.length > 0 ? 'pass' : 'fail',
    message: sections.length > 0 ? `${sections.length} sections defined` : 'No sections added',
  });

  // 3. Questions exist
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  checks.push({
    label: 'Questions Added',
    status: totalQuestions > 0 ? 'pass' : 'fail',
    message: totalQuestions > 0 ? `${totalQuestions} questions across all sections` : 'No questions added yet',
  });

  // 4. Marks match target
  checks.push({
    label: 'Total Marks',
    status: currentMarks === details.targetMarks ? 'pass' : currentMarks > 0 ? 'warn' : 'fail',
    message: currentMarks === details.targetMarks
      ? `${currentMarks} marks matches target of ${details.targetMarks}`
      : `Current: ${currentMarks} marks | Target: ${details.targetMarks} marks (${currentMarks < details.targetMarks ? 'short by' : 'over by'} ${Math.abs(details.targetMarks - currentMarks)})`,
  });

  // 5. Numbering valid
  checks.push({
    label: 'Continuous Numbering',
    status: totalQuestions > 0 ? 'pass' : 'warn',
    message: totalQuestions > 0
      ? `Q1 through Q${totalQuestions} — all valid`
      : 'Add questions to validate numbering',
  });

  // 6. OR questions have equal marks
  const orIssues: string[] = [];
  sections.forEach(s => {
    s.questions.forEach((q, i) => {
      if (q.hasOr && q.orQuestion && q.orQuestion.marks !== q.marks) {
        orIssues.push(`Q${i + 1}: main=${q.marks}M, OR=${q.orQuestion.marks}M`);
      }
    });
  });
  if (sections.some(s => s.questions.some(q => q.hasOr))) {
    checks.push({
      label: 'OR Questions Marks Match',
      status: orIssues.length === 0 ? 'pass' : 'fail',
      message: orIssues.length === 0 ? 'All OR alternatives have matching marks' : `Mismatches: ${orIssues.join(', ')}`,
    });
  }

  // 7. Answer-any rules
  sections.forEach(s => {
    if (s.answerRule === 'any-k' && s.answerAnyK) {
      const hasEnoughQuestions = s.questions.length >= s.answerAnyK;
      checks.push({
        label: `Section ${s.label}: Answer Any Rule`,
        status: hasEnoughQuestions ? 'pass' : 'warn',
        message: hasEnoughQuestions
          ? `${s.questions.length} questions available, answer any ${s.answerAnyK}`
          : `Only ${s.questions.length} questions but answer-any requires at least ${s.answerAnyK}`,
      });
    }
  });

  // 8. Empty question texts
  const emptyTexts = sections.flatMap(s => s.questions.filter(q => !q.text.trim()));
  if (emptyTexts.length > 0) {
    checks.push({
      label: 'Question Texts',
      status: 'warn',
      message: `${emptyTexts.length} question(s) have empty text`,
    });
  }

  const allPass = checks.every(c => c.status === 'pass');
  const hasFailures = checks.some(c => c.status === 'fail');

  const statusIcon = (status: ValidationItem['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warn': return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'fail': return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <Card className={cn(
        'card-shadow border-l-4',
        allPass ? 'border-l-success' : hasFailures ? 'border-l-destructive' : 'border-l-warning'
      )}>
        <CardContent className="p-4 flex items-center gap-3">
          {allPass ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : hasFailures ? (
            <XCircle className="w-6 h-6 text-destructive" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-warning" />
          )}
          <div>
            <p className="font-medium text-foreground">
              {allPass ? 'All checks passed — ready to publish!' : hasFailures ? 'Some issues need fixing before publishing' : 'Warnings found — review before publishing'}
            </p>
            <p className="text-sm text-muted-foreground">
              {checks.filter(c => c.status === 'pass').length} passed, {checks.filter(c => c.status === 'warn').length} warnings, {checks.filter(c => c.status === 'fail').length} failures
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <div className="space-y-2">
        {checks.map((check, i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="p-3 flex items-center gap-3">
              {statusIcon(check.status)}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{check.label}</p>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ValidationStep;
