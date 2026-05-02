import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PaperWorkflow, WorkflowStatus, ReviewComment, AnswerKeyEntry } from '@/types/paperWorkflow';
import { seedWorkflows } from '@/data/paperWorkflowSeed';

interface PaperWorkflowContextType {
  workflows: PaperWorkflow[];
  getWorkflow: (paperId: string) => PaperWorkflow | undefined;
  getTeacherWorkflows: (teacherId?: string) => PaperWorkflow[];
  assignPaper: (paperId: string, teacherId: string, teacherName: string, dueDate: string, note: string) => void;
  updateStatus: (paperId: string, status: WorkflowStatus, by: string) => void;
  addComment: (paperId: string, comment: Omit<ReviewComment, 'id' | 'timestamp'>) => void;
  generateAnswerKey: (paperId: string, entries: AnswerKeyEntry[]) => void;
  updateAnswerKeyEntry: (paperId: string, questionId: string, updates: Partial<AnswerKeyEntry>) => void;
  finalizeAnswerKey: (paperId: string) => void;
}

const PaperWorkflowContext = createContext<PaperWorkflowContextType | undefined>(undefined);

export const PaperWorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workflows, setWorkflows] = useState<PaperWorkflow[]>(seedWorkflows);

  const getWorkflow = useCallback((paperId: string) => {
    return workflows.find(w => w.paperId === paperId);
  }, [workflows]);

  const getTeacherWorkflows = useCallback((teacherId?: string) => {
    if (!teacherId) return workflows.filter(w => w.workflowStatus !== 'draft');
    return workflows.filter(w => w.assignedTeacherId === teacherId);
  }, [workflows]);

  const assignPaper = useCallback((paperId: string, teacherId: string, teacherName: string, dueDate: string, note: string) => {
    setWorkflows(prev => {
      const existing = prev.find(w => w.paperId === paperId);
      if (existing) {
        return prev.map(w => w.paperId === paperId ? {
          ...w,
          assignedTeacherId: teacherId,
          assignedTeacherName: teacherName,
          dueDate,
          assignNote: note,
          workflowStatus: 'under-review' as WorkflowStatus,
          statusHistory: [...w.statusHistory, { status: 'under-review' as WorkflowStatus, timestamp: new Date().toISOString(), by: 'Admin' }],
        } : w);
      }
      const newWorkflow: PaperWorkflow = {
        paperId,
        assignedTeacherId: teacherId,
        assignedTeacherName: teacherName,
        assignedBy: 'Admin',
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate,
        assignNote: note,
        workflowStatus: 'under-review',
        comments: [],
        answerKey: [],
        statusHistory: [
          { status: 'draft', timestamp: new Date().toISOString(), by: 'Admin' },
          { status: 'under-review', timestamp: new Date().toISOString(), by: 'Admin' },
        ],
      };
      return [...prev, newWorkflow];
    });
  }, []);

  const updateStatus = useCallback((paperId: string, status: WorkflowStatus, by: string) => {
    setWorkflows(prev => prev.map(w => w.paperId === paperId ? {
      ...w,
      workflowStatus: status,
      statusHistory: [...w.statusHistory, { status, timestamp: new Date().toISOString(), by }],
    } : w));
  }, []);

  const addComment = useCallback((paperId: string, comment: Omit<ReviewComment, 'id' | 'timestamp'>) => {
    setWorkflows(prev => prev.map(w => w.paperId === paperId ? {
      ...w,
      comments: [...w.comments, { ...comment, id: crypto.randomUUID(), timestamp: new Date().toISOString() }],
    } : w));
  }, []);

  const generateAnswerKey = useCallback((paperId: string, entries: AnswerKeyEntry[]) => {
    setWorkflows(prev => prev.map(w => w.paperId === paperId ? {
      ...w,
      answerKey: entries,
      workflowStatus: 'answer-key-draft' as WorkflowStatus,
      statusHistory: [...w.statusHistory, { status: 'answer-key-draft' as WorkflowStatus, timestamp: new Date().toISOString(), by: 'System' }],
    } : w));
  }, []);

  const updateAnswerKeyEntry = useCallback((paperId: string, questionId: string, updates: Partial<AnswerKeyEntry>) => {
    setWorkflows(prev => prev.map(w => w.paperId === paperId ? {
      ...w,
      answerKey: w.answerKey.map(e => e.questionId === questionId ? { ...e, ...updates, isEdited: true } : e),
    } : w));
  }, []);

  const finalizeAnswerKey = useCallback((paperId: string) => {
    setWorkflows(prev => prev.map(w => w.paperId === paperId ? {
      ...w,
      workflowStatus: 'answer-key-finalized' as WorkflowStatus,
      statusHistory: [...w.statusHistory, { status: 'answer-key-finalized' as WorkflowStatus, timestamp: new Date().toISOString(), by: 'Teacher' }],
    } : w));
  }, []);

  return (
    <PaperWorkflowContext.Provider value={{
      workflows,
      getWorkflow,
      getTeacherWorkflows,
      assignPaper,
      updateStatus,
      addComment,
      generateAnswerKey,
      updateAnswerKeyEntry,
      finalizeAnswerKey,
    }}>
      {children}
    </PaperWorkflowContext.Provider>
  );
};

export const usePaperWorkflow = () => {
  const context = useContext(PaperWorkflowContext);
  if (!context) throw new Error('usePaperWorkflow must be used within PaperWorkflowProvider');
  return context;
};
