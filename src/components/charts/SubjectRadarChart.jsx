import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * Subject Radar Chart Component
 *
 * Displays multi-dimensional subject performance comparison using Recharts RadarChart
 */
const SubjectRadarChart = ({ data, title = "Subject Performance Comparison" }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <p>No subject data available yet.</p>
        <p style={{ fontSize: '0.85rem' }}>Complete assessments in different subjects!</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1e293b' }}>{payload[0].payload.subject}</p>
          <p style={{ margin: '4px 0', color: '#3b82f6', fontSize: '0.9rem' }}>
            Score: <strong>{payload[0].value}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            style={{ fontSize: '0.85rem', fill: '#64748b' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            style={{ fontSize: '0.75rem', fill: '#94a3b8' }}
          />
          <Radar
            name="Performance"
            dataKey="averageScore"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubjectRadarChart;
