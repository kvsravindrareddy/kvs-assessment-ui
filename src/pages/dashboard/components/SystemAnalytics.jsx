import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CONFIG from '../../../Config'; 
import './SystemAnalytics.css';

const SystemAnalytics = () => {
    const [logs, setLogs] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [activeSessions, setActiveSessions] = useState(new Map());
    const [trackingInfo, setTrackingInfo] = useState('');
    
    const [analyticsData, setAnalyticsData] = useState({
        totalVisits: '0', guestUsers: '0', registeredUsers: '0', subscribedUsers: '0'
    });

    const [chartData, setChartData] = useState({
        userGrowthData: [],
        assessmentActivityData: [],
        performanceData: []
    });

    const logsEndRef = useRef(null);
    const abortAnalyticsRef = useRef(null);
    const abortControllerRef = useRef(null);

    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    useEffect(() => {
        startAnalyticsPushStream();
        return () => {
            if (abortAnalyticsRef.current) abortAnalyticsRef.current.abort();
            stopLogStream();
        };
    }, []);

    // 🌟 1. ASYNC SSE STREAM FOR CHARTS & METRICS
    const startAnalyticsPushStream = async () => {
        abortAnalyticsRef.current = new AbortController();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${CONFIG.development.GATEWAY_URL}/api/gateway/analytics/stream`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortAnalyticsRef.current.signal
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
                    if (line.startsWith('data:')) {
                        try {
                            const dataObj = JSON.parse(line.replace('data:', '').trim());
                            if (dataObj.overview) setAnalyticsData(dataObj.overview);
                            if (dataObj.charts) setChartData(dataObj.charts);
                        } catch (e) {
                            console.error('Failed to parse pushed analytics', e);
                        }
                    }
                });
            }
        } catch (error) {
            if (error.name !== 'AbortError') console.error("Analytics stream disconnected", error);
        }
    };

    // 🌟 2. LIVE TRAFFIC PACKET CAPTURE
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

    // 🌟 3. RESTORED SECURITY FEATURES (BLOCK IP, LOGOUT, TRACKING, HONEYPOT)
    const blockIp = async (ip) => {
        if (!window.confirm(`Are you sure you want to block traffic from IP: ${ip}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/admin-assessment/api/ip/block`, { ip }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`IP ${ip} has been successfully blocked.`);
        } catch (error) {
            alert('Failed to block IP. Check console.');
        }
    };

    const forceLogout = async (userEmail) => {
        if (!window.confirm(`⚠️ Disconnect ${userEmail} instantly via Redis?`)) return;
        try {
            const token = localStorage.getItem('token');
            let myEmail = token ? JSON.parse(atob(token.split('.')[1])).email : '';
            await axios.post(`${CONFIG.development.GATEWAY_URL}/api/gateway/sessions/logout?email=${encodeURIComponent(userEmail)}`, {}, { headers: { Authorization: `Bearer ${token}` }});
            alert(`User ${userEmail} blacklisted.`);
            if (userEmail === myEmail) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } catch (error) { alert('Failed to force logout.'); }
    };

    const fetchTrackingInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${CONFIG.development.GATEWAY_URL}/admin-assessment/api/track`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrackingInfo(response.data);
        } catch (error) {
            setTrackingInfo('Error fetching tracking info: ' + error.message);
        }
    };

    const triggerHoneyPotDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${CONFIG.development.GATEWAY_URL}/admin-assessment/api/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'security-report.txt'); 
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to download security file.');
        }
    };

    return (
        <div className="system-analytics">
            <div className="analytics-header">
                <h3 className="section-title"><span className="title-icon">📈</span> System Analytics & Monitoring</h3>
                <span className="live-status-badge">🟢 Async Stream Connected</span>
            </div>

            {/* TOP METRICS */}
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

            {/* LIVE GRAPHS */}
            <div className="charts-container">
                <div className="chart-box">
                    <h4>User Growth (Past 7 Days)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData.userGrowthData}>
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
                        <BarChart data={chartData.assessmentActivityData}>
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
                    <h4>Live System Health: API Latency (ms)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData.performanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="latencyMs" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} name="Latency (ms)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* LIVE LOGS AND SESSIONS */}
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
                
                {/* RESTORED: ACTIVE SESSIONS WITH BLOCK BUTTON */}
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
                                            <td>
                                                <button onClick={() => blockIp(session.ip)} className="btn-action-block">🚫 Block IP</button>
                                                {session.user !== 'GUEST' && session.user !== 'AUTH_USER' && (
                                                    <button onClick={() => forceLogout(session.user)} className="btn-action-logout">⚠️ Kill Session</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RESTORED: SECURITY TOOLS PANEL */}
                <div className="security-tools-panel" style={{marginTop: '20px'}}>
                    <h4>🛡️ Security & Tracking Tools</h4>
                    <div className="tools-grid">
                        <div className="tool-card">
                            <h5>IP Tracker</h5>
                            <p>Perform a reverse DNS lookup to track your current connection IP and Hostname.</p>
                            <button onClick={fetchTrackingInfo} className="tool-btn">Track My Connection</button>
                            {trackingInfo && <div className="tool-result"><code>{trackingInfo}</code></div>}
                        </div>
                        <div className="tool-card honeypot-card">
                            <h5>Threat Analysis / Honeypot</h5>
                            <p>Trigger a file download that executes a background port scan on the client machine.</p>
                            <button onClick={triggerHoneyPotDownload} className="tool-btn danger">Trigger Security Download</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemAnalytics;