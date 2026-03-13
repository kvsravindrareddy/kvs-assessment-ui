import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

/**
 * Content Library - Main Hub for Questions, Stories, and Worksheets
 * Following the pattern from Dashboard.jsx
 */
const ContentLibrary = () => {
  const navigate = useNavigate();

  console.log('🔥 ContentLibrary component is rendering!');

  const contentCategories = [
    {
      id: 'questions',
      title: 'Questions',
      description: 'Manage assessment questions across all subjects and grades',
      icon: QuestionMarkCircleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100',
      path: '/admin/questions',
      stats: {
        total: '5,000+',
        label: 'Total Questions'
      }
    },
    {
      id: 'stories',
      title: 'Stories',
      description: 'Manage reading stories and comprehension materials',
      icon: BookOpenIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverBg: 'hover:bg-green-100',
      path: '/admin/stories',
      stats: {
        total: '1,200+',
        label: 'Total Stories'
      }
    },
    {
      id: 'worksheets',
      title: 'Worksheets',
      description: 'AI-powered worksheet template management with GPT-4 generation',
      icon: DocumentTextIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverBg: 'hover:bg-indigo-100',
      path: '/admin/content-library/worksheets',
      stats: {
        total: '20+',
        label: 'Categories'
      },
      badge: 'AI-Powered'
    }
  ];

  const CategoryCard = ({ category }) => {
    const Icon = category.icon;

    return (
      <div
        onClick={() => navigate(category.path)}
        className={`
          bg-white rounded-xl shadow-sm p-6 cursor-pointer
          transition-all duration-200 hover:shadow-lg hover:-translate-y-1
          border-2 border-transparent hover:border-gray-200
        `}
      >
        {/* Header with Icon and Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`${category.bgColor} p-4 rounded-lg ${category.hoverBg} transition-colors`}>
            <Icon className={`w-8 h-8 ${category.color}`} />
          </div>
          {category.badge && (
            <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full">
              <SparklesIcon className="w-3 h-3" />
              {category.badge}
            </span>
          )}
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">{category.stats.total}</p>
            <p className="text-xs text-gray-500">{category.stats.label}</p>
          </div>
          <button className={`
            px-4 py-2 rounded-lg font-medium text-sm
            ${category.color} ${category.bgColor}
            transition-colors
          `}>
            Manage →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
            <BookOpenIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Content Library</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Manage all educational content - questions, stories, and AI-powered worksheets
        </p>
      </div>

      {/* Content Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentCategories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Features */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">AI-Powered Features</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">✓</span>
              <span>Worksheet templates generated with GPT-4</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">✓</span>
              <span>Bulk generation for 100+ templates at once</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">✓</span>
              <span>Category-specific configurations for 20+ math topics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">✓</span>
              <span>Client-side PDF generation (zero server load)</span>
            </li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Content Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Questions</span>
              <span className="text-lg font-bold text-blue-600">5,000+</span>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stories</span>
              <span className="text-lg font-bold text-green-600">1,200+</span>
            </div>
            <div className="h-2 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: '60%' }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Worksheet Templates</span>
              <span className="text-lg font-bold text-indigo-600">20+ Categories</span>
            </div>
            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📝</div>
            <h4 className="font-semibold text-gray-900 mb-1">1. Manage Questions</h4>
            <p className="text-sm text-gray-600">Import, create, and organize assessment questions by grade and subject</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📚</div>
            <h4 className="font-semibold text-gray-900 mb-1">2. Add Stories</h4>
            <p className="text-sm text-gray-600">Create reading materials with comprehension questions for all levels</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🤖</div>
            <h4 className="font-semibold text-gray-900 mb-1">3. Generate Worksheets</h4>
            <p className="text-sm text-gray-600">Use AI to create custom worksheet templates with GPT-4 integration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentLibrary;
