import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

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

// Landing Page
import LandingPage from './pages/landing/LandingPage';

// Assessment Pages
import GradeSelection from './pages/GradeSelection';
import SubjectSelection from './pages/SubjectSelection';
import AssessmentConfig from './pages/AssessmentConfig';
import AnswerKey from './pages/AnswerKey';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

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
    path: '/*',
    element: <App />
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