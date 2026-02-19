import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">View performance metrics and generate reports</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">Analytics dashboard will be available here</p>
      </div>
    </div>
  );
};

export default Analytics;
