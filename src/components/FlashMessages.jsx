import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../Config';
import './FlashMessages.css';

export default function FlashMessages() {
    const [messages, setMessages] = useState([]);
    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/flash-messages/active`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching flash messages:', error);
        }
    };

    const handleDismiss = (id) => {
        setDismissed([...dismissed, id]);
        // Store in localStorage to remember dismissal
        const dismissedMessages = JSON.parse(localStorage.getItem('dismissedMessages') || '[]');
        dismissedMessages.push(id);
        localStorage.setItem('dismissedMessages', JSON.stringify(dismissedMessages));
    };

    const visibleMessages = messages.filter(msg => {
        const dismissedMessages = JSON.parse(localStorage.getItem('dismissedMessages') || '[]');
        return !dismissedMessages.includes(msg.id) && !dismissed.includes(msg.id);
    });

    if (visibleMessages.length === 0) {
        return null;
    }

    const getIcon = (type) => {
        switch (type) {
            case 'INFO': return 'ℹ️';
            case 'SUCCESS': return '✅';
            case 'WARNING': return '⚠️';
            case 'ERROR': return '❌';
            case 'ANNOUNCEMENT': return '📢';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="flash-messages-container">
            {visibleMessages.map(msg => (
                <div key={msg.id} className={`flash-message flash-${msg.type.toLowerCase()}`}>
                    <span className="flash-icon">{getIcon(msg.type)}</span>
                    <span className="flash-text">{msg.message}</span>
                    <button className="flash-dismiss" onClick={() => handleDismiss(msg.id)}>✕</button>
                </div>
            ))}
        </div>
    );
}
