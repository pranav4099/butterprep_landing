// PaperStudioContext — persists the AI wizard state across the 6 steps.
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  PaperStudioState,
  PaperStudioDetails,
  PatternRow,
  ChapterSelection,
  QuestionPreferences,
  defaultDetails,
  defaultPattern,
  defaultPreferences,
} from '@/types/paperStudio';
import { getSyllabus } from '@/data/syllabusData';

interface PaperStudioContextType {
  state: PaperStudioState;
  setDetails: (patch: Partial<PaperStudioDetails>) => void;
  setPattern: (rows: PatternRow[]) => void;
  setSyllabus: (chapters: ChapterSelection[]) => void;
  setPreferences: (patch: Partial<QuestionPreferences>) => void;
  setGeneratedPaperId: (id: string | undefined) => void;
  resetWizard: () => void;
}

const initialState = (): PaperStudioState => {
  const details = defaultDetails();
  return {
    details,
    pattern: defaultPattern(),
    syllabus: getSyllabus(details.className, details.subject).map(c => ({
      chapterId: c.id,
      chapterName: c.name,
      topics: c.topics,
      topicSelections: c.topics.map(t => ({ name: t, included: true, targetMarks: 0 })),
      targetMarks: c.recommendedMarks,
      priority: 'medium',
      difficultyFocus: 'medium',
      included: true,
    })),
    preferences: defaultPreferences(),
  };
};

const PaperStudioContext = createContext<PaperStudioContextType | undefined>(undefined);

export const PaperStudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PaperStudioState>(initialState);

  const setDetails = useCallback((patch: Partial<PaperStudioDetails>) => {
    setState(prev => {
      const nextDetails = { ...prev.details, ...patch };
      // Re-seed syllabus if class or subject changed
      const classOrSubjectChanged =
        (patch.className && patch.className !== prev.details.className) ||
        (patch.subject && patch.subject !== prev.details.subject);
      if (classOrSubjectChanged) {
        const chapters = getSyllabus(nextDetails.className, nextDetails.subject);
        return {
          ...prev,
          details: nextDetails,
          syllabus: chapters.map(c => ({
            chapterId: c.id,
            chapterName: c.name,
            topics: c.topics,
            topicSelections: c.topics.map(t => ({ name: t, included: true, targetMarks: 0 })),
            targetMarks: c.recommendedMarks,
            priority: 'medium',
            difficultyFocus: 'medium',
            included: true,
          })),
        };
      }
      return { ...prev, details: nextDetails };
    });
  }, []);

  const setPattern = useCallback((rows: PatternRow[]) => {
    setState(prev => ({ ...prev, pattern: rows }));
  }, []);

  const setSyllabus = useCallback((chapters: ChapterSelection[]) => {
    setState(prev => ({ ...prev, syllabus: chapters }));
  }, []);

  const setPreferences = useCallback((patch: Partial<QuestionPreferences>) => {
    setState(prev => ({ ...prev, preferences: { ...prev.preferences, ...patch } }));
  }, []);

  const setGeneratedPaperId = useCallback((id: string | undefined) => {
    setState(prev => ({ ...prev, generatedPaperId: id }));
  }, []);

  const resetWizard = useCallback(() => setState(initialState()), []);

  return (
    <PaperStudioContext.Provider value={{
      state, setDetails, setPattern, setSyllabus, setPreferences, setGeneratedPaperId, resetWizard,
    }}>
      {children}
    </PaperStudioContext.Provider>
  );
};

export const usePaperStudio = () => {
  const ctx = useContext(PaperStudioContext);
  if (!ctx) throw new Error('usePaperStudio must be used within PaperStudioProvider');
  return ctx;
};
