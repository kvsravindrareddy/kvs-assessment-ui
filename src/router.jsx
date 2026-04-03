import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// These are layout/wrapper components used on every route — keep them eager
import ProtectedRoute from './components/ProtectedRoute';
import UnifiedDashboard from './pages/dashboard/UnifiedDashboard';
// Old App Content (existing features) — catch-all, must be eager
import App from './App';

// Lazy-loaded page components — each is split into its own JS chunk
// Auth
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const UserProfile = lazy(() => import('./pages/auth/UserProfile'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// 🎮 Games
const MathBalance = lazy(() => import('./pages/games/MathBalance'));
const NextInPattern = lazy(() => import('./pages/games/cognitive/NextInPattern'));

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const QuestionManagement = lazy(() => import('./pages/admin/QuestionManagement'));
const StoryManagement = lazy(() => import('./pages/admin/StoryManagement'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const FlashMessageManager = lazy(() => import('./pages/admin/FlashMessageManager'));
const ContentLibrary = lazy(() => import('./pages/admin/ContentLibrary'));
const WorksheetManager = lazy(() => import('./pages/admin/WorksheetManager'));
const FeatureAccessControl = lazy(() => import('./pages/admin/FeatureAccessControl'));
const AboutUs = lazy(() => import('./pages/admin/AboutUs'));
const PrivacyPolicy = lazy(() => import('./pages/admin/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/admin/TermsOfService'));
const SpecialtyContentManager = lazy(() => import('./pages/admin/SpecialtyContentManager'));

// Landing Page
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));

// Assessment Pages
const GradeSelection = lazy(() => import('./pages/GradeSelection'));
const SubjectSelection = lazy(() => import('./pages/SubjectSelection'));
const AssessmentConfig = lazy(() => import('./pages/AssessmentConfig'));
const AnswerKey = lazy(() => import('./pages/AnswerKey'));
const MathByGrade = lazy(() => import('./pages/assessments/MathByGrade'));
const ChallengeArena = lazy(() => import('./pages/assessments/ChallengeArena'));
const LeaderboardView = lazy(() => import('./pages/assessments/LeaderboardView'));
const SpeedMathChallenge = lazy(() => import('./pages/assessments/SpeedMathChallenge'));
const SubjectAssessments = lazy(() => import('./pages/assessments/SubjectAssessments'));
const CompetitiveExamHub = lazy(() => import('./pages/assessments/CompetitiveExamHub'));
const CompetitiveAssessmentFlow = lazy(() => import('./pages/assessments/CompetitiveAssessmentFlow'));
const CriticalThinkingHub = lazy(() => import('./pages/assessments/CriticalThinkingHub'));

// IT Learning
const ITLearningHub = lazy(() => import('./pages/it-learning/ITLearningHub'));

// Parent Pages
const ParentMoments = lazy(() => import('./pages/parent/ParentMoments'));

// Student
const StudentGradingDashboard = lazy(() => import('./pages/student/StudentGradingDashboard'));

// Science / Language
const ScienceLab = lazy(() => import('./pages/science/ScienceLab'));
const GrammarHub = lazy(() => import('./pages/language/GrammarHub'));
const VocabularyHub = lazy(() => import('./pages/language/VocabularyHub'));

// Fallback shown while a lazy chunk is loading
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.2rem', color: '#64748b' }}>
    Loading...
  </div>
);

// Wraps an element in a Suspense boundary with the shared PageLoader fallback
const S = (element) => <Suspense fallback={<PageLoader />}>{element}</Suspense>;

/**
 * Application Router Configuration
 * Combines new admin dashboard with existing app features
 */
export const router = createBrowserRouter([
  {
    path: '/competitive-hub',
    element: S(
      <UnifiedDashboard>
        <CompetitiveExamHub />
      </UnifiedDashboard>
    )
  },
  {
    path: '/competitive-assessment/:examId',
    element: S(
      <UnifiedDashboard>
        <CompetitiveAssessmentFlow />
      </UnifiedDashboard>
    )
  },
  {
    path: '/landing',
    element: S(<LandingPage />)
  },
  {
    path: '/login',
    element: S(<Login />)
  },
  {
    path: '/signup',
    element: S(<Signup />)
  },
  {
    path: '/forgot-password',
    element: S(<ForgotPassword />)
  },
  {
    path: '/reset-password',
    element: S(<ResetPassword />)
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        {/* WRAPPED UserProfile inside UnifiedDashboard so navigation stays visible! */}
        {S(
          <UnifiedDashboard>
            <UserProfile />
          </UnifiedDashboard>
        )}
      </ProtectedRoute>
    )
  },
  {
    path: '/assessments/speed-math',
    element: S(
      <UnifiedDashboard>
        <SpeedMathChallenge />
      </UnifiedDashboard>
    )
  },
  {
    path: '/assessments/subject-assessments',
    element: S(
      <UnifiedDashboard>
        <SubjectAssessments />
      </UnifiedDashboard>
    )
  },
  {
    path: '/student/grading-dashboard',
    element: (
      <ProtectedRoute>
        {S(
          <UnifiedDashboard>
            <StudentGradingDashboard />
          </UnifiedDashboard>
        )}
      </ProtectedRoute>
    )
  },
  {
    path: '/reading',
    element: <App /> // Handled by App.js routing
  },
  {
    path: '/stories',
    element: <App /> // NEW: Handled by App.js routing
  },
  {
    path: '/games',
    element: <App /> // Handled by App.js routing
  },
  {
    path: '/assessments',
    element: <App /> // Handled by App.js routing - AssessmentsHub
  },
  {
    path: '/ai-hub',
    element: <App /> // Handled by App.js routing
  },
  {
    path: '/worksheets',
    element: <App /> // Handled by App.js routing - WorksheetsHub
  },
  {
    path: '/assessments/math-by-grade',
    element: S(
      <UnifiedDashboard>
        <MathByGrade />
      </UnifiedDashboard>
    )
  },
  {
    path: '/assessments/challenge-arena',
    element: S(<ChallengeArena />)
  },
  {
    path: '/assessments/leaderboard',
    element: S(
      <UnifiedDashboard>
        <LeaderboardView />
      </UnifiedDashboard>
    )
  },
  {
    path: '/it-learning-hub',
    element: S(
      <UnifiedDashboard>
        <ITLearningHub />
      </UnifiedDashboard>
    )
  },
  {
    path: '/parent/moments',
    element: (
      <ProtectedRoute requiredRole={['PARENT']}>
        {S(
          <UnifiedDashboard>
            <ParentMoments />
          </UnifiedDashboard>
        )}
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
        {S(<AdminLayout />)}
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: S(<Dashboard />)
      },
      {
        path: 'questions',
        element: S(<QuestionManagement />)
      },
      {
        path: 'stories',
        element: S(<StoryManagement />)
      },
      {
        path: 'users',
        element: S(<UsersManagement />)
      },
      {
        path: 'analytics',
        element: S(<Analytics />)
      },
      {
        path: 'settings',
        element: S(<Settings />)
      },
      {
        path: 'flash-messages',
        element: S(<FlashMessageManager />)
      },
      {
        path: 'feature-access',
        element: S(<FeatureAccessControl />)
      },
      {
        path: 'content-library',
        children: [
          {
            index: true,
            element: S(<ContentLibrary />)
          },
          {
            path: 'worksheets',
            element: S(<WorksheetManager />)
          }
        ]
      },
      {
        path: 'specialty-content',
        element: S(<SpecialtyContentManager />)
      }
    ]
  },
  {
    path: '/select-grade',
    element: S(<GradeSelection />)
  },
  {
    path: '/select-subject/:gradeCode',
    element: S(<SubjectSelection />)
  },
  {
    path: '/configure-assessment/:gradeCode/:subjectCode',
    element: S(<AssessmentConfig />)
  },
  {
    path: '/answer-key/:assessmentId',
    element: S(<AnswerKey />)
  },
  {
    path: '/games/math-balance',
    element: S(<MathBalance />)
  },
  {
    path: '/games/next-pattern',
    element: S(<NextInPattern />)
  },
  {
    path: '/about',
    element: S(<AboutUs />)
  },
  {
    path: '/privacy',
    element: S(<PrivacyPolicy />)
  },
  {
    path: '/terms',
    element: S(<TermsOfService />)
  },
  {
    path: '/*',
    element: <App />
  },
  {
    path: '/assessments/science-lab',
    element: S(<UnifiedDashboard><ScienceLab /></UnifiedDashboard>)
  },
  {
    path: '/assessments/grammar-hub',
    element: S(<UnifiedDashboard><GrammarHub /></UnifiedDashboard>)
  },
  {
    path: '/assessments/vocabulary-hub',
    element: S(<UnifiedDashboard><VocabularyHub /></UnifiedDashboard>)
  },
  {
    path: '/assessments/critical-thinking',
    element: S(<UnifiedDashboard><CriticalThinkingHub /></UnifiedDashboard>)
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

export default router;