import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CONFIG from '../../../Config'; 
import './SystemAnalytics.css';

const SystemAnalytics = () => {
    const [logs, setLogs] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState('');
    
    // 🌟 NEW: State to track live IPs and Sessions
    const [activeSessions, setActiveSessions] = useState(new Map());

    const logsEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        return () => stopLogStream();
    }, []);

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

                        // 🌟 NEW: Parse the log to extract IP and User dynamically!
                        // Format expected: ... | IP: 192.168.1.1 | User: veera@kobs.com
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
                                        user: user !== 'GUEST' ? user : existing.user, // Update guest to real user if they log in
                                        lastSeen: new Date().toLocaleTimeString(),
                                        requestCount: existing.requestCount + 1
                                    });
                                    return newMap;
                                });
                            }
                        } catch (e) {
                            console.error("Failed to parse log for session tracking", e);
                        }
                    }
                });
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Stream failed or disconnected", error);
            }
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

    // 🌟 NEW: Connect to your IPManagementController
    const blockIp = async (ip) => {
        if (!window.confirm(`Are you sure you want to block traffic from IP: ${ip}?`)) return;
        try {
            const token = localStorage.getItem('token');
            // Update this URL to match your actual IPManagementController endpoint
            await axios.post(`${CONFIG.development.GATEWAY_URL}/admin-assessment/api/ip/block`, { ip }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`IP ${ip} has been successfully blocked.`);
        } catch (error) {
            alert('Failed to block IP. Check console.');
        }
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

    const clearLogs = () => setLogs([]);

    return (
        <div className="system-analytics">
            <h3 className="section-title">
                <span className="title-icon">📈</span>
                System Analytics
            </h3>

            {/* Original Analytics Grid */}
            <div className="analytics-grid">
                <div className="analytics-card">
                    <h4>User Growth</h4>
                    <div className="chart-placeholder"><span className="chart-icon">📊</span><p>User registration trends over time</p></div>
                </div>
                <div className="analytics-card">
                    <h4>Assessment Activity</h4>
                    <div className="chart-placeholder"><span className="chart-icon">📝</span><p>Assessments created and completed</p></div>
                </div>
                <div className="analytics-card">
                    <h4>Engagement Metrics</h4>
                    <div className="chart-placeholder"><span className="chart-icon">🎯</span><p>User engagement and activity levels</p></div>
                </div>
                <div className="analytics-card">
                    <h4>Performance Trends</h4>
                    <div className="chart-placeholder"><span className="chart-icon">📈</span><p>Average scores and completion rates</p></div>
                </div>
            </div>

            {/* Live System Logs Section */}
            <div className="live-logs-section">
                <div className="logs-header-bar">
                    <h4>Live System Traffic & Audit Logs</h4>
                    <div className="header-actions">
                        <button className={`stream-btn ${isStreaming ? 'active' : ''}`} onClick={isStreaming ? stopLogStream : startLogStream}>
                            {isStreaming ? '🛑 Stop Stream' : '▶️ Start Live Stream'}
                        </button>
                        <button className="clear-btn" onClick={clearLogs}>🗑️ Clear</button>
                    </div>
                </div>

                {/* Terminal Window */}
                <div className="terminal-window">
                    <div className="terminal-header">
                        <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
                        <span className="terminal-title">admin-server@logs ~ /admin-assessment/api/logs/live</span>
                    </div>
                    <div className="terminal-body">
                        {logs.length === 0 ? (
                            <div className="terminal-empty">Waiting for incoming traffic logs...</div>
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

                {/* 🌟 NEW: Active Sessions & IP Management Table */}
                <div className="active-sessions-panel">
                    <h4>📡 Active Client Sessions (Live Intersect)</h4>
                    <p>Real-time extraction of active users and their IP addresses.</p>
                    
                    <div className="table-responsive">
                        <table className="sessions-table">
                            <thead>
                                <tr>
                                    <th>IP Address</th>
                                    <th>Identified User</th>
                                    <th>Requests</th>
                                    <th>Last Seen</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(activeSessions.values()).length === 0 ? (
                                    <tr><td colSpan="5" className="text-center">No active sessions detected yet. Start the stream to capture IPs.</td></tr>
                                ) : (
                                    Array.from(activeSessions.values()).sort((a,b) => b.requestCount - a.requestCount).map(session => (
                                        <tr key={session.ip}>
                                            <td className="ip-cell"><code>{session.ip}</code></td>
                                            <td className="user-cell">
                                                {session.user === 'GUEST' ? <span className="badge badge-guest">Guest User</span> : <span className="badge badge-auth">{session.user}</span>}
                                            </td>
                                            <td>{session.requestCount}</td>
                                            <td>{session.lastSeen}</td>
                                            <td>
                                                <button onClick={() => blockIp(session.ip)} className="btn-action-block">🚫 Block IP</button>
                                                {session.user !== 'GUEST' && (
                                                    <button onClick={() => alert('Force logout triggered (coming soon)')} className="btn-action-logout">⚠️ Force Logout</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Security Tools Panel */}
                <div className="security-tools-panel">
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