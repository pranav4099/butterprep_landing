import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, TrendingUp, ChevronDown, Send, BookOpen, Zap, Mic, FlaskConical, FileSearch } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { mockQuickAssessments, masterExams } from '@/data/quickAssessmentData';

const exams = [
  { id: 'FA1', name: 'FA1 (Formative Assessment 1)' },
  { id: 'FA2', name: 'FA2 (Formative Assessment 2)' },
  { id: 'SA1', name: 'SA1 (Summative Assessment 1)' },
  { id: 'FA3', name: 'FA3 (Formative Assessment 3)' },
  { id: 'FA4', name: 'FA4 (Formative Assessment 4)' },
  { id: 'SA2', name: 'SA2 (Summative Assessment 2)' },
];

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, selectedExamType, setSelectedExamType } = useAuth();
  const selectedExam = exams.find(e => e.id === selectedExamType) || exams[0];
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);

  const stats = [
    { label: 'Assigned', value: 35, icon: FileText, color: 'primary' },
    { label: 'Reviewed', value: 12, icon: CheckCircle, color: 'success' },
    { label: 'Pending', value: 23, icon: Clock, color: 'warning' },
    { label: 'Finalized', value: 8, icon: Send, color: 'info' },
  ];

  return (
    <div className="space-y-5">
      {/* Exam Selector */}
      <div className="relative">
        <button
          onClick={() => setExamDropdownOpen(!examDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors w-full"
        >
          <span className="text-sm font-medium text-foreground flex-1 text-left truncate">
            {selectedExam.name}
          </span>
          <ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground transition-transform shrink-0",
            examDropdownOpen && "rotate-180"
          )} />
        </button>
        
        {examDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => { setSelectedExamType(exam.id); setExamDropdownOpen(false); }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors",
                  selectedExam.id === exam.id && "bg-primary/10 text-primary"
                )}
              >
                {exam.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stat Cards - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className={cn("card-shadow border-l-4", `border-l-${s.color}`)}>
            <CardContent className="p-4">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", `bg-${s.color}/10`)}>
                <s.icon className={cn("w-4.5 h-4.5", `text-${s.color}`)} />
              </div>
              <p className={cn("text-2xl font-bold", `text-${s.color}`)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Papers {s.label.toLowerCase()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cards */}
      <div className="space-y-3">
        <Card 
          className="card-shadow cursor-pointer hover:shadow-lg hover:border-blue-500/30 transition-all group"
          onClick={() => navigate('/teacher/qp-review')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileSearch className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Question Paper Review</h3>
              <p className="text-sm text-muted-foreground">Review assigned papers & finalize answer keys</p>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90 shrink-0" />
          </CardContent>
        </Card>

        <Card 
          className="card-shadow cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
          onClick={() => navigate('/teacher/review')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Review Answer Papers</h3>
              <p className="text-sm text-muted-foreground">23 papers pending review</p>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90 shrink-0" />
          </CardContent>
        </Card>

        <Card 
          className="card-shadow cursor-pointer hover:shadow-lg hover:border-success/30 transition-all group"
          onClick={() => navigate('/teacher/rubrics')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Rubric Management</h3>
              <p className="text-sm text-muted-foreground">Assign & manage rubrics</p>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90 shrink-0" />
          </CardContent>
        </Card>

        <Card 
          className="card-shadow cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all group border-dashed border-primary/30"
          onClick={() => navigate('/teacher/quick-assessment/create')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Create Quick Assessment</h3>
              <p className="text-sm text-muted-foreground">Create oral or practical assessments linked to a master exam</p>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90 shrink-0" />
          </CardContent>
        </Card>

        <Card 
          className="card-shadow cursor-pointer hover:shadow-lg hover:border-warning/30 transition-all group"
          onClick={() => navigate('/teacher/insights')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Learning Patterns</h3>
              <p className="text-sm text-muted-foreground">Class observations & insights</p>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90 shrink-0" />
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default TeacherDashboard;
