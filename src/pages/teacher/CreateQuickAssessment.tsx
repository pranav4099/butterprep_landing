import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { masterExams, teacherClasses, teacherSubjects, mockQuickAssessments } from '@/data/quickAssessmentData';
import type { QuickAssessment } from '@/data/quickAssessmentData';

const CreateQuickAssessment = () => {
  const navigate = useNavigate();
  const { selectedExamType } = useAuth();

  const [componentName, setComponentName] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [assessmentType, setAssessmentType] = useState<'oral' | 'practical'>('oral');
  const [assessmentDate, setAssessmentDate] = useState<Date>();
  const [totalMarks, setTotalMarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedExam = masterExams.find(e => e.id === selectedExamType.toLowerCase() || e.exam_name.toLowerCase().startsWith(selectedExamType.toLowerCase()));

  const uniqueClasses = useMemo(() => {
    const seen = new Set<string>();
    return teacherClasses.filter(c => {
      if (seen.has(c.className)) return false;
      seen.add(c.className);
      return true;
    });
  }, []);

  const [selectedClass, setSelectedClass] = useState('');

  const sectionsForClass = useMemo(() => {
    if (!selectedClass) return [];
    return teacherClasses.filter(c => c.className === selectedClass);
  }, [selectedClass]);

  const availableSubjects = useMemo(() => {
    if (!classId) return [];
    return teacherSubjects.filter(s => s.classIds.includes(classId));
  }, [classId]);

  const duplicateWarning = useMemo(() => {
    if (!selectedExam || !classId || !subjectId) return null;
    const existing = mockQuickAssessments.find(
      a => a.master_exam_id === selectedExam.id && a.class_id === classId && a.subject_id === subjectId && a.assessment_type === assessmentType
    );
    if (existing) return `A similar ${assessmentType} assessment already exists for this exam, class, and subject.`;
    return null;
  }, [selectedExam, classId, subjectId, assessmentType]);

  const maxMarksLimit = useMemo(() => {
    if (!componentName || !selectedExam?.components) return null;
    const comp = selectedExam.components.find(c => c.name === componentName);
    return comp?.max_marks || null;
  }, [componentName, selectedExam]);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!classId) e.classId = 'Please select a class and section';
    if (!subjectId) e.subjectId = 'Please select a subject';
    if (!assessmentDate) e.date = 'Please select a date';
    if (!totalMarks || Number(totalMarks) <= 0) e.marks = 'Total marks must be greater than 0';
    if (maxMarksLimit && Number(totalMarks) > maxMarksLimit) e.marks = `Cannot exceed ${maxMarksLimit} marks for this component`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (startGrading: boolean) => {
    if (!validate() || !assessmentDate) return;

    const subject = teacherSubjects.find(s => s.id === subjectId);
    const selectedSection = teacherClasses.find(c => c.id === classId);
    const label = `${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} – ${subject?.name || ''}`;
    const today = format(new Date(), 'yyyy-MM-dd');

    const createdAssessment: QuickAssessment = {
      id: `qa-${Date.now()}`,
      master_exam_id: selectedExam?.id ?? selectedExamType.toLowerCase(),
      class_id: classId,
      className: selectedSection?.className || selectedClass,
      section: selectedSection?.section || '',
      subject_id: subjectId,
      subject: subject?.name || '',
      teacher_id: 't1',
      assessment_type: assessmentType,
      title: `${selectedExamType} ${assessmentType === 'oral' ? 'Oral' : 'Practical'} Assessment`,
      assessment_date: format(assessmentDate, 'yyyy-MM-dd'),
      total_marks: Number(totalMarks),
      instructions: '',
      status: startGrading ? 'active' : 'draft',
      created_at: today,
      updated_at: today,
    };

    toast({
      title: startGrading ? 'Assessment Created' : 'Draft Saved',
      description: startGrading
        ? `${label} has been created. Redirecting to grading...`
        : `${label} has been saved as a draft.`,
    });

    if (startGrading) {
      navigate(`/teacher/direct-grading/${createdAssessment.id}`, {
        state: { createdAssessment },
      });
    } else {
      navigate('/teacher/review?tab=direct');
    }
  };

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Create Quick Assessment</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Create an oral or practical assessment linked to an existing master exam</p>
      </div>

      <Card className="border-0 card-shadow rounded-2xl">
        <CardContent className="p-4 md:p-5 space-y-5">


          {/* Class, Section, Subject */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Class <span className="text-destructive">*</span></Label>
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setClassId(''); setSubjectId(''); }}>
                <SelectTrigger className={cn("rounded-xl", !selectedClass && errors.classId && 'border-destructive')}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {uniqueClasses.map(c => <SelectItem key={c.className} value={c.className}>{c.className}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Section <span className="text-destructive">*</span></Label>
              <Select value={classId} onValueChange={(v) => { setClassId(v); setSubjectId(''); }} disabled={!selectedClass}>
                <SelectTrigger className={cn("rounded-xl", selectedClass && !classId && errors.classId && 'border-destructive')}>
                  <SelectValue placeholder={selectedClass ? 'Select section' : 'Select class first'} />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {sectionsForClass.map(c => <SelectItem key={c.id} value={c.id}>{c.section}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.classId && <p className="text-xs text-destructive">{errors.classId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject <span className="text-destructive">*</span></Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={!classId}>
                <SelectTrigger className={cn("rounded-xl", errors.subjectId && 'border-destructive')}>
                  <SelectValue placeholder={classId ? 'Select subject' : 'Select section first'} />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.subjectId && <p className="text-xs text-destructive">{errors.subjectId}</p>}
            </div>
          </div>

          {/* Assessment Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assessment Type <span className="text-destructive">*</span></Label>
            <div className="flex bg-muted/50 rounded-2xl p-1 gap-1 border border-border/40 w-fit">
              {(['oral', 'practical'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setAssessmentType(type)}
                  className={cn(
                    "px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize",
                    assessmentType === type
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assessment Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl", !assessmentDate && "text-muted-foreground", errors.date && "border-destructive")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {assessmentDate ? format(assessmentDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={assessmentDate} onSelect={setAssessmentDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Marks <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                min={1}
                max={maxMarksLimit || 100}
                value={totalMarks}
                onChange={e => setTotalMarks(e.target.value)}
                placeholder={maxMarksLimit ? `Max ${maxMarksLimit}` : 'e.g. 10'}
                className={cn("rounded-xl", errors.marks && 'border-destructive')}
              />
              {maxMarksLimit && <p className="text-xs text-muted-foreground">Component limit: {maxMarksLimit} marks</p>}
              {errors.marks && <p className="text-xs text-destructive">{errors.marks}</p>}
            </div>
          </div>

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-warning">{duplicateWarning}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="sm:order-1 rounded-xl">Cancel</Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => handleSave(false)} className="sm:order-2 rounded-xl">Save as Draft</Button>
        <Button onClick={() => handleSave(true)} className="sm:order-3 rounded-xl">Create & Start Grading</Button>
      </div>
    </div>
  );
};

export default CreateQuickAssessment;