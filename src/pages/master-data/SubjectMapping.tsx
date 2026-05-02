import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  BookOpen, CheckCircle2, RefreshCw, Save, Copy, Loader2,
  GripVertical, Check, AlertCircle, X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MasterDataStepFooter from '@/components/MasterDataStepFooter';
import YearContextChip from '@/components/enrollment/YearContextChip';
import ConfirmModal from '@/components/enrollment/ConfirmModal';

// ── Data ──────────────────────────────────────────────────────────────────────

const allSubjects = [
  { id: 'math', name: 'Mathematics' },
  { id: 'english', name: 'English' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'science', name: 'Science' },
  { id: 'social', name: 'Social Science' },
  { id: 'computer', name: 'Computer Science' },
  { id: 'art', name: 'Art & Craft' },
  { id: 'pe', name: 'Physical Education' },
  { id: 'music', name: 'Music' },
  { id: 'sanskrit', name: 'Sanskrit' },
];

const subjectMap = Object.fromEntries(allSubjects.map(s => [s.id, s.name]));
const classNames = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
const sectionNames = ['A', 'B', 'C'];

// ── Types ─────────────────────────────────────────────────────────────────────

type Bucket = 'compulsory' | 'optional';
type MappingStatus = 'unmapped' | 'partial' | 'mapped';

interface SectionData {
  compulsory: string[];
  optional: string[];
}

