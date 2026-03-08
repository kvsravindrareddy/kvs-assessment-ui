import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../Config';
import './OfflineMode.css';

export default function OfflineMode() {
    const [packageStatus, setPackageStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [networkType, setNetworkType] = useState('Unknown');

    useEffect(() => {
        checkStatus();
        detectNetwork();

        // Listen for online/offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const detectNetwork = () => {
        if (navigator.connection) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType; // 2g, 3g, 4g, slow-2g
            setNetworkType(effectiveType.toUpperCase());
        }
    };

    const checkStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${CONFIG.development.GATEWAY_URL}/v1/offline-mode/status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPackageStatus(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error checking offline status:', error);
            setLoading(false);
        }
    };

    const handleOnline = () => {
        setIsOnline(true);
        autoSync();
    };

    const handleOffline = () => {
        setIsOnline(false);
    };

    const autoSync = async () => {
        if (packageStatus?.pendingAnalytics > 0) {
            await syncAnalytics();
        }
    };

    const generatePackage = async () => {
        try {
            setDownloading(true);
            const token = localStorage.getItem('token');

            // Generate package
            const response = await axios.post(
                `${CONFIG.development.GATEWAY_URL}/v1/offline-mode/generate-package`,
                {
                    gradeLevel: 'GRADE_5', // Get from user profile
                    subjects: ['MATH', 'ENGLISH', 'SCIENCE']
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const packageId = response.data.id;

            // Start download
            await axios.post(
                `${CONFIG.development.GATEWAY_URL}/v1/offline-mode/${packageId}/download`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Poll for progress
            const interval = setInterval(async () => {
                await checkStatus();
                if (packageStatus?.progress === 100) {
                    clearInterval(interval);
                    setDownloading(false);
                    alert('✅ Offline content ready! You can now learn without internet for 3 days.');
                }
            }, 1000);

        } catch (error) {
            console.error('Error generating package:', error);
            setDownloading(false);
            alert('Failed to generate offline package');
        }
    };

    const syncAnalytics = async () => {
        try {
            setSyncing(true);
            const token = localStorage.getItem('token');

            await axios.post(
                `${CONFIG.development.GATEWAY_URL}/v1/offline-mode/sync`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await checkStatus();
            setSyncing(false);
            alert('✅ Your offline progress has been synced!');

        } catch (error) {
            console.error('Error syncing analytics:', error);
            setSyncing(false);
        }
    };

    if (loading) {
        return <div className="offline-loading">Loading offline status...</div>;
    }

    return (
        <div className="offline-mode-container">
            <div className="offline-header">
                <h2>📶 Offline Adaptive Mode</h2>
                <p className="offline-subtitle">Learn anywhere, even without internet!</p>
            </div>

            {/* Network Status */}
            <div className="network-status">
                <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                    <span className="status-dot"></span>
                    <span className="status-text">
                        {isOnline ? '🟢 Online' : '🔴 Offline'} - {networkType} Network
                    </span>
                </div>
            </div>

            {/* India-specific message */}
            <div className="india-message">
                <span className="flag">🇮🇳</span>
                <p>Perfect for rural areas and low-connectivity zones across India!</p>
            </div>

            {/* Package Status */}
            {packageStatus?.status !== 'NO_PACKAGE' ? (
                <div className="package-card">
                    <div className="package-info">
                        <h3>📦 Your Offline Package</h3>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Status:</span>
                                <span className={`value status-${packageStatus.status?.toLowerCase()}`}>
                                    {packageStatus.status}
                                </span>
                            </div>

                            <div className="info-item">
                                <span className="label">Size:</span>
                                <span className="value">{packageStatus.compressedSize}</span>
                            </div>

                            <div className="info-item">
                                <span className="label">Coverage:</span>
                                <span className="value">{packageStatus.daysCovered} days</span>
                            </div>

                            <div className="info-item">
                                <span className="label">Expires:</span>
                                <span className="value">
                                    {new Date(packageStatus.expiresAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Download Progress */}
                        {packageStatus.status === 'DOWNLOADING' && (
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{width: `${packageStatus.progress}%`}}
                                    ></div>
                                </div>
                                <span className="progress-text">{packageStatus.progress}%</span>
                            </div>
                        )}

                        {/* Pending Analytics */}
                        {packageStatus.pendingAnalytics > 0 && (
                            <div className="pending-analytics">
                                <span className="pending-badge">
                                    ⏳ {packageStatus.pendingAnalytics} activities pending sync
                                </span>
                                {isOnline && (
                                    <button
                                        className="sync-btn"
                                        onClick={syncAnalytics}
                                        disabled={syncing}
                                    >
                                        {syncing ? '🔄 Syncing...' : '🔄 Sync Now'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="package-features">
                        <h4>✨ What's included:</h4>
                        <ul>
                            <li>📚 3 days of personalized lessons</li>
                            <li>📝 Practice assessments</li>
                            <li>📖 Reading stories</li>
                            <li>🎮 Educational games</li>
                            <li>🎯 All pre-downloaded & ready!</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="no-package-card">
                    <div className="no-package-icon">📭</div>
                    <h3>No Offline Package Yet</h3>
                    <p>Generate an offline package to learn without internet!</p>

                    <div className="benefits-list">
                        <h4>🚀 Benefits:</h4>
                        <ul>
                            <li>✅ Learn without internet for 3 days</li>
                            <li>✅ AI predicts what you'll need next</li>
                            <li>✅ 65% smaller with smart compression</li>
                            <li>✅ Auto-syncs when internet returns</li>
                            <li>✅ Perfect for rural India 🇮🇳</li>
                        </ul>
                    </div>

                    <button
                        className="generate-btn"
                        onClick={generatePackage}
                        disabled={downloading}
                    >
                        {downloading ? '⏳ Generating...' : '🎯 Generate Offline Package'}
                    </button>

                    <div className="recommendation">
                        <span className="tip-icon">💡</span>
                        <p>Best downloaded on WiFi to save mobile data!</p>
                    </div>
                </div>
            )}

            {/* How it works */}
            <div className="how-it-works">
                <h3>🔍 How it works:</h3>
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <p>AI predicts your next 3 days of learning</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <p>Content compressed by 65% for fast download</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <p>Learn fully offline - no internet needed!</p>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <p>Progress auto-syncs when you're back online</p>
                    </div>
                </div>
            </div>

            {/* Stats for India */}
            <div className="india-stats">
                <h4>📊 Impact in India:</h4>
                <div className="stats-grid">
                    <div className="stat">
                        <span className="stat-number">400M+</span>
                        <span className="stat-label">Students in rural areas</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">2G/3G</span>
                        <span className="stat-label">Common connectivity</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">65%</span>
                        <span className="stat-label">Data savings</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">3 Days</span>
                        <span className="stat-label">Offline learning</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
