import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
import { getAllCategories, getCategoryById, getDefaultConfig } from '../../data/worksheetCategories';
import './WorksheetManager.css';

export default function WorksheetManager() {
    const [templates, setTemplates] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'questions', 'stories'
    const [filters, setFilters] = useState({
        category: '',
        difficulty: '',
        grade: '',
        search: ''
    });
    const [formData, setFormData] = useState({
        category: 'ADDITION',
        difficulty: 'EASY',
        gradeCodes: ['I', 'II'],
        name: '',
        description: '',
        config: getDefaultConfig('ADDITION'),
        tags: []
    });
    const [statistics, setStatistics] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [questionFilters, setQuestionFilters] = useState({
        grade: 'I',
        subject: 'Math',
        topic: '',
        difficulty: 'EASY',
        count: 20,
        worksheetType: 'RANDOM', // RANDOM or STATIC
        includeAnswerKey: true
    });
    const [storyFilters, setStoryFilters] = useState({ grade: 'I', type: 'Reading', count: 5 });
    const [loadedQuestions, setLoadedQuestions] = useState([]);
    const [loadedStories, setLoadedStories] = useState([]);
    const [responseTime, setResponseTime] = useState(null);

    const categories = getAllCategories();
    const difficulties = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED', 'EXPERT'];
    const grades = ['PRE_K', 'K', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const subjects = ['Math', 'English', 'Science', 'Social Studies', 'Reading'];
    const storyTypes = ['Reading', 'Comprehension', 'Fiction', 'Non-Fiction'];

    useEffect(() => {
        fetchTemplates();
        fetchStatistics();
    }, [filters]);

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.grade) params.append('grade', filters.grade);
            if (filters.search) params.append('search', filters.search);
            params.append('page', 0);
            params.append('size', 50);

            const response = await axios.get(
                `${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTemplates(response.data.content || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem('token');
            const [categoryStats, difficultyStats, gradeStats] = await Promise.all([
                axios.get(`${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/statistics/categories`,
                    { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/statistics/difficulty`,
                    { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/statistics/grades`,
                    { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setStatistics({
                categories: categoryStats.data,
                difficulties: difficultyStats.data,
                grades: gradeStats.data
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleGenerateWithGPT = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                problemCount: formData.config.problemCount || formData.config.count || 20,
                params: formData.config,
                includeSampleProblems: true,
                includeTeacherNotes: true,
                createdBy: 'admin'
            };

            const response = await axios.post(
                `${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/generate`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('✅ Template generated successfully with GPT!');
            resetForm();
            fetchTemplates();
        } catch (error) {
            console.error('Error generating template:', error);
            alert('❌ Failed to generate template: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleBulkGenerate = async (presetBundle) => {
        if (!window.confirm(`Generate 100+ templates for ${presetBundle}? This will take a few minutes.`)) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/generate/bulk`,
                {
                    presetBundle,
                    batchSize: 10,
                    validateBeforeSave: true,
                    minQualityScore: 7.0,
                    autoApprove: false,
                    createdBy: 'admin'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`✅ Bulk generation complete!\nSuccess: ${response.data.successCount}\nFailed: ${response.data.failureCount}\nDuration: ${response.data.durationMillis}ms`);
            setShowBulkModal(false);
            fetchTemplates();
        } catch (error) {
            console.error('Error bulk generating:', error);
            alert('❌ Bulk generation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template');
        }
    };

    const handleCategoryChange = (category) => {
        setFormData(prev => ({
            ...prev,
            category,
            config: getDefaultConfig(category)
        }));
    };

    const resetForm = () => {
        setFormData({
            category: 'ADDITION',
            difficulty: 'EASY',
            gradeCodes: ['I', 'II'],
            name: '',
            description: '',
            config: getDefaultConfig('ADDITION'),
            tags: []
        });
        setEditingId(null);
        setShowForm(false);
    };

    const loadQuestionsFromBackend = async () => {
        setLoading(true);
        const startTime = Date.now();

        try {
            const token = localStorage.getItem('token');

            // Determine which endpoint to use based on filters
            let endpoint = '';
            let payload = {
                grade: questionFilters.grade,
                count: questionFilters.count,
                randomize: questionFilters.worksheetType === 'RANDOM'
            };

            if (questionFilters.topic && questionFilters.topic.trim() !== '') {
                // Use topic-based endpoint (most specific)
                endpoint = `${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/load-by-topic`;
                payload.topic = questionFilters.topic;
                payload.difficulty = questionFilters.difficulty;
            } else if (questionFilters.subject) {
                // Use subject-based endpoint
                endpoint = `${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/load-by-subject`;
                payload.subject = questionFilters.subject;
            } else {
                // Use grade-only endpoint (fastest)
                endpoint = `${CONFIG.development.ADMIN_API_URL}/v1/content-library/worksheets/load-by-grade`;
            }

            const response = await axios.post(endpoint, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data;
            const clientResponseTime = Date.now() - startTime;

            if (data.success && data.questions) {
                setLoadedQuestions(data.questions);
                setResponseTime({
                    server: data.responseTimeMs,
                    client: clientResponseTime,
                    total: clientResponseTime
                });
                alert(`✅ ${data.message}\n🚀 Client Total: ${clientResponseTime}ms\n⚡ Server Query: ${data.responseTimeMs}ms\n📊 Type: ${data.worksheetType}`);
            } else {
                alert('❌ No questions found matching the criteria');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('❌ Failed to load questions: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const loadStoriesFromBackend = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${CONFIG.development.ADMIN_API_URL}/assessment/loadstories`,
                {
                    grade: storyFilters.grade,
                    type: storyFilters.type,
                    count: storyFilters.count
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Parse the response (it returns a JSON string)
            const stories = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setLoadedStories(Array.isArray(stories) ? stories : [stories]);
            alert(`✅ Loaded ${Array.isArray(stories) ? stories.length : 1} stories successfully!`);
        } catch (error) {
            console.error('Error loading stories:', error);
            alert('❌ Failed to load stories: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const generateQuestionWorksheet = () => {
        if (loadedQuestions.length === 0) {
            alert('Please load questions first');
            return;
        }
        alert('Question worksheet PDF generation coming soon! Questions loaded: ' + loadedQuestions.length);
        // TODO: Integrate with PDFGenerator to create worksheet from questions
    };

    const generateStoryWorksheet = () => {
        if (loadedStories.length === 0) {
            alert('Please load stories first');
            return;
        }
        alert('Story worksheet PDF generation coming soon! Stories loaded: ' + loadedStories.length);
        // TODO: Integrate with PDFGenerator to create worksheet from stories
    };

    const renderCategoryForm = () => {
        const categoryDef = getCategoryById(formData.category);
        if (!categoryDef) return null;

        return (
            <div className="category-config">
                <h3>{categoryDef.icon} {categoryDef.name} Configuration</h3>
                <div className="form-row">
                    {categoryDef.configFields.includes('problemCount') && (
                        <div className="form-group">
                            <label>Problem Count</label>
                            <input
                                type="number"
                                value={formData.config.problemCount || formData.config.count || 20}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    config: { ...prev.config, problemCount: parseInt(e.target.value), count: parseInt(e.target.value) }
                                }))}
                                min="5"
                                max="100"
                            />
                        </div>
                    )}

                    {categoryDef.configFields.includes('maxNumber') && (
                        <div className="form-group">
                            <label>Max Number</label>
                            <input
                                type="number"
                                value={formData.config.maxNumber || 100}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    config: { ...prev.config, maxNumber: parseInt(e.target.value) }
                                }))}
                                min="10"
                                max="10000"
                            />
                        </div>
                    )}

                    {categoryDef.configFields.includes('fromTable') && (
                        <>
                            <div className="form-group">
                                <label>From Table</label>
                                <input
                                    type="number"
                                    value={formData.config.fromTable || 1}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        config: { ...prev.config, fromTable: parseInt(e.target.value) }
                                    }))}
                                    min="1"
                                    max="20"
                                />
                            </div>
                            <div className="form-group">
                                <label>To Table</label>
                                <input
                                    type="number"
                                    value={formData.config.toTable || 10}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        config: { ...prev.config, toTable: parseInt(e.target.value) }
                                    }))}
                                    min="1"
                                    max="20"
                                />
                            </div>
                        </>
                    )}

                    {categoryDef.configFields.includes('requireRegrouping') && (
                        <div className="form-group checkbox-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.config.requireRegrouping || false}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        config: { ...prev.config, requireRegrouping: e.target.checked }
                                    }))}
                                />
                                Require Regrouping/Carrying
                            </label>
                        </div>
                    )}

                    {categoryDef.configFields.includes('includeRemainders') && (
                        <div className="form-group checkbox-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.config.includeRemainders || false}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        config: { ...prev.config, includeRemainders: e.target.checked }
                                    }))}
                                />
                                Include Remainders
                            </label>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="worksheet-manager-container">
            <div className="worksheet-manager-header">
                <h1>📚 Worksheet Templates Manager</h1>
                <div className="header-actions">
                    <button className="btn-bulk" onClick={() => setShowBulkModal(true)}>
                        🚀 Bulk Generate
                    </button>
                    <button className="btn-new" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cancel' : '➕ Generate with GPT'}
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', padding: '10px 0' }}>
                <button
                    className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('templates')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'templates' ? '#667eea' : 'white',
                        color: activeTab === 'templates' ? 'white' : '#667eea',
                        border: '2px solid #667eea',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    📝 GPT Templates
                </button>
                <button
                    className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'questions' ? '#4facfe' : 'white',
                        color: activeTab === 'questions' ? 'white' : '#4facfe',
                        border: '2px solid #4facfe',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    ❓ Load Questions
                </button>
                <button
                    className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stories')}
                    style={{
                        padding: '10px 20px',
                        background: activeTab === 'stories' ? '#f093fb' : 'white',
                        color: activeTab === 'stories' ? 'white' : '#f093fb',
                        border: '2px solid #f093fb',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    📚 Load Stories
                </button>
            </div>

            {/* Statistics Dashboard */}
            {statistics && activeTab === 'templates' && (
                <div className="statistics-dashboard">
                    <div className="stat-card">
                        <h3>📊 Total Templates</h3>
                        <p className="stat-value">{templates.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>📁 Categories</h3>
                        <p className="stat-value">{Object.keys(statistics.categories).length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>🎓 Grades Covered</h3>
                        <p className="stat-value">{Object.keys(statistics.grades).length}</p>
                    </div>
                </div>
            )}

            {/* Questions Tab Content */}
            {activeTab === 'questions' && (
                <div className="questions-section">
                    <div className="section-header" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '24px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 8px 20px rgba(79, 172, 254, 0.3)' }}>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem' }}>⚡ High-Performance Worksheet Generator</h2>
                        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.95 }}>🚀 Lightning-fast response times | 📊 Multiple filter options | 🎲 Static & Random modes</p>
                    </div>

                    <div className="filters-card" style={{ background: 'white', padding: '28px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', fontSize: '1.3rem' }}>🎯 Filter Options</h3>

                        {/* Row 1: Basic Filters */}
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: '700', marginBottom: '10px', display: 'block', color: '#475569', fontSize: '0.95rem' }}>📚 Grade *</label>
                                <select
                                    value={questionFilters.grade}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, grade: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem', fontWeight: '500' }}
                                >
                                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '700', marginBottom: '10px', display: 'block', color: '#475569', fontSize: '0.95rem' }}>📖 Subject</label>
                                <select
                                    value={questionFilters.subject}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, subject: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem', fontWeight: '500' }}
                                >
                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '700', marginBottom: '10px', display: 'block', color: '#475569', fontSize: '0.95rem' }}>📝 Topic/Chapter</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Algebra, Fractions"
                                    value={questionFilters.topic}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, topic: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        {/* Row 2: Advanced Filters */}
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: '700', marginBottom: '10px', display: 'block', color: '#475569', fontSize: '0.95rem' }}>🎚️ Difficulty</label>
                                <select
                                    value={questionFilters.difficulty}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem', fontWeight: '500' }}
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="COMPLEX">Complex</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '700', marginBottom: '10px', display: 'block', color: '#475569', fontSize: '0.95rem' }}>🔢 Question Count</label>
                                <input
                                    type="number"
                                    value={questionFilters.count}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                                    min="5"
                                    max="100"
                                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem', fontWeight: '500' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '700', marginBottom: '10px', display: 'block', color: '#475569', fontSize: '0.95rem' }}>🎲 Worksheet Type</label>
                                <select
                                    value={questionFilters.worksheetType}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, worksheetType: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', background: questionFilters.worksheetType === 'RANDOM' ? '#f0fdf4' : '#fef3c7' }}
                                >
                                    <option value="RANDOM">🎲 Random (Different Each Time)</option>
                                    <option value="STATIC">📌 Static (Fixed Questions)</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Options */}
                        <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>
                                <input
                                    type="checkbox"
                                    checked={questionFilters.includeAnswerKey}
                                    onChange={(e) => setQuestionFilters(prev => ({ ...prev, includeAnswerKey: e.target.checked }))}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '1.05rem' }}>✅ Include Answer Key (Separate PDF)</span>
                            </label>
                        </div>
                        <button
                            onClick={loadQuestionsFromBackend}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '18px 32px',
                                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.15rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 6px 20px rgba(79, 172, 254, 0.4)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                    Loading Questions...
                                </>
                            ) : (
                                <>⚡ Load Questions</>
                            )}
                        </button>

                        {/* Performance Info */}
                        {responseTime && (
                            <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '2px solid #10b981' }}>
                                <strong style={{ color: '#065f46' }}>🚀 Performance:</strong>
                                <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.9rem' }}>
                                    <div><strong>Server Query:</strong> {responseTime.server}ms</div>
                                    <div><strong>Client Total:</strong> {responseTime.client}ms</div>
                                    <div><strong>Type:</strong> {questionFilters.worksheetType}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {loadedQuestions.length > 0 && (
                        <div className="loaded-content" style={{ background: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.5rem' }}>✅ Loaded {loadedQuestions.length} Questions</h3>
                                <span style={{ padding: '8px 16px', background: questionFilters.worksheetType === 'RANDOM' ? '#dcfce7' : '#fef3c7', borderRadius: '20px', fontWeight: '600', fontSize: '0.9rem' }}>
                                    {questionFilters.worksheetType === 'RANDOM' ? '🎲 Random' : '📌 Static'}
                                </span>
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                                {loadedQuestions.map((q, idx) => (
                                    <div key={idx} style={{ padding: '12px', background: '#f8fafc', marginBottom: '10px', borderRadius: '8px', borderLeft: '4px solid #4facfe' }}>
                                        <strong>Q{idx + 1}:</strong> {q.question || q.text || JSON.stringify(q).substring(0, 100)}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={generateQuestionWorksheet}
                                style={{
                                    padding: '14px 28px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                📄 Generate PDF Worksheet
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Stories Tab Content */}
            {activeTab === 'stories' && (
                <div className="stories-section">
                    <div className="section-header" style={{ background: '#f093fb', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <h2>📚 Load Existing Stories for Worksheets</h2>
                        <p>Load stories from your story bank and generate PDF worksheets</p>
                    </div>

                    <div className="filters-card" style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Grade</label>
                                <select
                                    value={storyFilters.grade}
                                    onChange={(e) => setStoryFilters(prev => ({ ...prev, grade: e.target.value }))}
                                    style={{ width: '100%', padding: '10px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                                >
                                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Story Type</label>
                                <select
                                    value={storyFilters.type}
                                    onChange={(e) => setStoryFilters(prev => ({ ...prev, type: e.target.value }))}
                                    style={{ width: '100%', padding: '10px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                                >
                                    {storyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Story Count</label>
                                <input
                                    type="number"
                                    value={storyFilters.count}
                                    onChange={(e) => setStoryFilters(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                                    min="1"
                                    max="20"
                                    style={{ width: '100%', padding: '10px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={loadStoriesFromBackend}
                            disabled={loading}
                            style={{
                                marginTop: '20px',
                                padding: '14px 28px',
                                background: '#f093fb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? '⏳ Loading...' : '📥 Load Stories from Backend'}
                        </button>
                    </div>

                    {loadedStories.length > 0 && (
                        <div className="loaded-content" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
                            <h3 style={{ marginBottom: '16px' }}>✅ Loaded {loadedStories.length} Stories</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                                {loadedStories.map((s, idx) => (
                                    <div key={idx} style={{ padding: '12px', background: '#f8fafc', marginBottom: '10px', borderRadius: '8px', borderLeft: '4px solid #f093fb' }}>
                                        <strong>Story {idx + 1}:</strong> {s.title || s.name || JSON.stringify(s).substring(0, 100)}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={generateStoryWorksheet}
                                style={{
                                    padding: '14px 28px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                📄 Generate PDF Worksheet
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Generate Form */}
            {showForm && activeTab === 'templates' && (
                <div className="worksheet-form-card">
                    <h2>{editingId ? 'Edit Template' : '🤖 Generate Template with GPT-4'}</h2>
                    <form onSubmit={handleGenerateWithGPT}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Difficulty *</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                                    required
                                >
                                    {difficulties.map(diff => (
                                        <option key={diff} value={diff}>{diff}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Target Grades *</label>
                                <div className="grade-selector">
                                    {grades.map(grade => (
                                        <label key={grade} className="grade-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.gradeCodes.includes(grade)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            gradeCodes: [...prev.gradeCodes, grade]
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            gradeCodes: prev.gradeCodes.filter(g => g !== grade)
                                                        }));
                                                    }
                                                }}
                                            />
                                            {grade}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {renderCategoryForm()}

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? '⏳ Generating with GPT...' : '🤖 Generate Template'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            {activeTab === 'templates' && (
            <div className="filters-bar">
                <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                </select>

                <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="filter-select"
                >
                    <option value="">All Difficulties</option>
                    {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                    ))}
                </select>

                <select
                    value={filters.grade}
                    onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                    className="filter-select"
                >
                    <option value="">All Grades</option>
                    {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="🔍 Search templates..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="filter-search"
                />
            </div>

            )}

            {/* Templates List */}
            {activeTab === 'templates' && (
            <div className="templates-list">
                <h2>All Templates ({templates.length})</h2>
                {templates.length === 0 ? (
                    <div className="no-templates">
                        <p>📭 No templates yet</p>
                        <small>Generate your first template with GPT or use bulk generation</small>
                    </div>
                ) : (
                    <div className="templates-grid">
                        {templates.map(template => {
                            const categoryDef = getCategoryById(template.category);
                            return (
                                <div key={template.id} className="template-card">
                                    <div className="template-header">
                                        <span className="template-category" style={{ background: categoryDef?.color }}>
                                            {categoryDef?.icon} {categoryDef?.name}
                                        </span>
                                        <span className="template-difficulty" data-difficulty={template.difficulty?.toLowerCase()}>
                                            {template.difficulty}
                                        </span>
                                    </div>

                                    <div className="template-content">
                                        <h3>{template.name}</h3>
                                        <p>{template.description}</p>
                                    </div>

                                    <div className="template-meta">
                                        <span className="meta-item">
                                            🎓 {template.gradeCodes?.join(', ')}
                                        </span>
                                        {template.source && (
                                            <span className="meta-item">
                                                {template.source === 'GPT_GENERATED' ? '🤖 GPT' : '✏️ Manual'}
                                            </span>
                                        )}
                                    </div>

                                    {template.qualityMetrics && (
                                        <div className="quality-score">
                                            ⭐ Quality: {template.qualityMetrics.overallScore?.toFixed(1)}/10
                                        </div>
                                    )}

                                    <div className="template-actions">
                                        <button className="btn-action preview" onClick={() => alert('Preview feature coming soon!')}>
                                            👁️ Preview
                                        </button>
                                        <button className="btn-action download" onClick={() => alert('Download feature - will use client-side PDF generation!')}>
                                            📥 Download
                                        </button>
                                        <button className="btn-action delete" onClick={() => handleDelete(template.id)}>
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            )}

            {/* Bulk Generate Modal */}
            {showBulkModal && (
                <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>🚀 Bulk Generate Templates</h2>
                        <p>Generate 100+ templates at once using GPT-4</p>
                        <div className="bulk-options">
                            <button className="bulk-option" onClick={() => handleBulkGenerate('ELEMENTARY')}>
                                📚 Elementary (Pre-K to Grade 5)
                            </button>
                            <button className="bulk-option" onClick={() => handleBulkGenerate('MIDDLE_SCHOOL')}>
                                🎓 Middle School (Grades 6-8)
                            </button>
                            <button className="bulk-option" onClick={() => handleBulkGenerate('HIGH_SCHOOL')}>
                                🏫 High School (Grades 9-12)
                            </button>
                            <button className="bulk-option primary" onClick={() => handleBulkGenerate('COMPLETE')}>
                                🌟 Complete (All Grades & Categories)
                            </button>
                        </div>
                        <button className="btn-cancel" onClick={() => setShowBulkModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
