import { useState, useEffect, useCallback } from 'react';
import type { QuestionPaper } from '@/types/questionPaper';
import { seedPapers } from '@/data/questionPaperSeed';

const STORAGE_KEY = 'butterprep_papers';

function loadPapers(): QuestionPaper[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // First time: seed with sample data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPapers));
  return seedPapers;
}

function savePapers(papers: QuestionPaper[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
}

export function usePapers() {
  const [papers, setPapers] = useState<QuestionPaper[]>(loadPapers);

  useEffect(() => {
    savePapers(papers);
  }, [papers]);

  const addPaper = useCallback((paper: QuestionPaper) => {
    setPapers(prev => [paper, ...prev]);
  }, []);

  const updatePaper = useCallback((paper: QuestionPaper) => {
    setPapers(prev => prev.map(p => p.id === paper.id ? { ...paper, updatedAt: new Date().toISOString().split('T')[0] } : p));
  }, []);

  const deletePaper = useCallback((id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id));
  }, []);

  const duplicatePaper = useCallback((id: string) => {
    setPapers(prev => {
      const source = prev.find(p => p.id === id);
      if (!source) return prev;
      const dup: QuestionPaper = {
        ...JSON.parse(JSON.stringify(source)),
        id: crypto.randomUUID(),
        details: { ...source.details, id: crypto.randomUUID() },
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return [dup, ...prev];
    });
  }, []);

  const publishPaper = useCallback((id: string) => {
    setPapers(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'published' as const, updatedAt: new Date().toISOString().split('T')[0] } : p
    ));
  }, []);

  const getPaper = useCallback((id: string) => {
    return papers.find(p => p.id === id);
  }, [papers]);

  return { papers, addPaper, updatePaper, deletePaper, duplicatePaper, publishPaper, getPaper };
}
