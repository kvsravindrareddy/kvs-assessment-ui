import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CONFIG from '../../../Config'; 
import './SystemAnalytics.css';

const SystemAnalytics = () => {
    const [logs, setLogs] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeSessions, setActiveSessions] = useState(new Map());
    
    const [analyticsData, setAnalyticsData] = useState({
        totalVisits: '0', guestUsers: '0', registeredUsers: '0', subscribedUsers: '0'
    });

    const logsEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Simulated Historical Data for Charts (In Production, fetch this from a Time-Series DB or Postgres)
    const userGrowthData = [
        { name: 'Mon', users: 4000, subs: 2400 }, { name: 'Tue', users: 5000, subs: 2800 },
        { name: 'Wed', users: 6000, subs: 3200 }, { name: 'Thu', users: 8780, subs: 3908 },
        { name: 'Fri', users: 10900, subs: 4800 }, { name: 'Sat', users: 13900, subs: 5800 },
        { name: 'Sun', users: 14500, subs: 6300 },
    ];

    const assessmentActivityData = [
        { name: 'Week 1', completed: 1200, failed: 100 }, { name: 'Week 2', completed: 2100, failed: 150 },
        { name: 'Week 3', completed: 3400, failed: 300 }, { name: 'Week 4', completed: 5800, failed: 400 },
    ];

    const performanceData = [
        { time: '08:00', latencyMs: 45 }, { time: '09:00', latencyMs: 120 }, // Morning School Rush
        { time: '10:00', latencyMs: 80 }, { time: '11:00', latencyMs: 50 },
        { time: '12:00', latencyMs: 40 }, { time: '13:00', latencyMs: 150 }, // After lunch rush
        { time: '14:00', latencyMs: 60 }
    ];

    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 5000); // Poll Gateway every 5 seconds
        return () => { stopLogStream(); clearInterval(interval); };
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/api/gateway/analytics/overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalyticsData(res.data);
        } catch (error) { console.error("Analytics fetch failed", error); }
    };

    const startLogStream = async () => {
        if (isStreaming) return;
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${CONFIG.development.GATEWAY_URL}/admin-assessment/api/logs/live`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortControllerRef.current.signal
            });
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop(); 

                lines.forEach(line => {
                    if (line.includes('data:')) {
                        const logData = line.replace('data:', '').trim();
                        setLogs((prev) => [...prev, { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), data: logData }].slice(-100));

                        try {
                            const ipMatch = logData.match(/IP:\s*([^\s|]+)/);
                            const userMatch = logData.match(/User:\s*([^\s|]+)/);
                            if (ipMatch && ipMatch[1]) {
                                const ip = ipMatch[1];
                                const user = userMatch ? userMatch[1] : 'UNKNOWN';

                                setActiveSessions(prev => {
                                    const newMap = new Map(prev);
                                    const existing = newMap.get(ip) || { ip, user, requestCount: 0, firstSeen: new Date().toLocaleTimeString() };
                                    newMap.set(ip, { ...existing, user: user !== 'GUEST' ? user : existing.user, lastSeen: new Date().toLocaleTimeString(), requestCount: existing.requestCount + 1 });
                                    return newMap;
                                });
                            }
                        } catch (e) {}
                    }
                });
            }
        } catch (error) { setIsStreaming(false); }
    };

    const stopLogStream = () => {
        if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
        setIsStreaming(false);
    };

    const forceLogout = async (userEmail) => {
        if (!window.confirm(`⚠️ Disconnect ${userEmail} instantly via Redis?`)) return;
        try {
            await axios.post(`${CONFIG.development.GATEWAY_URL}/api/gateway/sessions/logout?email=${encodeURIComponent(userEmail)}`);
            alert(`User ${userEmail} blacklisted.`);
        } catch (error) { alert('Failed to force logout.'); }
    };

    return (
        <div className="system-analytics">
            <div className="analytics-header">
                <h3 className="section-title"><span className="title-icon">📈</span> System Analytics & Monitoring</h3>
                <span className="live-status-badge">🟢 Gateway Connected</span>
            </div>

            {/* LIVE REDIS COUNTERS */}
            <div className="analytics-grid top-metrics">
                <div className="analytics-card metric-card">
                    <div className="metric-icon blue">🌐</div>
                    <div className="metric-data">
                        <h4>{analyticsData.totalVisits}</h4>
                        <p>Total API Requests</p>
                    </div>
                </div>
                <div className="analytics-card metric-card">
                    <div className="metric-icon green">👤</div>
                    <div className="metric-data">
                        <h4>{analyticsData.registeredUsers}</h4>
                        <p>Registered Students</p>
                    </div>
                </div>
                <div className="analytics-card metric-card">
                    <div className="metric-icon purple">⭐</div>
                    <div className="metric-data">
                        <h4>{analyticsData.subscribedUsers}</h4>
                        <p>Premium Schools/Subs</p>
                    </div>
                </div>
                <div className="analytics-card metric-card">
                    <div className="metric-icon orange">👻</div>
                    <div className="metric-data">
                        <h4>{analyticsData.guestUsers}</h4>
                        <p>Anonymous Guests</p>
                    </div>
                </div>
            </div>

            {/* RECHARTS DATA VISUALIZATION */}
            <div className="charts-container">
                <div className="chart-box">
                    <h4>User Growth (30 Days)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={userGrowthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                            <Area type="monotone" dataKey="subs" stroke="#10b981" fillOpacity={0.2} fill="#10b981" name="Subscribers" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-box">
                    <h4>Assessment Completion Volume</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={assessmentActivityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Legend />
                            <Bar dataKey="completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Assessments Passed" />
                            <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Assessments Failed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-box full-width">
                    <h4>System Health: Average API Latency (ms)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="latencyMs" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} name="Latency (ms)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TERMINAL AND SESSIONS */}
            <div className="live-logs-section">
                <div className="logs-header-bar">
                    <h4>Live Network Traffic & Audit Logs</h4>
                    <div className="header-actions">
                        <button className={`stream-btn ${isStreaming ? 'active' : ''}`} onClick={isStreaming ? stopLogStream : startLogStream}>
                            {isStreaming ? '🛑 Stop Capture' : '▶️ Start Packet Capture'}
                        </button>
                        <button className="clear-btn" onClick={() => setLogs([])}>🗑️ Clear</button>
                    </div>
                </div>

                <div className="terminal-window">
                    <div className="terminal-header">
                        <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
                        <span className="terminal-title">admin@kobs-gateway ~ /var/log/traffic</span>
                    </div>
                    <div className="terminal-body">
                        {logs.length === 0 ? (
                            <div className="terminal-empty">Ready. Click 'Start Packet Capture' to view live traffic...</div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="log-entry">
                                    <span className="log-time">[{log.timestamp}]</span>
                                    <span className="log-data">{log.data}</span>
                                </div>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                <div className="active-sessions-panel" style={{marginTop: '20px'}}>
                    <h4>📡 Real-Time Client Intercept</h4>
                    <div className="table-responsive">
                        <table className="sessions-table">
                            <thead>
                                <tr><th>Origin IP Address</th><th>Identity (JWT)</th><th>Request Volume</th><th>Last Packet Seen</th><th>Security Action</th></tr>
                            </thead>
                            <tbody>
                                {Array.from(activeSessions.values()).length === 0 ? (
                                    <tr><td colSpan="5" className="text-center" style={{padding: '20px'}}>No sessions trapped. Stream is inactive.</td></tr>
                                ) : (
                                    Array.from(activeSessions.values()).sort((a,b) => b.requestCount - a.requestCount).map(session => (
                                        <tr key={session.ip}>
                                            <td className="ip-cell"><code>{session.ip}</code></td>
                                            <td className="user-cell">{session.user === 'GUEST' ? <span className="badge badge-guest">Anonymous</span> : <span className="badge badge-auth">{session.user}</span>}</td>
                                            <td><strong>{session.requestCount}</strong> hits</td>
                                            <td>{session.lastSeen}</td>
                                            <td>{session.user !== 'GUEST' && <button onClick={() => forceLogout(session.user)} className="btn-action-logout">⚠️ Kill Session</button>}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemAnalytics;