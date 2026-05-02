import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Trash2, BookOpen, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import ConfirmModal from '@/components/enrollment/ConfirmModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { subjectRubricConfigs, type RubricTemplate } from '@/data/rubricData';

const classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

interface SelectedCriterion {
  name: string;
  condition: string;
}

const RubricBuilder = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<RubricTemplate | null>(null);
  const [criteria, setCriteria] = useState<SelectedCriterion[]>([]);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [customCriterion, setCustomCriterion] = useState('');

  const subjectConfig = useMemo(
    () => subjectRubricConfigs.find(c => c.subject === selectedSubject),
    [selectedSubject]
  );

  const subjectOptions = subjectRubricConfigs.map(c => c.subject);

  const handleSelectTemplate = (template: RubricTemplate) => {
    setSelectedTemplate(template);
    setCriteria(template.criteria.map(c => ({ name: c, condition: '' })));
  };

  const handleToggleCriterion = (name: string) => {
    setCriteria(prev => {
      const exists = prev.find(c => c.name === name);
      if (exists) return prev.filter(c => c.name !== name);
      return [...prev, { name, condition: '' }];
    });
    setSelectedTemplate(null);
  };

  const handleAddCustom = () => {
    if (!customCriterion.trim()) return;
    setCriteria(prev => [...prev, { name: customCriterion.trim(), condition: '' }]);
    setCustomCriterion('');
    setSelectedTemplate(null);
  };

  const updateCondition = (index: number, condition: string) => {
    setCriteria(prev => prev.map((c, i) => i === index ? { ...c, condition } : c));
  };

  const removeCriterion = (index: number) => {
    setCriteria(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setSaveConfirmOpen(false);
    toast({ title: 'Rubric Assigned', description: `${criteria.length} criteria assigned to ${selectedClass} · ${selectedSubject}` });
    navigate('/teacher/rubrics');
  };

  const isCriterionSelected = (name: string) => criteria.some(c => c.name === name);
  const ready = selectedClass && selectedSubject && subjectConfig;

  const [mobileTab, setMobileTab] = useState<'select' | 'assigned'>('select');

  /* Shared criterion row renderer */
  const renderCriterionRow = (c: SelectedCriterion, i: number, mobile?: boolean) => (
    <div key={`${c.name}-${i}`} className={cn("px-4 space-y-1.5", mobile ? "py-3" : "py-2.5")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground truncate flex-1">{c.name}</span>
        <Button variant="ghost" size="icon" onClick={() => removeCriterion(i)}
          className={cn("text-muted-foreground hover:text-destructive shrink-0", mobile ? "h-7 w-7" : "h-6 w-6")}>
          <Trash2 className={cn(mobile ? "w-3.5 h-3.5" : "w-3 h-3")} />
        </Button>
      </div>
      <Textarea
        value={c.condition}
        onChange={e => updateCondition(i, e.target.value)}
        placeholder="e.g. Must show all working steps and arrive at correct answer"
        className="text-[11px] min-h-[36px] h-9 resize-none"
      />
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-1 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/teacher/rubrics')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Assign Rubric</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Choose a template or build custom criteria for a class & subject</p>
          </div>
        </div>
      </div>

      {/* Selectors row */}
      <div className="flex items-center gap-3 px-1 pb-3 shrink-0">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium flex-1 min-w-0">
          <option value="">Select Class</option>
          {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setCriteria([]); setSelectedTemplate(null); }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium flex-1 min-w-0"
          disabled={!selectedClass}>
          <option value="">Select Subject</option>
          {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Main content area */}
      {!ready ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Select a class and subject to begin</h3>
            <p className="text-sm text-muted-foreground">Templates and criteria will appear based on your selection.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile tab switcher */}
          <div className="md:hidden flex px-1 pb-3 gap-2 shrink-0">
            <button
              onClick={() => setMobileTab('select')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors",
                mobileTab === 'select'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              Select Criteria
            </button>
            <button
              onClick={() => setMobileTab('assigned')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors relative",
                mobileTab === 'assigned'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              Assigned{criteria.length > 0 && ` (${criteria.length})`}
            </button>
          </div>

          {/* Desktop: side-by-side */}
          <div className="flex-1 hidden md:grid grid-cols-[1fr_1fr] gap-4 min-h-0 pb-3 px-1">
            {/* LEFT: Criteria picker */}
            <div className="rounded-xl border border-border bg-card flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border shrink-0">
                <h2 className="text-sm font-semibold text-foreground">Select Criteria</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tap to toggle. Selected criteria appear on the right.</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {subjectConfig!.commonCriteria.map(c => {
                      const selected = isCriterionSelected(c);
                      return (
                        <button key={c} onClick={() => handleToggleCriterion(c)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          )}>
                          {selected && <Check className="w-3 h-3 inline mr-1" />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Input value={customCriterion} onChange={e => setCustomCriterion(e.target.value)}
                      placeholder="Add custom criterion…" className="text-xs h-8 flex-1"
                      onKeyDown={e => e.key === 'Enter' && handleAddCustom()} />
                    <Button variant="outline" size="sm" onClick={handleAddCustom} disabled={!customCriterion.trim()} className="h-8 gap-1 text-xs">
                      <Plus className="w-3 h-3" /> Add
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* RIGHT: Assigned criteria */}
            <div className="rounded-xl border border-border bg-card flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Assigned Criteria</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Add a scoring note for each criterion</p>
                  </div>
                  {criteria.length > 0 && (
                    <span className="text-xs text-muted-foreground">{criteria.length} criteria</span>
                  )}
                </div>
              </div>

              {criteria.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <p className="text-sm text-muted-foreground text-center">Select criteria from the left panel or pick a template above</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1">
                    <div className="divide-y divide-border">
                      {criteria.map((c, i) => renderCriterionRow(c, i))}
                    </div>
                  </ScrollArea>

                  <div className="px-4 py-3 border-t border-border shrink-0 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{selectedClass}</span>
                        <span>·</span>
                        <span>{selectedSubject}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/teacher/rubrics')} className="h-8">Cancel</Button>
                        <Button size="sm" onClick={() => setSaveConfirmOpen(true)} className="h-8 gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Save & Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile: single panel with tabs */}
          <div className="flex-1 md:hidden flex flex-col min-h-0 px-1 pb-3">
            {mobileTab === 'select' ? (
              <div className="rounded-xl border border-border bg-card flex flex-col flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {subjectConfig!.commonCriteria.map(c => {
                        const selected = isCriterionSelected(c);
                        return (
                          <button key={c} onClick={() => handleToggleCriterion(c)}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                              selected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground"
                            )}>
                            {selected && <Check className="w-3 h-3 inline mr-1" />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Input value={customCriterion} onChange={e => setCustomCriterion(e.target.value)}
                        placeholder="Add custom criterion…" className="text-xs h-9 flex-1"
                        onKeyDown={e => e.key === 'Enter' && handleAddCustom()} />
                      <Button variant="outline" size="sm" onClick={handleAddCustom} disabled={!customCriterion.trim()} className="h-9 gap-1 text-xs">
                        <Plus className="w-3 h-3" /> Add
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
                {criteria.length > 0 && (
                  <div className="px-4 py-3 border-t border-border shrink-0 bg-muted/20">
                    <Button className="w-full gap-1.5" onClick={() => setMobileTab('assigned')}>
                      Review {criteria.length} criteria →
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card flex flex-col flex-1 min-h-0 overflow-hidden">
                {criteria.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">No criteria selected yet</p>
                      <Button variant="outline" size="sm" onClick={() => setMobileTab('select')}>
                        ← Select Criteria
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1">
                      <div className="divide-y divide-border">
                        {criteria.map((c, i) => renderCriterionRow(c, i, true))}
                      </div>
                    </ScrollArea>

                    <div className="px-4 py-3 border-t border-border shrink-0 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{selectedClass} · {selectedSubject}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/teacher/rubrics')} className="h-9 flex-1">Cancel</Button>
                        <Button size="sm" onClick={() => setSaveConfirmOpen(true)} className="h-9 flex-1 gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Save & Assign
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmModal
        open={saveConfirmOpen}
        onOpenChange={setSaveConfirmOpen}
        title="Save & Assign Rubric?"
        description={`${criteria.length} criteria will be assigned to ${selectedClass} · ${selectedSubject}. You can edit this later.`}
        confirmLabel="Save & Assign"
        onConfirm={handleSave}
      />
    </div>
  );
};

export default RubricBuilder;
