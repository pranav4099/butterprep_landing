import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Eye, Download, FileText, BarChart3, Archive, ClipboardList } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHeader from '@/components/admin/PageHeader';
import SectionCard from '@/components/admin/SectionCard';
import DataPagination from '@/components/admin/DataPagination';
import { usePagination } from '@/hooks/usePagination';

const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];
const satSubjects = ['Mathematics', 'Science', 'English'];

const getGrade = (marks: number): string => {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B+';
  if (marks >= 60) return 'B';
  if (marks >= 50) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
};

const generateStudentData = (subjectList: string[]) => {
  const students = [
    { rollNo: 1, name: 'Aarav Sharma' }, { rollNo: 2, name: 'Aditi Patel' },
    { rollNo: 3, name: 'Arjun Reddy' }, { rollNo: 4, name: 'Diya Gupta' },
    { rollNo: 5, name: 'Ishaan Kumar' }, { rollNo: 6, name: 'Kavya Singh' },
    { rollNo: 7, name: 'Krishna Iyer' }, { rollNo: 8, name: 'Meera Joshi' },
    { rollNo: 9, name: 'Pranav Nair' }, { rollNo: 10, name: 'Riya Verma' },
  ];
  return students.map((s) => ({ ...s, marks: subjectList.map(() => Math.floor(Math.random() * 40) + 60) }));
};

const resultsData = [
  { class: 'Class 10', sections: ['Section A', 'Section B', 'Section C'] },
  { class: 'Class 9', sections: ['Section A', 'Section B'] },
];

const generateCSV = (subjectList: string[], data: ReturnType<typeof generateStudentData>) => {
  const headers = ['Roll No', 'Student Name', ...subjectList, 'Total', '%', 'Grade'];
  const rows = data.map((s) => {
    const total = s.marks.reduce((a, b) => a + b, 0);
    const pct = (total / (subjectList.length * 100)) * 100;
    return [s.rollNo, s.name, ...s.marks, total, pct.toFixed(1), getGrade(pct)].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
};

const Results = () => {
  const [activeTab, setActiveTab] = useState<'sats' | 'overall'>('sats');
  const [expandedClasses, setExpandedClasses] = useState<string[]>(['Class 10']);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [studentData, setStudentData] = useState<ReturnType<typeof generateStudentData>>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentSubjects = activeTab === 'sats' ? satSubjects : subjects;
  const { page, setPage, pageCount, pageItems, rangeLabel } = usePagination(resultsData, 10);

  const toggleClass = (c: string) =>
    setExpandedClasses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handlePreview = (className: string, section: string) => {
    setSelectedClass(className);
    setSelectedSection(section);
    setStudentData(generateStudentData(currentSubjects));
    setPreviewOpen(true);
  };

  const calculateTotal = (marks: number[]) => marks.reduce((a, b) => a + b, 0);
  const calculatePercentage = (marks: number[]) => (calculateTotal(marks) / (currentSubjects.length * 100)) * 100;

  const totalSections = useMemo(() => resultsData.reduce((s, i) => s + i.sections.length, 0), []);

  const handleBulkDownload = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const type = activeTab === 'sats' ? 'SATs' : 'Overall';
      resultsData.forEach((item) => {
        const folder = zip.folder(item.class);
        item.sections.forEach((section) => {
          const data = generateStudentData(currentSubjects);
          folder?.file(`${section}_${type}_Results.csv`, generateCSV(currentSubjects, data));
        });
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${type}_Results_All.zip`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Results & Mark Sheets"
        description="Review and download exam results"
        icon={ClipboardList}
        actions={
          <Button className="gap-2" onClick={handleBulkDownload} disabled={isDownloading}>
            <Archive className="w-4 h-4" />
            {isDownloading ? 'Preparing…' : `Download All (${totalSections} sections)`}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'sats', label: 'SATs Results', icon: FileText },
          { id: 'overall', label: 'Overall Results', icon: BarChart3 },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as 'sats' | 'overall')}
            className={cn(
              'rounded-2xl border bg-card card-shadow p-4 flex items-center justify-center gap-2 transition-all tap-target',
              activeTab === t.id
                ? 'border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary/30'
                : 'text-muted-foreground hover:border-primary/40',
            )}
          >
            <t.icon className="w-5 h-5" />
            {t.label}
          </button>
        ))}
      </div>

      <SectionCard
        title={activeTab === 'sats' ? 'SATs Results Overview' : 'Overall Results Overview'}
        description={rangeLabel}
        footer={<DataPagination page={page} pageCount={pageCount} onChange={setPage} rangeLabel={rangeLabel} />}
      >
        <div className="space-y-2">
          {pageItems.map((item) => (
            <div key={item.class} className="rounded-xl border bg-card overflow-hidden">
              <button
                onClick={() => toggleClass(item.class)}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
              >
                {expandedClasses.includes(item.class)
                  ? <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                <span className="font-medium text-foreground">{item.class}</span>
                <span className="text-sm text-muted-foreground">({item.sections.length} sections)</span>
              </button>

              {expandedClasses.includes(item.class) && (
                <div className="px-4 pb-4 space-y-2 bg-muted/20">
                  {item.sections.map((section) => (
                    <div key={section} className="p-3 md:p-4 rounded-lg border bg-card flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{section}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handlePreview(item.class, section)}>
                          <Eye className="w-4 h-4" /> Preview
                        </Button>
                        <Button size="sm" className="gap-2">
                          <Download className="w-4 h-4" /> Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedClass} - {selectedSection} {activeTab === 'sats' ? 'SATs' : 'Overall'} Results</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-16 text-center">Roll No</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Student Name</TableHead>
                    {currentSubjects.map((s) => (
                      <TableHead key={s} className="font-semibold text-center">
                        <div className="flex flex-col">
                          <span>{s}</span>
                          <span className="text-xs text-muted-foreground font-normal">Marks / Grade</span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-center">Total</TableHead>
                    <TableHead className="font-semibold text-center">%</TableHead>
                    <TableHead className="font-semibold text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.map((st) => {
                    const total = calculateTotal(st.marks);
                    const pct = calculatePercentage(st.marks);
                    const overall = getGrade(pct);
                    return (
                      <TableRow key={st.rollNo} className="hover:bg-muted/30">
                        <TableCell className="text-center font-medium">{st.rollNo}</TableCell>
                        <TableCell className="font-medium">{st.name}</TableCell>
                        {st.marks.map((mark, idx) => (
                          <TableCell key={idx} className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">{mark}</span>
                              <span className={cn(
                                'text-xs px-1.5 py-0.5 rounded',
                                getGrade(mark) === 'A+' || getGrade(mark) === 'A'
                                  ? 'bg-success-light text-success'
                                  : getGrade(mark) === 'F'
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-muted text-muted-foreground',
                              )}>{getGrade(mark)}</span>
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">{total}</TableCell>
                        <TableCell className="text-center font-semibold">{pct.toFixed(1)}%</TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            'px-2 py-1 rounded text-sm font-semibold',
                            overall === 'A+' || overall === 'A'
                              ? 'bg-success-light text-success'
                              : overall === 'F' ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning-light text-warning',
                          )}>{overall}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button className="gap-2"><Download className="w-4 h-4" /> Download Excel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Results;