interface ClassMapping {
  className: string;
  sections: string[];
  activeSection: string;
  sectionData: Record<string, SectionData>;
  saved: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildInitialData = (): ClassMapping[] =>
  classNames.map(className => {
    const num = parseInt(className.replace('Class ', ''));
    const sectionData: Record<string, SectionData> = {};
    sectionNames.forEach(sec => {
      sectionData[sec] = num >= 9
        ? { compulsory: ['math', 'english', 'hindi'], optional: ['science', 'social'] }
        : { compulsory: ['math', 'english', 'hindi'], optional: [] };
    });
    const hasMappings = Object.values(sectionData).some(d => d.compulsory.length + d.optional.length > 0);
    return { className, sections: sectionNames, activeSection: 'A', sectionData, saved: hasMappings };
  });

function getStatus(cls: ClassMapping): MappingStatus {
  const vals = Object.values(cls.sectionData);
  const hasAny = vals.some(d => d.compulsory.length + d.optional.length > 0);
  const allHave = vals.every(d => d.compulsory.length + d.optional.length > 0);
  if (!hasAny && !cls.saved) return 'unmapped';
  if (allHave && cls.saved) return 'mapped';
  return 'partial';
}

const statusConfig: Record<MappingStatus, { label: string; dot: string; text: string }> = {
  mapped: { label: 'Mapped', dot: 'bg-teal', text: 'text-teal' },
  partial: { label: 'Partial', dot: 'bg-warning', text: 'text-warning' },
  unmapped: { label: 'Not mapped', dot: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
};

// ── Draggable Subject Pill ────────────────────────────────────────────────────

const SubjectPill: React.FC<{
  id: string;
  name: string;
  bucket?: Bucket;
  onRemove?: () => void;
}> = ({ id, name, bucket, onRemove }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('subject-id', id);
    if (bucket) e.dataTransfer.setData('source-bucket', bucket);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg text-sm font-medium',
        'border cursor-grab active:cursor-grabbing select-none transition-all',
        'hover:shadow-sm active:shadow-md active:scale-[1.02]',
        bucket === 'compulsory' && 'bg-teal/10 border-teal/25 text-foreground',
        bucket === 'optional' && 'bg-sky/10 border-sky/25 text-foreground',
        !bucket && 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      <GripVertical className="w-3 h-3 text-muted-foreground/50 shrink-0" />
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
          aria-label={`Remove ${name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// ── Drop Zone ─────────────────────────────────────────────────────────────────

const DropZone: React.FC<{
  bucket: Bucket;
  label: string;
  subjects: string[];
  onDrop: (subjectId: string, sourceBucket?: Bucket) => void;
  onRemove: (subjectId: string) => void;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}> = ({ bucket, label, subjects, onDrop, onRemove, accentColor, accentBg, accentBorder }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const subjectId = e.dataTransfer.getData('subject-id');
    const source = e.dataTransfer.getData('source-bucket') as Bucket | '';
    if (subjectId && !subjects.includes(subjectId)) {
      onDrop(subjectId, source || undefined);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'rounded-xl border-2 border-dashed p-4 min-h-[140px] transition-all duration-200',
        dragOver ? `${accentBorder} ${accentBg} scale-[1.01] shadow-sm` : 'border-border/60 bg-muted/[0.02]',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-xs font-bold uppercase tracking-wider', accentColor)}>{label}</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{subjects.length}</Badge>
      </div>
      {subjects.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/60 italic">
          Drag subjects here
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {subjects.map(id => (
            <SubjectPill
              key={id}
              id={id}
              name={subjectMap[id] || id}
              bucket={bucket}
              onRemove={() => onRemove(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const SubjectMapping = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassMapping[]>(buildInitialData);
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [savingClass, setSavingClass] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; className: string }>({
    open: false, className: '',
  });

  const cls = classes.find(c => c.className === selectedClass)!;
  const secData = cls.sectionData[cls.activeSection] || { compulsory: [], optional: [] };
  const assignedIds = new Set([...secData.compulsory, ...secData.optional]);
  const availableSubjects = allSubjects.filter(s => !assignedIds.has(s.id));

  const updateSection = useCallback((updater: (d: SectionData) => SectionData) => {
    setClasses(prev => prev.map(c => {
      if (c.className !== selectedClass) return c;
      const sec = c.activeSection;
      return {
        ...c,
        saved: false,
        sectionData: { ...c.sectionData, [sec]: updater(c.sectionData[sec]) },
      };
    }));
  }, [selectedClass]);

  const setActiveSection = useCallback((section: string) => {
    setClasses(prev => prev.map(c =>
      c.className === selectedClass ? { ...c, activeSection: section } : c
    ));
  }, [selectedClass]);

  const handleDropToBucket = useCallback((targetBucket: Bucket, subjectId: string, sourceBucket?: Bucket) => {
    updateSection(d => {
      const next = { compulsory: [...d.compulsory], optional: [...d.optional] };
      // Remove from source
      if (sourceBucket) {
        next[sourceBucket] = next[sourceBucket].filter(id => id !== subjectId);
      }
      // Add to target
      if (!next[targetBucket].includes(subjectId)) {
        next[targetBucket].push(subjectId);
      }
      return next;
    });
  }, [updateSection]);

  const handleRemoveFromBucket = useCallback((bucket: Bucket, subjectId: string) => {
    updateSection(d => ({
      ...d,
      [bucket]: d[bucket].filter(id => id !== subjectId),
    }));
  }, [updateSection]);

  const handleSave = useCallback(async () => {
    setSavingClass(selectedClass);
    await new Promise(r => setTimeout(r, 600));
    setClasses(prev => prev.map(c =>
      c.className === selectedClass ? { ...c, saved: true } : c
    ));
    setSavingClass(null);
    toast({ title: `${selectedClass} mapping saved` });
  }, [selectedClass, toast]);

  const applyToAllSections = useCallback(() => {
    setClasses(prev => prev.map(c => {
      if (c.className !== confirmModal.className) return c;
      const source = c.sectionData[c.activeSection];
      const updated: Record<string, SectionData> = {};
      c.sections.forEach(sec => { updated[sec] = { compulsory: [...source.compulsory], optional: [...source.optional] }; });
      return { ...c, sectionData: updated, saved: false };
    }));
    toast({ title: `Applied to all sections of ${confirmModal.className}` });
    setConfirmModal({ open: false, className: '' });
  }, [confirmModal.className, toast]);

  const totalMapped = useMemo(
    () => classes.filter(c => getStatus(c) === 'mapped').length,
    [classes]
  );

  const hasUnsaved = useMemo(
    () => classes.some(c => !c.saved && Object.values(c.sectionData).some(d => d.compulsory.length + d.optional.length > 0)),
    [classes]
  );

  const isSaving = savingClass === selectedClass;
  const status = getStatus(cls);
  const totalAssigned = secData.compulsory.length + secData.optional.length;
  const totalAcross = Object.values(cls.sectionData).reduce((sum, d) => sum + d.compulsory.length + d.optional.length, 0);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Subject Mapping</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Drag subjects into compulsory or optional buckets for each class-section
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <YearContextChip />
          <Badge variant="secondary" className="text-xs gap-1.5 px-3 py-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {totalMapped} / {classes.length} mapped
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() =>
            toast({ title: 'Reconciliation started', description: 'Checking mappings against enrollments…' })
          }>
            <RefreshCw className="w-3.5 h-3.5" />
            Reconcile
          </Button>
        </div>
      </div>

      {hasUnsaved && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          You have unsaved changes. Save before navigating away.
        </div>
      )}

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* Class list */}
        <Card className="card-shadow">
          <CardContent className="p-2">
            <div className="space-y-0.5">
              {classes.map(c => {
                const s = getStatus(c);
                const cfg = statusConfig[s];
                const isActive = c.className === selectedClass;
                return (
                  <button
                    key={c.className}
                    onClick={() => setSelectedClass(c.className)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                      isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/60 text-foreground'
                    )}
                  >
                    <span>{c.className}</span>
                    <span className="flex items-center gap-1.5">
                      <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                      <span className={cn('text-[11px] font-medium', cfg.text)}>{cfg.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mapping panel */}
        <Card className={cn('card-shadow transition-all', !cls.saved && totalAcross > 0 && 'border-warning/40')}>
          <CardContent className="p-5 space-y-5">
            {/* Title + section tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-foreground">{selectedClass}</h3>
                <span className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', statusConfig[status].dot)} />
                  <span className={cn('text-xs font-medium', statusConfig[status].text)}>{statusConfig[status].label}</span>
                </span>
                {!cls.saved && totalAcross > 0 && (
                  <Badge variant="outline" className="text-warning border-warning/40 text-[11px]">Unsaved</Badge>
                )}
              </div>
              <Tabs value={cls.activeSection} onValueChange={setActiveSection}>
                <TabsList className="h-9">
                  {cls.sections.map(sec => {
                    const d = cls.sectionData[sec];
                    const count = d ? d.compulsory.length + d.optional.length : 0;
                    return (
                      <TabsTrigger
                        key={sec}
                        value={sec}
                        className="text-xs px-5 py-2 gap-1.5 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                      >
                        Sec {sec}
                        {count > 0 && (
                          <span className="text-[10px] rounded-full px-1.5 font-bold ml-0.5 data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground bg-teal/15 text-teal">{count}</span>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>

            {/* Available subjects pool */}
            {availableSubjects.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Available Subjects ({availableSubjects.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map(sub => (
                    <SubjectPill key={sub.id} id={sub.id} name={sub.name} />
                  ))}
                </div>
              </div>
            )}

            {/* Two drop-zone buckets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropZone
                bucket="compulsory"
                label="Compulsory"
                subjects={secData.compulsory}
                onDrop={(id, src) => handleDropToBucket('compulsory', id, src)}
                onRemove={(id) => handleRemoveFromBucket('compulsory', id)}
                accentColor="text-teal"
                accentBg="bg-teal/5"
                accentBorder="border-teal/40"
              />
              <DropZone
                bucket="optional"
                label="Optional"
                subjects={secData.optional}
                onDrop={(id, src) => handleDropToBucket('optional', id, src)}
                onRemove={(id) => handleRemoveFromBucket('optional', id)}
                accentColor="text-sky"
                accentBg="bg-sky/5"
                accentBorder="border-sky/40"
              />
            </div>

            {/* Summary + actions */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {totalAssigned} subjects assigned
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmModal({ open: true, className: selectedClass })}
                  className="gap-1.5 text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Apply Sec {cls.activeSection} → All
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || (totalAcross === 0 && !cls.saved)}
                  className="gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MasterDataStepFooter currentStepId="subject-mapping" canProceed={totalMapped > 0} />

      <ConfirmModal
        open={confirmModal.open}
        onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, open }))}
        title="Apply to all sections?"
        description={`This will overwrite all sections in ${confirmModal.className} with Section ${cls.activeSection}'s subjects. This cannot be undone.`}
        confirmLabel="Apply to All"
        variant="destructive"
        onConfirm={applyToAllSections}
      />
    </div>
  );
};

export default SubjectMapping;
