import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const UsersManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage students, teachers, and parents</p>
      </div>

      {/* Quick Access to Permissions */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Need to give users elevated access?</h3>
            <p className="text-purple-100">Control feature permissions and access levels for all users</p>
          </div>
          <button
            onClick={() => navigate('/admin/feature-access')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Access Control & Permissions</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">User management features will be available here</p>
      </div>
    </div>
  );
};

export default UsersManagement;
