import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CONFIG from '../Config';
import './FlashMessages.css';

export default function FlashMessages() {
    const [messages, setMessages] = useState([]);

    // 1. Initial Load
    const fetchInitialMessages = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/flash-messages/active`, config);
            if (response.data && Array.isArray(response.data)) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error fetching initial flash messages:', error);
        }
    }, []);

    // 2. Real-time Push Stream (Server-Sent Events)
    useEffect(() => {
        fetchInitialMessages();

        const token = localStorage.getItem('token');
        const abortController = new AbortController();

        const connectStream = async () => {
            try {
                const response = await fetch(`${CONFIG.development.GATEWAY_URL}/v1/flash-messages/stream`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    signal: abortController.signal
                });

                // If endpoint not implemented yet, exit silently
                if (response.status === 404 || response.status === 500) {
                    console.debug('Flash message stream not available');
                    return;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        // Reconnect seamlessly if server drops connection
                        setTimeout(connectStream, 3000);
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const chunks = buffer.split('\n\n');
                    buffer = chunks.pop(); // Keep incomplete data in buffer

                    chunks.forEach(chunk => {
                        if (chunk.includes('data:')) {
                            try {
                                const dataStr = chunk.split('data:')[1].trim();
                                const pushEvent = JSON.parse(dataStr);
                                
                                setMessages(prev => {
                                    // If message was disabled or deleted
                                    if (!pushEvent.active) {
                                        return prev.filter(m => m.id !== pushEvent.id);
                                    }
                                    
                                    // If message is active (new or updated)
                                    const exists = prev.find(m => m.id === pushEvent.id);
                                    if (exists) {
                                        return prev.map(m => m.id === pushEvent.id ? pushEvent : m);
                                    }
                                    return [...prev, pushEvent];
                                });
                            } catch (e) {
                                console.error('Error parsing push event:', e);
                            }
                        }
                    });
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.debug('Flash message stream error:', err.message);
                    // Don't retry - endpoint not implemented yet
                }
            }
        };

        connectStream();

        return () => {
            abortController.abort();
        };
    }, [fetchInitialMessages]);

    if (messages.length === 0) return null;

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