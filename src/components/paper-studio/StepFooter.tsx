// Reusable wizard footer with Back / Next buttons.
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
  rightExtra?: React.ReactNode;
}

const StepFooter: React.FC<Props> = ({
  onBack, onNext, nextLabel = 'Next', nextDisabled, backLabel = 'Back', rightExtra,
}) => (
  <div className="flex items-center justify-between pt-4 mt-2 border-t">
    <div>
      {onBack && (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {backLabel}
        </Button>
      )}
    </div>
    <div className="flex items-center gap-2">
      {rightExtra}
      {onNext && (
        <Button onClick={onNext} disabled={nextDisabled} className="bg-gradient-to-r from-purple to-info hover:opacity-90 text-white">
          {nextLabel} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  </div>
);

export default StepFooter;
