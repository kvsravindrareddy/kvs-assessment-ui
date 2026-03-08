import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CONFIG from '../../../Config'; 
import './SystemAnalytics.css';

const SystemAnalytics = () => {
    const [logs, setLogs] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState('');
    const [activeSessions, setActiveSessions] = useState(new Map());
    
    // 🌟 NEW: State for real-time analytics
    const [analyticsData, setAnalyticsData] = useState({
        totalVisits: '0',
        guestUsers: '0',
        registeredUsers: '0',
        subscribedUsers: '0'
    });

    const logsEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        // Fetch analytics on load
        fetchAnalytics();
        // Set up an interval to refresh the top cards every 10 seconds
        const interval = setInterval(fetchAnalytics, 10000);
        return () => {
            stopLogStream();
            clearInterval(interval);
        };
    }, []);

    // 🌟 NEW: Fetch data from Gateway Redis
    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/api/gateway/analytics/overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalyticsData(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        }
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
                        const newLog = {
                            id: Date.now() + Math.random(),
                            timestamp: new Date().toLocaleTimeString(),
                            data: logData
                        };

                        setLogs((prev) => {
                            const updatedLogs = [...prev, newLog];
                            if (updatedLogs.length > 100) return updatedLogs.slice(updatedLogs.length - 100);
                            return updatedLogs;
                        });

                        try {
                            const ipMatch = logData.match(/IP:\s*([^\s|]+)/);
                            const userMatch = logData.match(/User:\s*([^\s|]+)/);
                            
                            if (ipMatch && ipMatch[1]) {
                                const ip = ipMatch[1];
                                const user = userMatch ? userMatch[1] : 'UNKNOWN';

                                setActiveSessions(prevSessions => {
                                    const newMap = new Map(prevSessions);
                                    const existing = newMap.get(ip) || { 
                                        ip, 
                                        user, 
                                        requestCount: 0, 
                                        firstSeen: new Date().toLocaleTimeString() 
                                    };
                                    
                                    newMap.set(ip, {
                                        ...existing,
                                        user: user !== 'GUEST' ? user : existing.user, 
                                        lastSeen: new Date().toLocaleTimeString(),
                                        requestCount: existing.requestCount + 1
                                    });
                                    return newMap;
                                });
                            }
                        } catch (e) {
                            console.error("Failed to parse log", e);
                        }
                    }
                });
            }
        } catch (error) {
            setIsStreaming(false);
        }
    };

    const stopLogStream = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); 
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
    };

    const forceLogout = async (userEmail) => {
        if (!userEmail || userEmail === 'GUEST' || userEmail === 'AUTH_USER') return;
        if (!window.confirm(`⚠️ Kick ${userEmail} from the platform?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            let myEmail = '';
            if (token) myEmail = JSON.parse(atob(token.split('.')[1])).email;

            await axios.post(`${CONFIG.development.GATEWAY_URL}/api/gateway/sessions/logout?email=${encodeURIComponent(userEmail)}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`User ${userEmail} disconnected.`);
            
            if (userEmail === myEmail) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } catch (error) {
            alert('Failed to force logout.');
        }
    };

    return (
        <div className="system-analytics">
            <div className="analytics-header">
                <h3 className="section-title">
                    <span className="title-icon">📈</span>
                    System Analytics & Monitoring
                </h3>
                <span className="live-status-badge">🟢 System Online</span>
            </div>

            {/* 🌟 NEW: Live Real-Time Gateway Analytics */}
            <div className="analytics-grid">
                <div className="analytics-card metric-card">
                    <div className="metric-icon blue">🌐</div>
                    <div className="metric-data">
                        <h4>{analyticsData.totalVisits}</h4>
                        <p>Total Platform Requests</p>
                        <span className="trend positive">↑ Live</span>
                    </div>
                </div>
                <div className="analytics-card metric-card">
                    <div className="metric-icon green">👤</div>
                    <div className="metric-data">
                        <h4>{analyticsData.registeredUsers}</h4>
                        <p>Total Registered Users</p>
                        <span className="trend neutral">Unique IPs</span>
                    </div>
                </div>
                <div className="analytics-card metric-card">
                    <div className="metric-icon purple">⭐</div>
                    <div className="metric-data">
                        <h4>{analyticsData.subscribedUsers}</h4>
                        <p>Premium Subscribers</p>
                        <span className="trend positive">↑ Growing</span>
                    </div>
                </div>
                <div className="analytics-card metric-card">
                    <div className="metric-icon orange">👻</div>
                    <div className="metric-data">
                        <h4>{analyticsData.guestUsers}</h4>
                        <p>Guest Interactions</p>
                        <span className="trend negative">Unregistered</span>
                    </div>
                </div>
            </div>

            {/* Live System Logs Section */}
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

                {/* Active Sessions Table */}
                <div className="active-sessions-panel" style={{marginTop: '20px'}}>
                    <h4>📡 Real-Time Client Intercept</h4>
                    <p>Live extraction of active users traversing the Gateway.</p>
                    <div className="table-responsive">
                        <table className="sessions-table">
                            <thead>
                                <tr>
                                    <th>Origin IP Address</th>
                                    <th>Identity (JWT)</th>
                                    <th>Request Volume</th>
                                    <th>Last Packet Seen</th>
                                    <th>Security Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(activeSessions.values()).length === 0 ? (
                                    <tr><td colSpan="5" className="text-center" style={{padding: '20px'}}>No sessions trapped. Stream is inactive.</td></tr>
                                ) : (
                                    Array.from(activeSessions.values()).sort((a,b) => b.requestCount - a.requestCount).map(session => (
                                        <tr key={session.ip}>
                                            <td className="ip-cell"><code>{session.ip}</code></td>
                                            <td className="user-cell">
                                                {session.user === 'GUEST' ? <span className="badge badge-guest">Anonymous</span> : <span className="badge badge-auth">{session.user}</span>}
                                            </td>
                                            <td><strong>{session.requestCount}</strong> hits</td>
                                            <td>{session.lastSeen}</td>
                                            <td>
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
            </div>
        </div>
    );
};

export default SystemAnalytics;