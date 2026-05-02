import React from 'react';
import { Check, AlertTriangle, AlertCircle, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PaperDetails, Section, ValidationWarning } from '@/types/questionPaper';
import { computeSectionAnswerableMarks, computePaperMarks, validatePaper } from '@/types/questionPaper';

interface Props {
  details: PaperDetails;
  sections: Section[];
  status: 'draft' | 'published';
}

const ValidationSidebar: React.FC<Props> = ({ details, sections, status }) => {
  const currentMarks = computePaperMarks(sections);
  const warnings = validatePaper(details, sections);
  const errors = warnings.filter(w => w.type === 'error');
  const infos = warnings.filter(w => w.type === 'warning');
  const isMatch = currentMarks === details.targetMarks;
  const isOver = currentMarks > details.targetMarks;

  return (
    <div className="w-64 border-l border-border bg-card shrink-0 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <Badge variant="outline" className={cn(
            'text-[10px]',
            status === 'published' ? 'bg-success/10 text-success border-success/30' : 'bg-warning-light text-warning border-warning/30'
          )}>
            {status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        {/* Marks Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Target Marks</span>
            <span className="font-semibold text-foreground">{details.targetMarks}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Current Marks</span>
            <span className={cn('font-semibold', isMatch ? 'text-success' : isOver ? 'text-destructive' : 'text-foreground')}>
              {currentMarks}
            </span>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md',
            isMatch ? 'bg-success/10 text-success' : isOver ? 'bg-destructive/10 text-destructive' : 'bg-warning-light text-warning'
          )}>
            {isMatch ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {isMatch ? 'Marks matched!' : isOver ? `${currentMarks - details.targetMarks} marks over` : `${details.targetMarks - currentMarks} marks remaining`}
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Section Breakdown</p>
          {sections.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">No sections yet</p>
          ) : (
            sections.map(section => {
              const sMarks = computeSectionAnswerableMarks(section);
              return (
                <div key={section.id} className="flex items-center justify-between text-[11px] px-2 py-1 rounded hover:bg-muted/50">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{section.label}. {section.title}</span>
                  </div>
                  <span className="text-muted-foreground font-medium">{sMarks}m</span>
                </div>
              );
            })
          )}
        </div>

        {/* Validation */}
        {warnings.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground flex items-center gap-1">
              {errors.length > 0 ? <AlertCircle className="w-3.5 h-3.5 text-destructive" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
              Validation ({warnings.length})
            </p>
            {warnings.map((w, i) => (
              <div key={i} className={cn(
                'text-[10px] px-2 py-1 rounded',
                w.type === 'error' ? 'bg-destructive/5 text-destructive' : 'bg-warning-light text-warning'
              )}>
                {w.message}
              </div>
            ))}
          </div>
        )}

        {warnings.length === 0 && sections.length > 0 && (
          <div className="text-[10px] text-success flex items-center gap-1 px-2 py-1 bg-success/5 rounded">
            <Check className="w-3 h-3" /> All validations passed
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationSidebar;
