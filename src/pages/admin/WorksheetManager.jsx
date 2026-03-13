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

    const categories = getAllCategories();
    const difficulties = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED', 'EXPERT'];
    const grades = ['PRE_K', 'K', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

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

            {/* Statistics Dashboard */}
            {statistics && (
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

            {/* Generate Form */}
            {showForm && (
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

            {/* Templates List */}
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
