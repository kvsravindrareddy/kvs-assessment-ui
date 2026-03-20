import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import UserProfile from './pages/auth/UserProfile';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// 🎮 NEW GAMES IMPORTS
import MathBalance from './pages/games/MathBalance';
import NextInPattern from './pages/games/cognitive/NextInPattern';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import QuestionManagement from './pages/admin/QuestionManagement';
import StoryManagement from './pages/admin/StoryManagement';
import UsersManagement from './pages/admin/UsersManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import FlashMessageManager from './pages/admin/FlashMessageManager';
import ContentLibrary from './pages/admin/ContentLibrary';
import WorksheetManager from './pages/admin/WorksheetManager';
import FeatureAccessControl from './pages/admin/FeatureAccessControl';
import AboutUs from './pages/admin/AboutUs';
import PrivacyPolicy from './pages/admin/PrivacyPolicy';
import TermsOfService from './pages/admin/TermsOfService';

// Landing Page
import LandingPage from './pages/landing/LandingPage';

// Assessment Pages
import GradeSelection from './pages/GradeSelection';
import SubjectSelection from './pages/SubjectSelection';
import AssessmentConfig from './pages/AssessmentConfig';
import AnswerKey from './pages/AnswerKey';
import AssessmentsHub from './pages/assessments/AssessmentsHub'; // <-- Added Import
import MathByGrade from './pages/assessments/MathByGrade'; // <-- Math By Grade Import
import ChallengeArena from './pages/assessments/ChallengeArena'; // <-- Challenge Arena Import
import LeaderboardView from './pages/assessments/LeaderboardView'; // <-- Leaderboard View Import
import ITLearningHub from './pages/it-learning/ITLearningHub'; // <-- IT Learning Hub Import

// Parent Pages
import ParentMoments from './pages/parent/ParentMoments';

// Protected Route & Dashboard
import ProtectedRoute from './components/ProtectedRoute';
import UnifiedDashboard from './pages/dashboard/UnifiedDashboard';
import SpeedMathChallenge from './pages/assessments/SpeedMathChallenge';
import SubjectAssessments from './pages/assessments/SubjectAssessments';
import StudentGradingDashboard from './pages/student/StudentGradingDashboard';

import ScienceLab from './pages/science/ScienceLab';
import GrammarHub from './pages/language/GrammarHub';
import VocabularyHub from './pages/language/VocabularyHub';

// Old App Content (existing features)
import App from './App';

/**
 * Application Router Configuration
 * Combines new admin dashboard with existing app features
 */
export const router = createBrowserRouter([
  {
    path: '/landing',
    element: <LandingPage />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        {/* WRAPPED UserProfile inside UnifiedDashboard so navigation stays visible! */}
        <UnifiedDashboard>
          <UserProfile />
        </UnifiedDashboard>
      </ProtectedRoute>
    )
  },
  {
    path: '/assessments/speed-math',
    element: (
      <ProtectedRoute>
        <UnifiedDashboard>
          <SpeedMathChallenge />
        </UnifiedDashboard>
      </ProtectedRoute>
    )
  },
  {
    path: '/assessments/subject-assessments',
    element: (
      <ProtectedRoute>
        <UnifiedDashboard>
          <SubjectAssessments />
        </UnifiedDashboard>
      </ProtectedRoute>
    )
  },
  {
    path: '/student/grading-dashboard',
    element: (
      <ProtectedRoute>
        <UnifiedDashboard>
          <StudentGradingDashboard />
        </UnifiedDashboard>
      </ProtectedRoute>
    )
  },
  {
    path: '/reading',
    element: <App /> // Handled by App.js routing
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
    element: (
      <ProtectedRoute>
        <UnifiedDashboard>
          <MathByGrade />
        </UnifiedDashboard>
      </ProtectedRoute>
    )
  },
  {
    path: '/assessments/challenge-arena',
    element: <ChallengeArena />
  },
  {
    path: '/assessments/leaderboard',
    element: (
      <ProtectedRoute>
        <UnifiedDashboard>
          <LeaderboardView />
        </UnifiedDashboard>
      </ProtectedRoute>
    )
  },
  {
    path: '/it-learning-hub',
    element: (
      <ProtectedRoute>
        <UnifiedDashboard>
          <ITLearningHub />
        </UnifiedDashboard>
      </ProtectedRoute>
    )
  },
  {
    path: '/parent/moments',
    element: (
      <ProtectedRoute requiredRole={['PARENT']}>
        <UnifiedDashboard>
          <ParentMoments />
        </UnifiedDashboard>
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'SUPER_ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'questions',
        element: <QuestionManagement />
      },
      {
        path: 'stories',
        element: <StoryManagement />
      },
      {
        path: 'users',
        element: <UsersManagement />
      },
      {
        path: 'analytics',
        element: <Analytics />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'flash-messages',
        element: <FlashMessageManager />
      },
      {
        path: 'feature-access',
        element: <FeatureAccessControl />
      },
      {
        path: 'content-library',
        children: [
          {
            index: true,
            element: <ContentLibrary />
          },
          {
            path: 'worksheets',
            element: <WorksheetManager />
          }
        ]
      }
    ]
  },
  {
    path: '/select-grade',
    element: <GradeSelection />
  },
  {
    path: '/select-subject/:gradeCode',
    element: <SubjectSelection />
  },
  {
    path: '/configure-assessment/:gradeCode/:subjectCode',
    element: <AssessmentConfig />
  },
  {
    path: '/answer-key/:assessmentId',
    element: <AnswerKey />
  },
  {
    path: '/games/math-balance',
    element: <MathBalance />
  },
  {
    path: '/games/next-pattern',
    element: <NextInPattern />
  },
  {
    path: '/about',
    element: <AboutUs />
  },
  {
    path: '/privacy',
    element: <PrivacyPolicy />
  },
  {
    path: '/terms',
    element: <TermsOfService />
  },
  {
    path: '/*',
    element: <App />
  },
  {
    path: '/assessments/science-lab',
    element: <ProtectedRoute><UnifiedDashboard><ScienceLab /></UnifiedDashboard></ProtectedRoute>
  },
  {
    path: '/assessments/grammar-hub',
    element: <ProtectedRoute><UnifiedDashboard><GrammarHub /></UnifiedDashboard></ProtectedRoute>
  },
  {
    path: '/assessments/vocabulary-hub',
    element: <ProtectedRoute><UnifiedDashboard><VocabularyHub /></UnifiedDashboard></ProtectedRoute>
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