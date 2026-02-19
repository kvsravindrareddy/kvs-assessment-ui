import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getConfig } from '../../Config';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

/**
 * Question Management Module
 * Comprehensive interface for managing assessment questions
 */
const QuestionManagement = () => {
  const config = getConfig();

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    category: 'ALL',
    complexity: 'ALL',
    type: 'ALL',
    source: 'ALL'
  });

  // Import Form
  const [importForm, setImportForm] = useState({
    source: 'CHATGPT',
    complexity: 'MEDIUM',
    type: 'JAVA',
    answerType: 'SINGLE',
    category: 'PROFESSIONAL',
    numberOfQuestions: 10
  });

  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);

  // Categories and options
  const categories = ['ALL', 'PROFESSIONAL', 'ACADEMIC', 'TECHNICAL', 'GENERAL'];
  const complexities = ['ALL', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'];
  const types = ['ALL', 'JAVA', 'PYTHON', 'JAVASCRIPT', 'SQL', 'OTHER'];
  const sources = ['ALL', 'CHATGPT', 'GEMINI', 'MANUAL', 'EXCEL'];

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.ADMIN_BASE_URL}/listallquestions`);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'ALL') {
      filtered = filtered.filter(q => q.category === filters.category);
    }

    // Complexity filter
    if (filters.complexity !== 'ALL') {
      filtered = filtered.filter(q => q.complexity === filters.complexity);
    }

    // Type filter
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(q => q.type === filters.type);
    }

    // Source filter
    if (filters.source !== 'ALL') {
      filtered = filtered.filter(q => q.source === filters.source);
    }

    setFilteredQuestions(filtered);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setImporting(true);
    setImportMessage(null);

    try {
      const payload = {
        ...importForm,
        expectedResponseStructure: [
          {
            category: importForm.category,
            complexity: importForm.complexity,
            type: importForm.type,
            isActive: true,
            question: {
              name: "Sample question",
              options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" }
            },
            answer: { type: importForm.answerType, values: ["A"] }
          }
        ]
      };

      await axios.post(`${config.ADMIN_BASE_URL}/loadquestions`, payload);

      setImportMessage({
        type: 'success',
        text: `Successfully imported ${importForm.numberOfQuestions} questions!`
      });

      // Reload questions
      await loadQuestions();

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowImportModal(false);
        setImportMessage(null);
      }, 2000);

    } catch (error) {
      setImportMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to import questions'
      });
    } finally {
      setImporting(false);
    }
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      EASY: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HARD: 'bg-orange-100 text-orange-800',
      EXPERT: 'bg-red-100 text-red-800'
    };
    return colors[complexity] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      PROFESSIONAL: 'bg-blue-100 text-blue-800',
      ACADEMIC: 'bg-purple-100 text-purple-800',
      TECHNICAL: 'bg-indigo-100 text-indigo-800',
      GENERAL: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize assessment questions • {filteredQuestions.length} of {questions.length} questions
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all"
        >
          <CloudArrowUpIcon className="w-5 h-5" />
          <span className="font-medium">Import Questions</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.complexity}
            onChange={(e) => setFilters({ ...filters, complexity: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {complexities.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {(filters.category !== 'ALL' || filters.complexity !== 'ALL' || filters.type !== 'ALL' || searchTerm) && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.category !== 'ALL' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {filters.category}
              </span>
            )}
            {filters.complexity !== 'ALL' && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {filters.complexity}
              </span>
            )}
            {filters.type !== 'ALL' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {filters.type}
              </span>
            )}
            <button
              onClick={() => {
                setFilters({ category: 'ALL', complexity: 'ALL', type: 'ALL', source: 'ALL' });
                setSearchTerm('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complexity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No questions found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium max-w-md truncate">
                        {q.question?.name || 'Untitled Question'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(q.category)}`}>
                        {q.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getComplexityColor(q.complexity)}`}>
                        {q.complexity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{q.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{q.source || 'N/A'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedQuestion(q)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Edit">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Delete">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Import Questions</h2>
              <p className="text-gray-600 mt-1">Configure question import settings</p>
            </div>

            <form onSubmit={handleImport} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <select
                    value={importForm.source}
                    onChange={(e) => setImportForm({ ...importForm, source: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CHATGPT">ChatGPT</option>
                    <option value="GOOGLE">Google/Gemini</option>
                    <option value="MANUAL">Manual</option>
                    <option value="FILE_UPLOAD">File Upload</option>
                    <option value="EXTERNAL_API">External API</option>
                    <option value="DATABASE">Database</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={importForm.numberOfQuestions}
                    onChange={(e) => setImportForm({ ...importForm, numberOfQuestions: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={importForm.category}
                    onChange={(e) => setImportForm({ ...importForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complexity</label>
                  <select
                    value={importForm.complexity}
                    onChange={(e) => setImportForm({ ...importForm, complexity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={importForm.type}
                    onChange={(e) => setImportForm({ ...importForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="JAVA">Java</option>
                    <option value="PYTHON">Python</option>
                    <option value="JAVASCRIPT">JavaScript</option>
                    <option value="SQL">SQL</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Answer Type</label>
                  <select
                    value={importForm.answerType}
                    onChange={(e) => setImportForm({ ...importForm, answerType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SINGLE">Single Choice</option>
                    <option value="MULTIPLE">Multiple Choice</option>
                  </select>
                </div>
              </div>

              {importMessage && (
                <div className={`p-4 rounded-lg ${
                  importMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {importMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-5 h-5" />
                      <span>Import Questions</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Question Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Question:</h3>
                <p className="text-gray-700">{selectedQuestion.question?.name}</p>
              </div>
              {selectedQuestion.question?.options && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Options:</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedQuestion.question.options).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600">{key})</span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedQuestion.category)}`}>
                  {selectedQuestion.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(selectedQuestion.complexity)}`}>
                  {selectedQuestion.complexity}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {selectedQuestion.type}
                </span>
              </div>
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
