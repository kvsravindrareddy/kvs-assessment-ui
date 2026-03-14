import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Performance Line Chart Component
 *
 * Displays score trends over time using Recharts LineChart
 */
const PerformanceLineChart = ({ data, title = "Performance Trend" }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <p>No performance data available yet.</p>
        <p style={{ fontSize: '0.85rem' }}>Complete more assessments to see your progress!</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '0.9rem' }}>
              {entry.name}: <strong>{entry.value}%</strong>
            </p>
          ))}
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
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="week"
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
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="averageScore"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 8 }}
            name="Average Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceLineChart;
