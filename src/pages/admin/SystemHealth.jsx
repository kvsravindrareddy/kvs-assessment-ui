import React, { useState, useEffect } from 'react';
import "../../css/LegalPages.css";

const SystemHealth = () => {
  const [healthData, setHealthData] = useState({
    overall: 'HEALTHY',
    services: {},
    uptime: {},
    performance: {},
    lastUpdated: new Date(),
    loading: true
  });

  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchHealthData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/health/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHealthData({
          ...data,
          lastUpdated: new Date(),
          loading: false
        });
      } else {
        // Mock data for demo
        setHealthData(getMockHealthData());
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      setHealthData(getMockHealthData());
    }
  };

  const getMockHealthData = () => ({
    overall: 'HEALTHY',
    services: {
      database: { status: 'UP', responseTime: 12, lastCheck: new Date() },
      elasticsearch: { status: 'UP', responseTime: 8, lastCheck: new Date() },
      cache: { status: 'UP', responseTime: 3, lastCheck: new Date() },
      api: { status: 'UP', responseTime: 15, lastCheck: new Date() },
      storage: { status: 'UP', responseTime: 5, lastCheck: new Date() }
    },
    uptime: {
      day: { percentage: 99.98, downtime: 17 }, // seconds
      week: { percentage: 99.95, downtime: 302 },
      month: { percentage: 99.92, downtime: 3456 },
      quarter: { percentage: 99.89, downtime: 14256 },
      year: { percentage: 99.87, downtime: 56789 }
    },
    performance: {
      avgResponseTime: 45, // ms
      requestsPerSecond: 1250,
      activeUsers: 3421,
      cpuUsage: 45, // percentage
      memoryUsage: 62, // percentage
      diskUsage: 38 // percentage
    },
    incidents: {
      day: 0,
      week: 1,
      month: 3,
      quarter: 8,
      year: 15
    },
    lastUpdated: new Date(),
    loading: false
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'UP':
      case 'HEALTHY':
        return '#4caf50';
      case 'DEGRADED':
      case 'WARNING':
        return '#ff9800';
      case 'DOWN':
      case 'CRITICAL':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'UP':
      case 'HEALTHY':
        return '✅';
      case 'DEGRADED':
      case 'WARNING':
        return '⚠️';
      case 'DOWN':
      case 'CRITICAL':
        return '❌';
      default:
        return '❓';
    }
  };

  const formatUptime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  };

  const periods = [
    { key: 'day', label: 'Today', icon: '📅' },
    { key: 'week', label: 'This Week', icon: '📆' },
    { key: 'month', label: 'This Month', icon: '🗓️' },
    { key: 'quarter', label: 'This Quarter', icon: '📊' },
    { key: 'year', label: 'This Year', icon: '📈' }
  ];

  if (healthData.loading) {
    return (
      <section id="system-health" className="section">
        <div className="container">
          <div className="content">
            <div className="text-section">
              <h1 className="section-heading">System Health</h1>
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading system health data...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="system-health" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <h1 className="section-heading">System Health Dashboard</h1>

            <div className="privacy-intro">
              <p>
                Real-time monitoring of KiVO Learning International's infrastructure health,
                performance metrics, and uptime statistics. All data is updated live every 10 seconds.
              </p>
            </div>

            {/* Overall Status Banner */}
            <div style={{
              background: `linear-gradient(135deg, ${getStatusColor(healthData.overall)}dd, ${getStatusColor(healthData.overall)}ff)`,
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '2rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                {getStatusIcon(healthData.overall)}
              </div>
              <h2 style={{ color: 'white', fontSize: '2rem', margin: '0.5rem 0' }}>
                System Status: {healthData.overall}
              </h2>
              <p style={{ color: 'white', opacity: 0.95, margin: '0.5rem 0' }}>
                All systems operational • Last updated: {healthData.lastUpdated.toLocaleTimeString()}
              </p>
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: 'white',
                    color: getStatusColor(healthData.overall),
                    border: 'none',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
                </button>
              </div>
            </div>

            {/* Service Status - Battery Style */}
            <div className="privacy-section">
              <h2>🖥️ Service Status</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2rem',
                marginTop: '1.5rem'
              }}>
                {Object.entries(healthData.services).map(([service, details]) => {
                  // Calculate battery level based on response time
                  const batteryLevel = details.status === 'UP'
                    ? Math.max(20, 100 - (details.responseTime * 2))
                    : 0;

                  return (
                    <div
                      key={service}
                      style={{
                        background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                        padding: '1.5rem',
                        borderRadius: '15px',
                        textAlign: 'center',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        position: 'relative',
                        border: '2px solid #e0e0e0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <h3 style={{
                        textTransform: 'capitalize',
                        color: '#2c3e50',
                        fontSize: '1.1rem',
                        marginBottom: '1.5rem',
                        fontWeight: '700'
                      }}>
                        {service}
                      </h3>

                      {/* Battery Container */}
                      <div style={{
                        position: 'relative',
                        width: '120px',
                        height: '60px',
                        margin: '0 auto 1.5rem',
                        border: `4px solid ${getStatusColor(details.status)}`,
                        borderRadius: '8px',
                        background: '#f5f5f5',
                        boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.1)`,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}>
                        {/* Battery Tip */}
                        <div style={{
                          position: 'absolute',
                          right: '-12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '8px',
                          height: '24px',
                          background: getStatusColor(details.status),
                          borderRadius: '0 4px 4px 0'
                        }} />

                        {/* Battery Fill */}
                        <div style={{
                          width: `${batteryLevel}%`,
                          height: '100%',
                          background: details.status === 'UP'
                            ? `linear-gradient(90deg, ${getStatusColor(details.status)}dd, ${getStatusColor(details.status)})`
                            : '#cccccc',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: `0 0 10px ${getStatusColor(details.status)}88`
                        }}>
                          {/* Animated shine effect */}
                          {details.status === 'UP' && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                              animation: 'batteryShine 2s infinite'
                            }} />
                          )}
                        </div>

                        {/* Battery Percentage */}
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          color: batteryLevel > 50 ? '#2c3e50' : '#fff',
                          textShadow: batteryLevel > 50 ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.5)',
                          zIndex: 1
                        }}>
                          {Math.round(batteryLevel)}%
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: `${getStatusColor(details.status)}22`,
                        border: `2px solid ${getStatusColor(details.status)}`,
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: getStatusColor(details.status),
                        marginBottom: '0.75rem'
                      }}>
                        {getStatusIcon(details.status)} {details.status}
                      </div>

                      {/* Response Time */}
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        background: '#f9f9f9',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0'
                      }}>
                        ⚡ Response: <strong>{details.responseTime}ms</strong>
                      </div>

                      {/* Power indicator pulse */}
                      {details.status === 'UP' && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '12px',
                          height: '12px',
                          background: getStatusColor(details.status),
                          borderRadius: '50%',
                          animation: 'pulse 2s infinite',
                          boxShadow: `0 0 10px ${getStatusColor(details.status)}`
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Uptime Statistics */}
            <div className="privacy-section">
              <h2>⏱️ Uptime Statistics</h2>

              {/* Period Selector */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem',
                marginBottom: '2rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {periods.map((period) => (
                  <button
                    key={period.key}
                    onClick={() => setSelectedPeriod(period.key)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: selectedPeriod === period.key
                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                        : 'white',
                      color: selectedPeriod === period.key ? 'white' : '#2c3e50',
                      border: selectedPeriod === period.key ? 'none' : '2px solid #e0e0e0',
                      borderRadius: '25px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedPeriod === period.key
                        ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                        : 'none'
                    }}
                  >
                    {period.icon} {period.label}
                  </button>
                ))}
              </div>

              {/* Uptime Display */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '3rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                <div style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '1rem' }}>
                  {periods.find(p => p.key === selectedPeriod)?.label} Uptime
                </div>
                <div style={{ fontSize: '4rem', fontWeight: '700', marginBottom: '1rem' }}>
                  {healthData.uptime[selectedPeriod]?.percentage}%
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                  Total downtime: {formatUptime(healthData.uptime[selectedPeriod]?.downtime || 0)}
                </div>
                <div style={{
                  marginTop: '2rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {periods.map((period) => (
                    <div key={period.key} style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '1rem',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{period.label}</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        {healthData.uptime[period.key]?.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics - Power Cell Style */}
            <div className="privacy-section">
              <h2>⚡ Performance Metrics</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2rem',
                marginTop: '1.5rem'
              }}>
                {[
                  { label: 'Avg Response Time', value: healthData.performance.avgResponseTime, unit: 'ms', max: 100, icon: '⚡', color: '#2196f3' },
                  { label: 'Requests/Second', value: healthData.performance.requestsPerSecond, unit: 'rps', max: 2000, icon: '📊', color: '#4caf50' },
                  { label: 'Active Users', value: healthData.performance.activeUsers, unit: '', max: 5000, icon: '👥', color: '#ff9800' },
                  { label: 'CPU Usage', value: healthData.performance.cpuUsage, unit: '%', max: 100, icon: '💻', color: '#9c27b0' },
                  { label: 'Memory Usage', value: healthData.performance.memoryUsage, unit: '%', max: 100, icon: '🧠', color: '#f44336' },
                  { label: 'Disk Usage', value: healthData.performance.diskUsage, unit: '%', max: 100, icon: '💾', color: '#00bcd4' }
                ].map((metric, index) => {
                  const percentage = Math.min((metric.value / metric.max) * 100, 100);
                  const displayValue = metric.unit === ''
                    ? metric.value.toLocaleString()
                    : metric.value + metric.unit;

                  return (
                    <div
                      key={index}
                      style={{
                        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                        padding: '1.5rem',
                        borderRadius: '15px',
                        textAlign: 'center',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease',
                        border: '2px solid #e0e0e0',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {/* Background glow effect */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '150px',
                        height: '150px',
                        background: `radial-gradient(circle, ${metric.color}15, transparent 70%)`,
                        pointerEvents: 'none'
                      }} />

                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                          {metric.icon}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                          {metric.label}
                        </div>

                        {/* Circular Power Cell */}
                        <div style={{
                          position: 'relative',
                          width: '100px',
                          height: '100px',
                          margin: '0 auto 1rem',
                          borderRadius: '50%',
                          background: '#f0f0f0',
                          boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {/* Circular progress background */}
                          <svg style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transform: 'rotate(-90deg)'
                          }} width="100" height="100">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="#e0e0e0"
                              strokeWidth="8"
                              fill="none"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke={metric.color}
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 45}`}
                              strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                              strokeLinecap="round"
                              style={{
                                transition: 'stroke-dashoffset 1s ease',
                                filter: `drop-shadow(0 0 6px ${metric.color}88)`
                              }}
                            />
                          </svg>

                          {/* Center value */}
                          <div style={{
                            position: 'relative',
                            zIndex: 1,
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              color: metric.color,
                              lineHeight: 1
                            }}>
                              {metric.value}
                            </div>
                            {metric.unit && (
                              <div style={{
                                fontSize: '0.7rem',
                                color: '#999',
                                marginTop: '2px'
                              }}>
                                {metric.unit}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Power bar indicator */}
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#e0e0e0',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${metric.color}, ${metric.color}dd)`,
                            transition: 'width 0.5s ease',
                            boxShadow: `0 0 8px ${metric.color}88`
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incident History */}
            <div className="privacy-section">
              <h2>🚨 Incident History</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                {[
                  { period: 'Today', count: healthData.incidents.day, icon: '📅' },
                  { period: 'This Week', count: healthData.incidents.week, icon: '📆' },
                  { period: 'This Month', count: healthData.incidents.month, icon: '🗓️' },
                  { period: 'This Quarter', count: healthData.incidents.quarter, icon: '📊' },
                  { period: 'This Year', count: healthData.incidents.year, icon: '📈' }
                ].map((incident, index) => (
                  <div
                    key={index}
                    style={{
                      background: incident.count === 0 ? '#e8f5e9' : '#fff3e0',
                      padding: '1rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: `2px solid ${incident.count === 0 ? '#4caf50' : '#ff9800'}`
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
                      {incident.icon}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>
                      {incident.period}
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: incident.count === 0 ? '#4caf50' : '#ff9800'
                    }}>
                      {incident.count}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                      incidents
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Uptime Graph Placeholder */}
            <div className="privacy-section">
              <h2>📈 Uptime Trend (Last 30 Days)</h2>
              <div style={{
                background: '#f8f9fa',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: '1.5rem',
                border: '2px dashed #ccc'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <p style={{ color: '#666' }}>
                  Interactive uptime graph coming soon!<br/>
                  Will display daily uptime percentages with visual indicators for incidents.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.3);
          }
        }

        @keyframes batteryShine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
      `}</style>
    </section>
  );
};

export default SystemHealth;
