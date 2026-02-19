import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getConfig } from '../../Config';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

/**
 * Story Management Module
 */
const StoryManagement = () => {
  const config = getConfig();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const [importForm, setImportForm] = useState({
    numberOfStories: 10,
    category: 'V',
    storyType: 'ENGLISH',
    storyLength: 'MEDIUM',
    source: 'CHATGPT'
  });

  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.ADMIN_BASE_URL}/listAllStories`);
      setStories(response.data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setImporting(true);
    setImportMessage(null);

    try {
      const payload = {
        numberOfStories: importForm.numberOfStories,
        loadAssessmentStoryRequest: {
          isActive: true,
          title: "Sample Story Title",
          storyLength: importForm.storyLength,
          category: importForm.category,
          storyType: importForm.storyType,
          content: "A well-written story appropriate for students...",
          source: importForm.source,
          howManyQuestions: "MCQ",
          questions: [],
          audit: {
            createdBy: "admin",
            updatedBy: "admin"
          }
        }
      };

      await axios.post(`${config.ADMIN_BASE_URL}/loadstories`, payload);

      setImportMessage({
        type: 'success',
        text: `Successfully imported ${importForm.numberOfStories} stories!`
      });

      await loadStories();

      setTimeout(() => {
        setShowImportModal(false);
        setImportMessage(null);
      }, 2000);

    } catch (error) {
      setImportMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to import stories'
      });
    } finally {
      setImporting(false);
    }
  };

  const filteredStories = stories.filter(s =>
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Story Management</h1>
          <p className="text-gray-600 mt-1">
            Manage reading stories • {filteredStories.length} of {stories.length} stories
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
        >
          <CloudArrowUpIcon className="w-5 h-5" />
          <span className="font-medium">Import Stories</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <BookOpenIcon className="w-8 h-8 text-green-600" />
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {story.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{story.title || 'Untitled Story'}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{story.content?.substring(0, 150)}...</p>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-xs text-gray-500">{story.storyType}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedStory(story)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Import Stories</h2>
            </div>
            <form onSubmit={handleImport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Stories</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={importForm.numberOfStories}
                  onChange={(e) => setImportForm({ ...importForm, numberOfStories: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={importForm.category}
                  onChange={(e) => setImportForm({ ...importForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="V">Vowels</option>
                  <option value="C">Consonants</option>
                  <option value="G">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Length</label>
                <select
                  value={importForm.storyLength}
                  onChange={(e) => setImportForm({ ...importForm, storyLength: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="SHORT">Short</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LONG">Long</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={importForm.source}
                  onChange={(e) => setImportForm({ ...importForm, source: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import Stories'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedStory.title}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedStory.content}</p>
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => setSelectedStory(null)}
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

export default StoryManagement;
