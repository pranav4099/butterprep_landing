import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ExamTypeDropdown from '@/components/ExamTypeDropdown';

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const TeacherAspectShell = ({ title, subtitle, children }: Props) => {
  const navigate = useNavigate();
  const { selectedExamType, setSelectedExamType } = useAuth();

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <button onClick={() => navigate('/insights')} className="hover:text-foreground transition-colors">
          Insights
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate('/insights')} className="hover:text-foreground transition-colors">
          School-wide
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Teacher · {title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="min-w-[220px]">
          <ExamTypeDropdown selectedExamType={selectedExamType} onExamTypeChange={setSelectedExamType} />
        </div>
      </div>

      {children}
    </div>
  );
};

export default TeacherAspectShell;
