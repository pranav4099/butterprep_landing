import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { ParentProvider } from "@/contexts/ParentContext";
import { PaperWorkflowProvider } from "@/contexts/PaperWorkflowContext";
import { PaperStudioProvider } from "@/contexts/PaperStudioContext";

// Dashboard Layout
import DashboardLayout from "./components/DashboardLayout";

// Admin Dashboard Pages
import Dashboard from "./pages/Dashboard";
import MasterData from "./pages/MasterData";
import UploadPapers from "./pages/UploadPapers";
import ReScanPapers from "./pages/ReScanPapers";
import QuestionPapers from "./pages/QuestionPapers";
import CreatePaper from "./pages/question-papers/CreatePaper";
import PaperPreview from "./pages/question-papers/PaperPreview";
import AiStudio from "./pages/paper-studio/AiStudio";
import Step1Details from "./pages/paper-studio/Step1Details";
import Step2Pattern from "./pages/paper-studio/Step2Pattern";
import Step3Syllabus from "./pages/paper-studio/Step3Syllabus";
import Step4Preferences from "./pages/paper-studio/Step4Preferences";
import Step5Generate from "./pages/paper-studio/Step5Generate";
import StudioEditor from "./pages/paper-studio/StudioEditor";
import AdminPaperTracking from "./pages/AdminPaperTracking";
import ReviewProgress from "./pages/ReviewProgress";
import Results from "./pages/Results";

import PrintReports from "./pages/PrintReports";
import Insights from "./pages/Insights";
import ReExams from "./pages/ReExams";
import PaperLibrary from "./pages/PaperLibrary";
import ClassInsightsPage from "./pages/insights/ClassInsightsPage";
import BucketStudentsPage from "./pages/insights/BucketStudentsPage";
import TeacherInsightsPage from "./pages/insights/TeacherInsightsPage";
import TeacherAcademicPage from "./pages/insights/teachers/TeacherAcademicPage";
import TeacherFairnessPage from "./pages/insights/teachers/TeacherFairnessPage";
import TeacherWorkloadPage from "./pages/insights/teachers/TeacherWorkloadPage";
import TeacherOutcomesPage from "./pages/insights/teachers/TeacherOutcomesPage";

// Master Data Sub-Pages
import AcademicYear from "./pages/master-data/AcademicYear";
import ClassesAndSections from "./pages/master-data/ClassesAndSections";
import Students from "./pages/master-data/Students";
import Teachers from "./pages/master-data/Teachers";
import Subjects from "./pages/master-data/Subjects";
import SubjectMapping from "./pages/master-data/SubjectMapping";
import StudentEnrollment from "./pages/master-data/StudentEnrollment";
import MarksAndGrading from "./pages/master-data/MarksAndGrading";
import CreateExam from "./pages/master-data/CreateExam";

// Teacher Portal
import TeacherLayout from "./components/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherReview from "./pages/teacher/TeacherReview";
import TeacherPaperReview from "./pages/teacher/TeacherPaperReview";
import TeacherInsights from "./pages/teacher/TeacherInsights";
import RubricManagement from "./pages/teacher/RubricManagement";
import RubricBuilder from "./pages/teacher/RubricBuilder";
import CreateQuickAssessment from "./pages/teacher/CreateQuickAssessment";
import DirectGrading from "./pages/teacher/DirectGrading";
import TeacherQPReviewList from "./pages/teacher/TeacherQPReviewList";
import TeacherQPReview from "./pages/teacher/TeacherQPReview";
import TeacherReports from "./pages/teacher/TeacherReports";
import TeacherCreatePaper from "./pages/question-papers/CreatePaper";
import TeacherPaperPreview from "./pages/question-papers/PaperPreview";
import TeacherPaperSetup from "./pages/teacher/TeacherPaperSetup";
import TeacherQuestionBank from "./pages/teacher/QuestionBank";
import QuestionBankApprovals from "./pages/QuestionBankApprovals";

// Parent Portal
import ParentLayout from "./components/ParentLayout";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentExamHistory from "./pages/parent/ParentExamHistory";
import ParentExamDetail from "./pages/parent/ParentExamDetail";
import ParentSubjectsList from "./pages/parent/ParentSubjectsList";
import ParentAnswerSheet from "./pages/parent/ParentAnswerSheet";
import ParentNotifications from "./pages/parent/ParentNotifications";
import ParentSubjectInsights from "./pages/parent/ParentSubjectInsights";
import ParentAction from "./pages/parent/ParentAction";

