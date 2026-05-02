// BulkImportDialog — CSV upload with downloadable template.
// Parses minimal columns and adds rows to the requesting teacher's My Bank.
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { questionBankStore } from '@/data/questionBankData';
import type { BankQuestion } from '@/data/questionBankData';
import type { QuestionType } from '@/types/questionPaper';
import type { Difficulty, BloomLevel } from '@/types/paperStudio';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  currentUserName: string;
  defaultClassName: string;
  defaultSubject: string;
}

const TEMPLATE = `type,text,marks,chapter,topic,difficulty,bloom,options,correctAnswer,modelAnswer
mcq,"What is the SI unit of force?",1,"Force and Laws of Motion","SI units",easy,remember,"Newton|Joule|Watt|Pascal","Newton",
short-answer,"Define inertia and give one example.",2,"Force and Laws of Motion","Inertia",medium,understand,,,"Inertia is the property of a body to resist a change in its state of motion or rest. Example: a passenger lurches forward when a bus stops suddenly."
`;

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (cur !== '' || row.length) { row.push(cur); rows.push(row); row = []; cur = ''; }
        if (ch === '\r' && text[i + 1] === '\n') i++;
      } else cur += ch;
    }
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

const BulkImportDialog: React.FC<Props> = ({ open, onOpenChange, currentUserId, currentUserName, defaultClassName, defaultSubject }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'question-bank-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error('CSV is empty');
      const header = rows[0].map(h => h.trim().toLowerCase());
      const idx = (k: string) => header.indexOf(k);
      const required = ['type', 'text', 'marks', 'chapter', 'topic', 'difficulty', 'bloom'];
      for (const r of required) if (idx(r) === -1) throw new Error(`Missing column: ${r}`);

      let added = 0;
      rows.slice(1).forEach(cols => {
        const get = (k: string) => (cols[idx(k)] || '').trim();
        const optsRaw = get('options');
        const q: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> = {
          createdBy: currentUserId,
          createdByName: currentUserName,
          type: (get('type') || 'short-answer') as QuestionType,
          text: get('text'),
          marks: Number(get('marks')) || 1,
          chapter: get('chapter'),
          topic: get('topic'),
          difficulty: (get('difficulty') || 'medium') as Difficulty,
          bloomLevel: (get('bloom') || 'understand') as BloomLevel,
          className: defaultClassName,
          subject: defaultSubject,
          options: optsRaw ? optsRaw.split('|').map(s => s.trim()).filter(Boolean) : undefined,
          correctAnswer: get('correctAnswer') || undefined,
          modelAnswer: get('modelAnswer') || undefined,
          visibility: 'private',
          source: 'imported',
        };
        if (q.text) { questionBankStore.add(q); added++; }
      });

      toast({ title: `Imported ${added} questions`, description: 'Saved to My Bank as private.' });
      onOpenChange(false);
      setFile(null);
    } catch (err) {
      toast({ title: 'Import failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk import questions</DialogTitle>
          <DialogDescription>
            Upload a CSV. Imported questions land in <strong>My Bank</strong> (private) — review and submit them when ready.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
            <Download className="w-4 h-4" /> Download template
          </Button>

          <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block mx-auto text-xs text-muted-foreground"
            />
            {file && <p className="text-xs mt-2 text-foreground">{file.name}</p>}
          </div>

          <p className="text-xs text-muted-foreground">
            Columns: <code>type, text, marks, chapter, topic, difficulty, bloom, options (pipe-separated), correctAnswer, modelAnswer</code>
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={importFile} disabled={!file || busy}>{busy ? 'Importing…' : 'Import'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportDialog;
