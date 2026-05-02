import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ExamTypeDropdown from '@/components/ExamTypeDropdown';
import TeacherPerformanceInsights from '@/components/insights/TeacherPerformanceInsights';

const TeacherInsightsPage = () => {
  const navigate = useNavigate();
  const { selectedExamType, setSelectedExamType } = useAuth();

  return (
    <div className="p-6 space-y-5">
      <button
        onClick={() => navigate('/insights')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Insights</span>
      </button>

      

      <TeacherPerformanceInsights selectedExamType={selectedExamType} />
    </div>
  );
};

export default TeacherInsightsPage;
