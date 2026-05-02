// AI Paper Studio — wizard layout shell with sticky stepper.
import React from 'react';
import { Sparkles, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const STUDIO_STEPS = [
  { id: 'details', label: 'Paper Details' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'syllabus', label: 'Syllabus' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'generate', label: 'Generate' },
  { id: 'edit', label: 'Edit & Review' },
] as const;
export type StudioStepId = typeof STUDIO_STEPS[number]['id'];

interface Props {
  currentStep: StudioStepId;
  children: React.ReactNode;
  onSaveDraft?: () => void;
  rightSummary?: React.ReactNode;
}

const AiStudioLayout: React.FC<Props> = ({ currentStep, children, onSaveDraft, rightSummary }) => {
  const navigate = useNavigate();
  const currentIdx = STUDIO_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate('/question-papers')} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-1" /> Papers
            </Button>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span>Question Papers</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">Create with AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSaveDraft && (
              <Button variant="outline" size="sm" onClick={onSaveDraft}>
                Save Draft
              </Button>
            )}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-light text-purple text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              AI Paper Studio
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-4 md:px-6 pb-3 overflow-x-auto">
          <ol className="flex items-center gap-1 min-w-max">
            {STUDIO_STEPS.map((step, idx) => {
              const isDone = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <React.Fragment key={step.id}>
                  <li className="flex items-center gap-2">
                    <span className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                      isDone && 'bg-success text-success-foreground',
                      isCurrent && 'bg-gradient-to-br from-purple to-info text-white shadow-sm',
                      !isDone && !isCurrent && 'bg-muted text-muted-foreground',
                    )}>
                      {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                    </span>
                    <span className={cn(
                      'text-sm whitespace-nowrap',
                      isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground',
                    )}>{step.label}</span>
                  </li>
                  {idx < STUDIO_STEPS.length - 1 && (
                    <div className={cn('w-8 h-px mx-1', isDone ? 'bg-success' : 'bg-border')} />
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 md:px-6 py-6">
        <div className={cn('grid gap-6', rightSummary ? 'lg:grid-cols-[1fr_320px]' : 'grid-cols-1')}>
          <div className="min-w-0">{children}</div>
          {rightSummary && <aside className="lg:sticky lg:top-32 lg:self-start">{rightSummary}</aside>}
        </div>
      </div>
    </div>
  );
};

export default AiStudioLayout;