import ParentActionSubject from "./pages/parent/ParentActionSubject";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <PaperWorkflowProvider>
        <PaperStudioProvider>
        <ParentProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* No-login build: enter the admin dashboard directly. */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/select-role" element={<Navigate to="/dashboard" replace />} />
              <Route path="/select-year" element={<Navigate to="/dashboard" replace />} />

              {/* Admin Dashboard Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/insights/class/:classNum" element={<ClassInsightsPage />} />
                <Route path="/insights/class/:classNum/bucket/:bucket" element={<BucketStudentsPage />} />
                <Route path="/insights/bucket/:bucket" element={<BucketStudentsPage />} />
                <Route path="/insights/teachers" element={<TeacherInsightsPage />} />
                <Route path="/insights/teachers/academic" element={<TeacherAcademicPage />} />
                <Route path="/insights/teachers/fairness" element={<TeacherFairnessPage />} />
                <Route path="/insights/teachers/workload" element={<TeacherWorkloadPage />} />
                <Route path="/insights/teachers/outcomes" element={<TeacherOutcomesPage />} />
                <Route path="/master-data" element={<MasterData />}>
                  <Route path="academic-year" element={<AcademicYear />} />
                  <Route path="classes" element={<ClassesAndSections />} />
                  <Route path="students" element={<Students />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="subjects" element={<Subjects />} />
                  <Route path="subject-mapping" element={<SubjectMapping />} />
                  <Route path="student-enrollment" element={<StudentEnrollment />} />
                  <Route path="marks-grading" element={<MarksAndGrading />} />
                  <Route path="create-exam" element={<CreateExam />} />
                </Route>
                <Route path="/paper-library" element={<PaperLibrary />} />
                <Route path="/upload-papers" element={<UploadPapers />} />
                <Route path="/re-scan-papers" element={<ReScanPapers />} />
                <Route path="/re-exams" element={<ReExams />} />
                <Route path="/review-progress" element={<ReviewProgress />} />
                <Route path="/results" element={<Results />} />
                <Route path="/print-reports" element={<PrintReports />} />
                {/* LOCKED: Question Papers & Question Bank
                <Route path="/question-papers" element={<QuestionPapers />} />
                <Route path="/question-papers/ai-studio" element={<AiStudio />} />
                <Route path="/question-papers/ai-studio/details" element={<Step1Details />} />
                <Route path="/question-papers/ai-studio/pattern" element={<Step2Pattern />} />
                <Route path="/question-papers/ai-studio/syllabus" element={<Step3Syllabus />} />
                <Route path="/question-papers/ai-studio/preferences" element={<Step4Preferences />} />
                <Route path="/question-papers/ai-studio/generate" element={<Step5Generate />} />
                <Route path="/question-papers/ai-studio/edit/:id" element={<StudioEditor />} />
                <Route path="/question-papers/create" element={<CreatePaper />} />
                <Route path="/question-papers/:id/edit" element={<CreatePaper />} />
                <Route path="/question-papers/:id/preview" element={<PaperPreview />} />
                <Route path="/question-papers/:id/tracking" element={<AdminPaperTracking />} />
                <Route path="/question-bank-approvals" element={<QuestionBankApprovals />} />
                */}
              </Route>

              {/* Teacher Portal Routes */}
              <Route element={<TeacherLayout />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/qp-review" element={<TeacherQPReviewList />} />
                <Route path="/teacher/review" element={<TeacherReview />} />
                <Route path="/teacher/reports" element={<TeacherReports />} />
                <Route path="/teacher/rubrics" element={<RubricManagement />} />
                <Route path="/teacher/rubrics/create" element={<RubricBuilder />} />
                {/* LOCKED: <Route path="/teacher/question-bank" element={<TeacherQuestionBank />} /> */}
                <Route path="/teacher/insights" element={<TeacherInsights />} />
                <Route path="/teacher/quick-assessment/create" element={<CreateQuickAssessment />} />
                {/* LOCKED: <Route path="/teacher/qp-builder/new" element={<TeacherPaperSetup />} /> */}
                <Route path="/teacher/direct-grading/:assessmentId" element={<DirectGrading />} />
              </Route>
              <Route path="/teacher/review/:examId" element={<TeacherPaperReview />} />
              <Route path="/teacher/qp-review/:paperId" element={<TeacherQPReview />} />
              {/* LOCKED: Teacher Paper Builder Routes
              <Route path="/teacher/qp-builder" element={<TeacherCreatePaper />} />
              <Route path="/teacher/qp-builder/:id" element={<TeacherCreatePaper />} />
              <Route path="/teacher/qp-builder/:id/preview" element={<TeacherPaperPreview />} />
              */}

              {/* Parent Portal Routes */}
              <Route path="/parent/login" element={<Navigate to="/parent/dashboard" replace />} />
              <Route path="/parent/select-child" element={<Navigate to="/parent/dashboard" replace />} />
              <Route element={<ParentLayout />}>
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                <Route path="/parent/exams" element={<ParentExamHistory />} />
                <Route path="/parent/exam/:examId" element={<ParentExamDetail />} />
                <Route path="/parent/subjects" element={<ParentSubjectsList />} />
                <Route path="/parent/subject/:subject" element={<ParentSubjectInsights />} />
                <Route path="/parent/notifications" element={<ParentNotifications />} />
                <Route path="/parent/action" element={<ParentAction />} />
                
                <Route path="/parent/action/:examId/:subject" element={<ParentActionSubject />} />
              </Route>
              <Route path="/parent/answer-sheet/:examId" element={<ParentAnswerSheet />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ParentProvider>
        </PaperStudioProvider>
        </PaperWorkflowProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
