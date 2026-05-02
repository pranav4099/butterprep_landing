import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface StepInfo {
  id: string;
  number: number;
  title: string;
  description: string;
  path: string;
  isCompleted: boolean;
  requiredCount: number;
  currentCount: number;
}

interface MasterDataContextType {
  steps: StepInfo[];
  completedCount: number;
  totalSteps: number;
  isStepUnlocked: (stepNumber: number) => boolean;
  markStepComplete: (stepId: string) => void;
  markStepIncomplete: (stepId: string) => void;
  updateStepProgress: (stepId: string, current: number, required: number) => void;
  getNextIncompleteStep: () => StepInfo | null;
}

const MasterDataContext = createContext<MasterDataContextType | null>(null);

const initialSteps: StepInfo[] = [
  { id: 'academic-year', number: 1, title: 'Academic Year', description: 'Set the active academic year', path: '/master-data/academic-year', isCompleted: true, requiredCount: 1, currentCount: 1 },
  { id: 'classes', number: 2, title: 'Classes & Sections', description: 'Define your school structure', path: '/master-data/classes', isCompleted: true, requiredCount: 1, currentCount: 5 },
  { id: 'students', number: 3, title: 'Students', description: 'Add student records', path: '/master-data/students', isCompleted: true, requiredCount: 1, currentCount: 5 },
  { id: 'teachers', number: 4, title: 'Teachers', description: 'Register your teachers', path: '/master-data/teachers', isCompleted: true, requiredCount: 1, currentCount: 4 },
  { id: 'subjects', number: 5, title: 'Subjects', description: 'Create subjects per class', path: '/master-data/subjects', isCompleted: true, requiredCount: 1, currentCount: 6 },
  { id: 'subject-mapping', number: 6, title: 'Subject Mapping', description: 'Assign subjects & teachers to sections', path: '/master-data/subject-mapping', isCompleted: true, requiredCount: 1, currentCount: 1 },
  { id: 'student-enrollment', number: 7, title: 'Student Enrollment', description: 'Manage student subject selections', path: '/master-data/student-enrollment', isCompleted: true, requiredCount: 1, currentCount: 1 },
  { id: 'marks-grading', number: 8, title: 'Marks & Grading', description: 'Configure marks structure & grading', path: '/master-data/marks-grading', isCompleted: true, requiredCount: 1, currentCount: 7 },
  { id: 'create-exam', number: 9, title: 'Create Exam', description: 'Set up exams for evaluation', path: '/master-data/create-exam', isCompleted: true, requiredCount: 1, currentCount: 1 },
];

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<StepInfo[]>(initialSteps);

  const completedCount = useMemo(() => steps.filter(s => s.isCompleted).length, [steps]);
  const totalSteps = steps.length;

  const isStepUnlocked = useCallback((stepNumber: number) => {
    if (stepNumber === 1) return true;
    // All previous steps must be completed
    return steps.slice(0, stepNumber - 1).every(s => s.isCompleted);
  }, [steps]);

  const markStepComplete = useCallback((stepId: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, isCompleted: true } : s));
  }, []);

  const markStepIncomplete = useCallback((stepId: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, isCompleted: false } : s));
  }, []);

  const updateStepProgress = useCallback((stepId: string, current: number, required: number) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, currentCount: current, requiredCount: required, isCompleted: current >= required } : s));
  }, []);

  const getNextIncompleteStep = useCallback(() => {
    return steps.find(s => !s.isCompleted) || null;
  }, [steps]);

  return (
    <MasterDataContext.Provider value={{ steps, completedCount, totalSteps, isStepUnlocked, markStepComplete, markStepIncomplete, updateStepProgress, getNextIncompleteStep }}>
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = (): MasterDataContextType => {
  const ctx = useContext(MasterDataContext);
  if (!ctx) {
    throw new Error('useMasterData must be used within MasterDataProvider');
  }
  return ctx;
};
