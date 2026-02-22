import React, { useState } from 'react';
import SpeakComponent from './SpeakComponent';
import StoryGenerator from './StoryGenerator';
import RhymeFinder from './RhymeFinder';
import '../../css/AIHub.css';
import { useSubscription } from '../../context/SubscriptionContext';
import UpgradePrompt from '../../components/UpgradePrompt';

const AIHub = ({ audioEnabled = true }) => {
  const { isFeatureLocked, getUpgradeMessage } = useSubscription();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if AI is locked
  const aiLocked = isFeatureLocked('ai');

  const aiFeatures = [
    {
      id: 'speak',
      name: 'AI Voice Assistant',
      icon: '🎤',
      description: 'Talk to AI and get voice responses',
      color: '#667eea'
    },
    {
      id: 'story',
      name: 'Story Generator',
      icon: '📖',
      description: 'Create magical stories with AI',
      color: '#ff9a9e'
    },
    {
      id: 'rhyme',
      name: 'Rhyme Finder',
      icon: '🎵',
      description: 'Find words that rhyme',
      color: '#a8edea'
    }
  ];

  if (selectedFeature) {
    return (
      <div className="ai-feature-container">
        <button className="back-button" onClick={() => setSelectedFeature(null)}>
          ← Back to AI Hub
        </button>
        {selectedFeature === 'speak' && <SpeakComponent audioEnabled={audioEnabled} />}
        {selectedFeature === 'story' && <StoryGenerator audioEnabled={audioEnabled} />}
        {selectedFeature === 'rhyme' && <RhymeFinder audioEnabled={audioEnabled} />}
      </div>
    );
  }

  // Show upgrade prompt if AI is locked
  if (aiLocked) {
    return (
      <div className="ai-hub-container">
        <div className="ai-hub-header">
          <h1>🤖 AI Learning Hub</h1>
          <p>AI-powered learning tools for premium subscribers!</p>
        </div>

        <UpgradePrompt
          message={getUpgradeMessage('ai')}
          feature="ai"
          onClose={() => {}}
          onUpgrade={() => window.location.href = '#Pricing'}
        />

        <div className="ai-features-grid locked">
          {aiFeatures.map((feature) => (
            <div
              key={feature.id}
              className="ai-feature-card locked"
              style={{ '--feature-color': feature.color }}
            >
              <div className="lock-overlay">🔒</div>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-name">{feature.name}</h3>
              <p className="feature-description">{feature.description}</p>
              <button className="try-button locked">Upgrade to Unlock</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ai-hub-container">
      <div className="ai-hub-header">
        <h1>🤖 AI Learning Hub</h1>
        <p>Choose an AI-powered learning tool!</p>
      </div>

      <div className="ai-features-grid">
        {aiFeatures.map((feature) => (
          <div
            key={feature.id}
            className="ai-feature-card"
            onClick={() => setSelectedFeature(feature.id)}
            style={{ '--feature-color': feature.color }}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-name">{feature.name}</h3>
            <p className="feature-description">{feature.description}</p>
            <button className="try-button">Try Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIHub;
