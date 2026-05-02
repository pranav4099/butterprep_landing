// Step 1 — Paper Details
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaperStudio } from '@/contexts/PaperStudioContext';
import AiStudioLayout from '@/components/paper-studio/AiStudioLayout';
import StepFooter from '@/components/paper-studio/StepFooter';
import AiSuggestionCard from '@/components/paper-studio/AiSuggestionCard';
import { toast } from 'sonner';

const CLASSES = ['Class 6','Class 7','Class 8','Class 9','Class 10'];
const SUBJECTS = ['Mathematics','Science','English','Social Science','Hindi','Kannada'];
const LANGUAGES: { value: string; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'bilingual', label: 'Bilingual (English + Hindi)' },
];
const TEMPLATES = ['School Standard Format', 'CBSE Board Pattern', 'Karnataka Board Pattern', 'Custom'];

const Step1Details = () => {
  const navigate = useNavigate();
  const { state, setDetails } = usePaperStudio();
  const d = state.details;

  return (
    <AiStudioLayout
      currentStep="details"
      onSaveDraft={() => toast.success('Draft saved')}
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Paper Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set the basics. ButterPrep will use this to plan a balanced paper.
          </p>
        </div>

        <AiSuggestionCard>
          Recommended: Use <strong>School Standard Format</strong> for {d.className} {d.subject} {d.examName}.
        </AiSuggestionCard>

        <div className="rounded-2xl border bg-card card-shadow p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Exam Name">
              <Input value={d.examName} onChange={e => setDetails({ examName: e.target.value })} />
            </Field>
            <Field label="Institution Name">
              <Input value={d.institutionName} onChange={e => setDetails({ institutionName: e.target.value })} />
            </Field>
            <Field label="Class">
              <Select value={d.className} onValueChange={v => setDetails({ className: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Subject">
              <Select value={d.subject} onValueChange={v => setDetails({ subject: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SUBJECTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Academic Year">
              <Input value={d.academicYear} onChange={e => setDetails({ academicYear: e.target.value })} />
            </Field>
            <Field label="Date">
              <Input value={d.date} onChange={e => setDetails({ date: e.target.value })} placeholder="DD/MM/YYYY" />
            </Field>
            <Field label="Duration">
              <Input value={d.duration} onChange={e => setDetails({ duration: e.target.value })} />
            </Field>
            <Field label="Max Marks">
              <Input
                type="number"
                value={d.maxMarks}
                onChange={e => setDetails({ maxMarks: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Language / Medium">
              <Select value={d.language} onValueChange={v => setDetails({ language: v as typeof d.language })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Template">
              <Select value={d.template} onValueChange={v => setDetails({ template: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TEMPLATES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <StepFooter
          onBack={() => navigate('/question-papers')}
          backLabel="Cancel"
          onNext={() => navigate('/question-papers/ai-studio/pattern')}
          nextLabel="Next: Paper Pattern"
        />
      </div>
    </AiStudioLayout>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export default Step1Details;
