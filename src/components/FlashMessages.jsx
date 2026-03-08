import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../Config';
import './FlashMessages.css';

export default function FlashMessages() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/flash-messages/active`, config);
            
            if (response.data && Array.isArray(response.data)) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error fetching flash messages:', error);
        }
    };

    if (messages.length === 0) {
        return null;
    }

    const getIcon = (type) => {
        switch (type) {
            case 'INFO': return 'ℹ️';
            case 'SUCCESS': return '✅';
            case 'WARNING': return '⚠️';
            case 'ERROR': return '🚨';
            case 'ANNOUNCEMENT': return '📢';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="flash-messages-container">
            {messages.map(msg => (
                <div key={msg.id} className={`flash-message flash-${msg.type.toLowerCase()}`}>
                    <div className="flash-content-wrapper">
                        <span className="flash-icon">{getIcon(msg.type)}</span>
                        <span className="flash-text">{msg.message}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}