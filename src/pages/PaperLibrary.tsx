import React, { useMemo, useState } from 'react';
import { Library, Search, Filter, FileText, GraduationCap, Eye, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/admin/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import DataPagination from '@/components/admin/DataPagination';
import { usePagination } from '@/hooks/usePagination';

interface AnswerSheet {
  id: string;
  studentName: string;
  enrollmentNo: string;
  className: string;
  section: string;
  subject: string;
  examName: string;
}

const generateSheets = (): AnswerSheet[] => {
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];
  const exams = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Ira', 'Prisha', 'Riya', 'Kavya', 'Anika', 'Zara', 'Nisha'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Joshi', 'Verma', 'Mehta', 'Nair'];

  const sheets: AnswerSheet[] = [];
  for (let i = 0; i < 120; i++) {
    sheets.push({
      id: `sheet-${i + 1}`,
      studentName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      enrollmentNo: `EN${String(2024000 + i).padStart(7, '0')}`,
      className: classes[i % classes.length],
      section: sections[i % sections.length],
      subject: subjects[i % subjects.length],
      examName: exams[i % exams.length],
    });
  }
  return sheets;
};

const allSheets = generateSheets();

const PaperLibrary = () => {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');

  const classes = [...new Set(allSheets.map(s => s.className))].sort((a, b) => Number(a) - Number(b));
  const sections = [...new Set(allSheets.map(s => s.section))].sort();
  const subjects = [...new Set(allSheets.map(s => s.subject))].sort();
  const exams = ['FA1', 'FA2', 'SA1', 'FA3', 'FA4', 'SA2'];

  const filtered = useMemo(() => {
    return allSheets.filter(s => {
      if (selectedClass !== 'all' && s.className !== selectedClass) return false;
      if (selectedSection !== 'all' && s.section !== selectedSection) return false;
      if (selectedSubject !== 'all' && s.subject !== selectedSubject) return false;
      if (selectedExam !== 'all' && s.examName !== selectedExam) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.studentName.toLowerCase().includes(q) || s.enrollmentNo.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, selectedClass, selectedSection, selectedSubject, selectedExam]);

  const { page, setPage, pageCount, pageItems, rangeLabel } = usePagination(filtered, 10);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Paper Library"
        description="Access any student's answer sheet across all classes, sections & subjects"
        icon={Library}
      />

      <SectionCard
        title="Find Answer Sheets"
        toolbar={<Filter className="w-4 h-4 text-muted-foreground" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={selectedExam} onValueChange={(v) => { setSelectedExam(v); setPage(1); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Exam" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {exams.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setPage(1); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSection} onValueChange={(v) => { setSelectedSection(v); setPage(1); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Section" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setPage(1); }}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or enrollment number..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Answer Sheets"
        description={rangeLabel}
        footer={<DataPagination page={page} pageCount={pageCount} onChange={setPage} rangeLabel={rangeLabel} />}
      >
        {pageItems.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No answer sheets match your filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pageItems.map(sheet => (
              <div
                key={sheet.id}
                className="rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all px-4 py-3 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">{sheet.studentName}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono shrink-0">
                      {sheet.enrollmentNo}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      Class {sheet.className}-{sheet.section}
                    </span>
                    <span>·</span>
                    <span>{sheet.subject}</span>
                    <span>·</span>
                    <span>{sheet.examName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1">
                    <Eye className="w-3.5 h-3.5" /> View
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default PaperLibrary;
