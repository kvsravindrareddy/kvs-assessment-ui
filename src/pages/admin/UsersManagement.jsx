import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const UsersManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage students, teachers, and parents</p>
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
