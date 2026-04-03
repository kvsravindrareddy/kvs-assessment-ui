import React, { useState } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';

export default function SpecialtyContentManager() {
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    
    const [formData, setFormData] = useState({
        domain: 'VOCABULARY',
        topic: 'SPELLING',
        grade: 'GRADE_4',
        complexity: 'MEDIUM',
        count: 20
    });

    const domains = {
        VOCABULARY: ['SPELLING', 'SYNONYMS', 'ANTONYMS', 'PHONICS', 'SIGHT_WORDS'],
        GRAMMAR: ['NOUNS_VERBS', 'TENSES', 'PUNCTUATION', 'ADJECTIVES'],
        CRITICAL_THINKING: ['LOGIC_PUZZLES', 'PATTERN_MATCHING', 'RIDDLES', 'SEQUENCES']
    };

    const grades = ['KINDERGARTEN', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8'];

    const handleDomainChange = (e) => {
        const newDomain = e.target.value;
        setFormData({ ...formData, domain: newDomain, topic: domains[newDomain][0] });
    };

    const generateContent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: 'info', text: '🤖 AI is analyzing and generating questions. Please wait...' });

        try {
            const token = localStorage.getItem('token');
            const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;

            // Using standard AI Question Generation Payload
            const payload = {
                category: formData.grade,
                type: formData.topic,
                complexity: formData.complexity,
                numberOfQuestions: formData.count,
                source: "CHATGPT", // Instructs backend to use AI Strategy
                isActive: true
            };

            // Assuming standard admin endpoint for question generation. Adjust if your backend uses a different path!
            await axios.post(`${baseUrl}/admin-assessment/v1/assessment/loadquestions`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStatusMessage({ type: 'success', text: `✅ Successfully generated ${formData.count} ${formData.topic.replace('_', ' ')} questions for ${formData.grade.replace('_', ' ')}!` });
        } catch (error) {
            setStatusMessage({ type: 'error', text: '❌ Failed to generate questions. Ensure your AI API key is configured.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <span style={{ fontSize: '3rem' }}>🧠</span>
                    <h1 style={{ color: '#0f172a', margin: '10px 0' }}>AI Specialty Content Generator</h1>
                    <p style={{ color: '#64748b' }}>Generate advanced cognitive, language, and logic questions into the database.</p>
                </div>

                {statusMessage && (
                    <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', background: statusMessage.type === 'success' ? '#d1fae5' : statusMessage.type === 'error' ? '#fee2e2' : '#e0f2fe', color: statusMessage.type === 'success' ? '#065f46' : statusMessage.type === 'error' ? '#991b1b' : '#075985' }}>
                        {statusMessage.text}
                    </div>
                )}

                <form onSubmit={generateContent} style={{ display: 'grid', gap: '20px' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Domain</label>
                            <select value={formData.domain} onChange={handleDomainChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }}>
                                <option value="VOCABULARY">Vocabulary & Spelling</option>
                                <option value="GRAMMAR">Grammar & Language</option>
                                <option value="CRITICAL_THINKING">Critical Thinking & Logic</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Specific Topic</label>
                            <select value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }}>
                                {domains[formData.domain].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Target Grade</label>
                            <select value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }}>
                                {grades.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Complexity</label>
                            <select value={formData.complexity} onChange={(e) => setFormData({...formData, complexity: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }}>
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="COMPLEX">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Question Count</label>
                            <input type="number" min="5" max="100" value={formData.count} onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem' }} />
                        </div>
                    </div>

                    <button disabled={loading} type="submit" style={{ padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '10px' }}>
                        {loading ? 'Processing via AI...' : 'Generate Content 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
}