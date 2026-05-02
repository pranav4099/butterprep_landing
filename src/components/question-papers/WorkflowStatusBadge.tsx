import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WorkflowStatus } from '@/types/paperWorkflow';
import { workflowStatusLabels, workflowStatusColors } from '@/types/paperWorkflow';

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({ status, className }) => {
  const colors = workflowStatusColors[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {workflowStatusLabels[status]}
    </Badge>
  );
};

export default WorkflowStatusBadge;
