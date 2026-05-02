// useQuestionBank — subscribes to the in-memory bank store and exposes
// filtered results plus CRUD helpers. Re-renders any consumer when the
// store changes (add / edit / approve / delete).
import { useEffect, useState, useMemo, useCallback } from 'react';
import { questionBankStore, filterBank, type BankFilter, type BankQuestion } from '@/data/questionBankData';

export function useQuestionBank(filter: BankFilter = {}) {
  const [, force] = useState(0);

  useEffect(() => {
    const unsub = questionBankStore.subscribe(() => force(n => n + 1));
    return () => { unsub(); };
  }, []);

  // Keep filter referentially stable per render — consumers usually inline it
  const results = useMemo(() => filterBank(filter), [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filter.className, filter.subject, filter.chapter, filter.topic,
    filter.difficulty, filter.bloomLevel, filter.marks, filter.type,
    filter.visibility, filter.visibleTo, filter.search,
    filter.approvedOnly, filter.unusedOnly,
  ]);

  const add = useCallback(questionBankStore.add, []);
  const update = useCallback(questionBankStore.update, []);
  const remove = useCallback(questionBankStore.remove, []);
  const bulkUpdate = useCallback(questionBankStore.bulkUpdate, []);
  const bulkRemove = useCallback(questionBankStore.bulkRemove, []);
  const incrementUsage = useCallback(questionBankStore.incrementUsage, []);

  return { results, add, update, remove, bulkUpdate, bulkRemove, incrementUsage };
}

export type { BankQuestion };
