import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

/**
 * Subject Bar Chart Component
 *
 * Displays subject-wise performance comparison using Recharts BarChart
 */
const SubjectBarChart = ({ data, title = "Subject-wise Performance" }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <p>No subject data available yet.</p>
        <p style={{ fontSize: '0.85rem' }}>Complete assessments in different subjects!</p>
      </div>
    );
  }

  // Color mapping for different score ranges
  const getBarColor = (score) => {
    if (score >= 90) return '#10b981'; // Green for A+
    if (score >= 80) return '#3b82f6'; // Blue for A
    if (score >= 70) return '#8b5cf6'; // Purple for B+
    if (score >= 60) return '#f59e0b'; // Orange for B
    return '#ef4444'; // Red for below 60
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b' }}>{data.subject}</p>
          <p style={{ margin: '4px 0', color: '#3b82f6', fontSize: '0.9rem' }}>
            Average: <strong>{data.averageScore}%</strong>
          </p>
          {data.letterGrade && (
            <p style={{ margin: '4px 0', color: '#8b5cf6', fontSize: '0.9rem' }}>
              Grade: <strong>{data.letterGrade}</strong>
            </p>
          )}
          {data.totalExams && (
            <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.85rem' }}>
              Exams: {data.totalExams}
            </p>
          )}
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
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="subject"
            stroke="#94a3b8"
            style={{ fontSize: '0.85rem' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '0.85rem' }}
            domain={[0, 100]}
            label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar dataKey="averageScore" name="Average Score" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.averageScore)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubjectBarChart;
