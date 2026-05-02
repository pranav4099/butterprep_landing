import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMasterData } from '@/contexts/MasterDataContext';

interface MasterDataStepFooterProps {
  currentStepId: string;
  canProceed?: boolean;
  onSave?: () => void;
  saveLabel?: string;
}

const MasterDataStepFooter: React.FC<MasterDataStepFooterProps> = ({ 
  currentStepId, 
  canProceed = true,
  onSave,
  saveLabel,
}) => {
  const navigate = useNavigate();
  const { steps } = useMasterData();
  
  const currentIndex = steps.findIndex(s => s.id === currentStepId);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  const currentStep = steps[currentIndex];

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
      <div>
        {prevStep && (
          <Button variant="ghost" onClick={() => navigate(prevStep.path)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {prevStep.title}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {onSave && (
          <Button variant="outline" onClick={onSave}>
            {saveLabel || 'Save'}
          </Button>
        )}
        {nextStep && (
          <Button 
            onClick={() => navigate(nextStep.path)} 
            disabled={!canProceed || !currentStep?.isCompleted}
            className="gap-2"
          >
            Continue to {nextStep.title}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        {!nextStep && currentStep?.isCompleted && (
          <Button className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
            <CheckCircle2 className="w-4 h-4" />
            Setup Complete
          </Button>
        )}
      </div>
    </div>
  );
};

export default MasterDataStepFooter;
