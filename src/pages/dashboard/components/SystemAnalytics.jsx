import React from 'react';
import './SystemAnalytics.css';

const SystemAnalytics = () => {
  return (
    <div className="system-analytics">
      <h3 className="section-title">
        <span className="title-icon">📈</span>
        System Analytics
      </h3>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>User Growth</h4>
          <div className="chart-placeholder">
            <span className="chart-icon">📊</span>
            <p>User registration trends over time</p>
          </div>
        </div>

        <div className="analytics-card">
          <h4>Assessment Activity</h4>
          <div className="chart-placeholder">
            <span className="chart-icon">📝</span>
            <p>Assessments created and completed</p>
          </div>
        </div>

        <div className="analytics-card">
          <h4>Engagement Metrics</h4>
          <div className="chart-placeholder">
            <span className="chart-icon">🎯</span>
            <p>User engagement and activity levels</p>
          </div>
        </div>

        <div className="analytics-card">
          <h4>Performance Trends</h4>
          <div className="chart-placeholder">
            <span className="chart-icon">📈</span>
            <p>Average scores and completion rates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
