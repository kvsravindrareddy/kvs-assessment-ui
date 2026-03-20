import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('AI_CONFIG');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const providers = ['OPENAI', 'GEMINI', 'CLAUDE'];
  const [selectedProvider, setSelectedProvider] = useState('OPENAI');
  
  const [aiConfig, setAiConfig] = useState({
    providerName: 'OPENAI',
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4',
    visionModel: 'gpt-4o',
    gradingTemperature: 0.2,
    gradingMaxTokens: 4096,
    timeoutSeconds: 90,
    retryAttempts: 3,
    retryBackoffMs: 2000,
    isActive: true
  });

  useEffect(() => {
    fetchAiConfigs();
  }, [selectedProvider]);

  const fetchAiConfigs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/admin/settings/ai`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const configs = response.data;
      const currentConfig = configs.find(c => c.providerName === selectedProvider);
      
      if (currentConfig) {
        setAiConfig(currentConfig);
      } else {
        setAiConfig({
          providerName: selectedProvider,
          apiKey: '',
          apiUrl: selectedProvider === 'OPENAI' ? 'https://api.openai.com/v1/chat/completions' : '',
          defaultModel: '',
          visionModel: '',
          gradingTemperature: 0.2,
          gradingMaxTokens: 4096,
          timeoutSeconds: 90,
          retryAttempts: 3,
          retryBackoffMs: 2000,
          isActive: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch AI configs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/admin/settings/ai`,
        aiConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: `[SYSTEM UPDATE] ${selectedProvider} core integrated successfully.` });
      fetchAiConfigs();
    } catch (error) {
      setMessage({ type: 'error', text: '[ERROR] Neural link configuration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="futuristic-settings-wrapper">
      
      {/* Dynamic Background Glow */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      <div className="settings-header">
        <div className="header-text">
          <h1>Command Center</h1>
          <p>System Configuration & Neural Net Integrations</p>
        </div>
      </div>

      <div className="settings-navigation">
        <button 
          className={`nav-tab ${activeTab === 'GENERAL' ? 'active' : ''}`}
          onClick={() => setActiveTab('GENERAL')}
        >
          <span className="icon">⎔</span> Core Params
        </button>
        <button 
          className={`nav-tab ${activeTab === 'AI_CONFIG' ? 'active' : ''}`}
          onClick={() => setActiveTab('AI_CONFIG')}
        >
          <span className="icon">⌬</span> Neural Providers
        </button>
      </div>

      {message && (
        <div className={`hologram-alert ${message.type}`}>
          <div className="alert-scanner"></div>
          {message.text}
        </div>
      )}

      {activeTab === 'AI_CONFIG' && (
        <div className="glass-panel">
          <div className="panel-header">
            
            <div className="provider-selector">
              {providers.map(provider => (
                <button
                  key={provider}
                  className={`provider-btn ${selectedProvider === provider ? 'active' : ''}`}
                  onClick={() => setSelectedProvider(provider)}
                  type="button"
                >
                  {provider}
                </button>
              ))}
            </div>

            <label className="cyber-toggle">
              <span className="toggle-label">{aiConfig.isActive ? 'Network Active' : 'Activate Network'}</span>
              <div className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={aiConfig.isActive || false}
                  onChange={(e) => setAiConfig({...aiConfig, isActive: e.target.checked})}
                />
                <span className="slider"></span>
              </div>
            </label>
          </div>

          <form className="cyber-form" onSubmit={handleSaveConfig}>
            <div className="form-grid">
              
              <div className="input-group full-width">
                <input
                  type="password"
                  required
                  value={aiConfig.apiKey}
                  onChange={(e) => setAiConfig({...aiConfig, apiKey: e.target.value})}
                  placeholder=" "
                />
                <label>API Key (Encrypted Secret)</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group full-width">
                <input
                  type="url"
                  required
                  value={aiConfig.apiUrl}
                  onChange={(e) => setAiConfig({...aiConfig, apiUrl: e.target.value})}
                  placeholder=" "
                />
                <label>API Endpoint Matrix</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  required
                  value={aiConfig.defaultModel}
                  onChange={(e) => setAiConfig({...aiConfig, defaultModel: e.target.value})}
                  placeholder=" "
                />
                <label>Core Processing Model</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  value={aiConfig.visionModel || ''}
                  onChange={(e) => setAiConfig({...aiConfig, visionModel: e.target.value})}
                  placeholder=" "
                />
                <label>Optical/Vision Model</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group">
                <input
                  type="number"
                  step="0.1" min="0" max="1"
                  value={aiConfig.gradingTemperature}
                  onChange={(e) => setAiConfig({...aiConfig, gradingTemperature: parseFloat(e.target.value)})}
                  placeholder=" "
                />
                <label>Creativity Temp (0.0 - 1.0)</label>
                <div className="input-line"></div>
              </div>

              <div className="input-group">
                <input
                  type="number"
                  value={aiConfig.gradingMaxTokens}
                  onChange={(e) => setAiConfig({...aiConfig, gradingMaxTokens: parseInt(e.target.value)})}
                  placeholder=" "
                />
                <label>Max Token Output</label>
                <div className="input-line"></div>
              </div>

            </div>

            <div className="form-actions">
              <button type="submit" className="cyber-submit-btn" disabled={loading}>
                <span className="btn-text">{loading ? 'Syncing...' : 'Initialize Configuration'}</span>
                <span className="btn-glitch"></span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'GENERAL' && (
        <div className="glass-panel empty-state">
          <div className="empty-icon">⎔</div>
          <h3>System Core Standby</h3>
          <p>Global parameters will be routed here in a future update.</p>
        </div>
      )}

    </div>
  );
}