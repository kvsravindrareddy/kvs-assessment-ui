import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getConfig } from '../../Config';
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Admin Dashboard - Overview and Statistics
 */
const Dashboard = () => {
  const config = getConfig();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalStories: 0,
    totalUsers: 0,
    activeAssessments: 0,
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [questionsByCategory, setQuestionsByCategory] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all statistics in parallel
      const [questionsRes, storiesRes] = await Promise.all([
        axios.get(`${config.ADMIN_BASE_URL}/listallquestions`),
        axios.get(`${config.ADMIN_BASE_URL}/listAllStories`)
      ]);

      const questions = questionsRes.data || [];
      const stories = storiesRes.data || [];

      // Calculate statistics
      setStats({
        totalQuestions: questions.length,
        totalStories: stories.length,
        totalUsers: 0, // TODO: Add user API
        activeAssessments: 0, // TODO: Add assessment API
        loading: false
      });

      // Group questions by category
      const categoryMap = {};
      questions.forEach(q => {
        const category = q.category || 'UNCATEGORIZED';
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });

      setQuestionsByCategory(
        Object.entries(categoryMap).map(([category, count]) => ({
          category,
          count
        }))
      );

      // Mock recent activity
      setRecentActivity([
        { id: 1, type: 'question', action: 'created', user: 'Admin', time: '5 mins ago', status: 'success' },
        { id: 2, type: 'story', action: 'updated', user: 'Teacher1', time: '10 mins ago', status: 'success' },
        { id: 3, type: 'user', action: 'approved', user: 'Admin', time: '1 hour ago', status: 'success' },
        { id: 4, type: 'assessment', action: 'completed', user: 'Student1', time: '2 hours ago', status: 'success' },
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm text-green-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-4 rounded-lg`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          icon={QuestionMarkCircleIcon}
          color="text-blue-600"
          bgColor="bg-blue-50"
          trend="+12% this month"
        />
        <StatCard
          title="Total Stories"
          value={stats.totalStories.toLocaleString()}
          icon={BookOpenIcon}
          color="text-green-600"
          bgColor="bg-green-50"
          trend="+8% this month"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={UserGroupIcon}
          color="text-purple-600"
          bgColor="bg-purple-50"
          trend="+20% this month"
        />
        <StatCard
          title="Active Assessments"
          value={stats.activeAssessments.toLocaleString()}
          icon={ChartBarIcon}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Questions by Category</h2>
            <button
              onClick={() => navigate('/admin/questions')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {questionsByCategory.slice(0, 6).map(({ category, count }) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{category.charAt(0)}</span>
                  </div>
                  <span className="font-medium text-gray-700">{category}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-900 font-semibold">{count}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((count / stats.totalQuestions) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <ClockIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'}
                `}>
                  {activity.status === 'success' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.user}</span> {activity.action} a {activity.type}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/questions')}
            className="bg-white text-gray-900 rounded-lg p-4 hover:shadow-lg transition-shadow text-left"
          >
            <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold">Add Questions</h3>
            <p className="text-sm text-gray-600 mt-1">Import or create new questions</p>
          </button>
          <button
            onClick={() => navigate('/admin/stories')}
            className="bg-white text-gray-900 rounded-lg p-4 hover:shadow-lg transition-shadow text-left"
          >
            <BookOpenIcon className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold">Add Stories</h3>
            <p className="text-sm text-gray-600 mt-1">Create new reading stories</p>
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white text-gray-900 rounded-lg p-4 hover:shadow-lg transition-shadow text-left"
          >
            <UserGroupIcon className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold">Manage Users</h3>
            <p className="text-sm text-gray-600 mt-1">Review and approve users</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
