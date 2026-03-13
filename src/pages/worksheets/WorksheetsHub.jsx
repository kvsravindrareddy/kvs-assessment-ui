import React, { useState } from 'react';
import { PDFGenerator } from '../../utils/pdfGenerator';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import './WorksheetsHub.css';

export default function WorksheetsHub() {
    const [activeCategory, setActiveCategory] = useState('multiplicationTables');
    const [mode, setMode] = useState('templates');
    const [loading, setLoading] = useState(false);

    const [customParams, setCustomParams] = useState({
        multiplicationTables: { from: 1, to: 10 },
        addition: { count: 20, max: 100, difficulty: 'easy' },
        subtraction: { count: 20, max: 100, difficulty: 'easy' },
        multiplication: { count: 20, max: 12, difficulty: 'easy' },
        division: { count: 20, max: 144, difficulty: 'easy' },
        numberWriting: { from: 1, to: 100, percentage: 50 },
        mixedOperations: { count: 20, max: 100, difficulty: 'easy' }
    });

    const categories = [
        { id: 'multiplicationTables', name: 'Multiplication Tables', icon: '📊', color: '#667eea' },
        { id: 'addition', name: 'Addition', icon: '➕', color: '#56ab2f' },
        { id: 'subtraction', name: 'Subtraction', icon: '➖', color: '#f093fb' },
        { id: 'multiplication', name: 'Multiplication', icon: '✖️', color: '#fa709a' },
        { id: 'division', name: 'Division', icon: '➗', color: '#4facfe' },
        { id: 'numberWriting', name: 'Number Writing', icon: '✏️', color: '#43e97b' },
        { id: 'mixedOperations', name: 'Mixed Operations', icon: '🔢', color: '#fa8bff' }
    ];

    const generateFromTemplate = (template, includeAnswers) => {
        setLoading(true);
        try {
            let doc;
            if (activeCategory === 'multiplicationTables') {
                doc = PDFGenerator.generateMultiplicationTable(template.from, template.to, includeAnswers);
            } else if (activeCategory === 'addition') {
                doc = PDFGenerator.generateAdditionWorksheet(template.count, template.max, template.difficulty, includeAnswers);
            } else if (activeCategory === 'subtraction') {
                doc = PDFGenerator.generateSubtractionWorksheet(template.count, template.max, template.difficulty, includeAnswers);
            } else if (activeCategory === 'multiplication') {
                doc = PDFGenerator.generateMultiplicationWorksheet(template.count, template.max, template.difficulty, includeAnswers);
            } else if (activeCategory === 'division') {
                doc = PDFGenerator.generateDivisionWorksheet(template.count, template.max, template.difficulty, includeAnswers);
            } else if (activeCategory === 'numberWriting') {
                doc = PDFGenerator.generateNumberWritingWorksheet(template.from, template.to, template.percentage);
            } else if (activeCategory === 'mixedOperations') {
                doc = PDFGenerator.generateMixedOperationsWorksheet(template.count, template.max, template.difficulty, includeAnswers);
            }
            PDFGenerator.downloadPDF(doc, `${template.name.replace(/\s+/g, '_')}_${includeAnswers ? 'answers' : 'worksheet'}.pdf`);
        } catch (error) {
            alert('Failed to generate worksheet');
        } finally {
            setLoading(false);
        }
    };

    const generateCustom = (includeAnswers) => {
        setLoading(true);
        try {
            let doc;
            const params = customParams[activeCategory];
            if (activeCategory === 'multiplicationTables') {
                doc = PDFGenerator.generateMultiplicationTable(params.from, params.to, includeAnswers);
            } else if (activeCategory === 'addition') {
                doc = PDFGenerator.generateAdditionWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            } else if (activeCategory === 'subtraction') {
                doc = PDFGenerator.generateSubtractionWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            } else if (activeCategory === 'multiplication') {
                doc = PDFGenerator.generateMultiplicationWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            } else if (activeCategory === 'division') {
                doc = PDFGenerator.generateDivisionWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            } else if (activeCategory === 'numberWriting') {
                doc = PDFGenerator.generateNumberWritingWorksheet(params.from, params.to, params.percentage);
            } else if (activeCategory === 'mixedOperations') {
                doc = PDFGenerator.generateMixedOperationsWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            }
            PDFGenerator.downloadPDF(doc, `custom_${activeCategory}_${includeAnswers ? 'answers' : 'worksheet'}.pdf`);
        } catch (error) {
            alert('Failed to generate worksheet');
        } finally {
            setLoading(false);
        }
    };

    const updateParam = (param, value) => {
        setCustomParams(prev => ({
            ...prev,
            [activeCategory]: { ...prev[activeCategory], [param]: value }
        }));
    };

    return (
        <div className="worksheets-hub">
            <div className="worksheets-header">
                <h1>🖨️ Professional Math Worksheets</h1>
                <p>80+ Templates | Custom Generator | Instant Download | Answer Keys</p>
            </div>

            <div className="mode-toggle">
                <button className={`mode-btn ${mode === 'templates' ? 'active' : ''}`} onClick={() => setMode('templates')}>
                    ⚡ Quick Templates (80)
                </button>
                <button className={`mode-btn ${mode === 'custom' ? 'active' : ''}`} onClick={() => setMode('custom')}>
                    🎨 Custom Generator
                </button>
            </div>

            <div className="category-tabs">
                {categories.map(cat => (
                    <button key={cat.id} className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)} style={{ borderColor: activeCategory === cat.id ? cat.color : 'transparent', background: activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.2)' }}>
                        <span className="tab-icon">{cat.icon}</span>
                        <span className="tab-name">{cat.name}</span>
                        {mode === 'templates' && <span className="badge">{WORKSHEET_TEMPLATES[cat.id]?.length || 0}</span>}
                    </button>
                ))}
            </div>

            {mode === 'templates' && (
                <div className="templates-grid">
                    {WORKSHEET_TEMPLATES[activeCategory]?.map(template => (
                        <div key={template.id} className="template-card">
                            <div className="template-header">
                                <h3>{template.name}</h3>
                                <span className="template-id" style={{ background: categories.find(c => c.id === activeCategory)?.color }}>#{template.id}</span>
                            </div>
                            <p className="template-description">{template.description}</p>
                            <div className="template-details">
                                {template.from !== undefined && <span className="detail-badge">📊 {template.from}-{template.to}</span>}
                                {template.count !== undefined && <span className="detail-badge">📝 {template.count} problems</span>}
                                {template.difficulty && <span className={`detail-badge difficulty-${template.difficulty}`}>{template.difficulty.toUpperCase()}</span>}
                                {template.percentage !== undefined && <span className="detail-badge">🎯 {template.percentage}% blank</span>}
                            </div>
                            <div className="template-actions">
                                <button className="btn-download worksheet-btn" onClick={() => generateFromTemplate(template, false)} disabled={loading}>📄 Worksheet</button>
                                {activeCategory !== 'numberWriting' && <button className="btn-download answer-btn" onClick={() => generateFromTemplate(template, true)} disabled={loading}>✅ Answer Key</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {mode === 'custom' && (
                <div className="custom-form">
                    <div className="custom-header" style={{ borderColor: categories.find(c => c.id === activeCategory)?.color }}>
                        <h2>{categories.find(c => c.id === activeCategory)?.icon} {categories.find(c => c.id === activeCategory)?.name} - Custom Settings</h2>
                        <p>Create your own customized worksheet</p>
                    </div>
                    <div className="form-grid">
                        {activeCategory === 'multiplicationTables' && (
                            <>
                                <div className="form-group"><label>From Table:</label><input type="number" value={customParams[activeCategory].from} onChange={(e) => updateParam('from', parseInt(e.target.value))} min="1" max="20" /></div>
                                <div className="form-group"><label>To Table:</label><input type="number" value={customParams[activeCategory].to} onChange={(e) => updateParam('to', parseInt(e.target.value))} min={customParams[activeCategory].from} max="20" /></div>
                            </>
                        )}
                        {['addition', 'subtraction', 'multiplication', 'division', 'mixedOperations'].includes(activeCategory) && (
                            <>
                                <div className="form-group"><label>Problems:</label><input type="number" value={customParams[activeCategory].count} onChange={(e) => updateParam('count', parseInt(e.target.value))} min="10" max="100" /></div>
                                <div className="form-group"><label>Max Number:</label><input type="number" value={customParams[activeCategory].max} onChange={(e) => updateParam('max', parseInt(e.target.value))} min="10" max="1000" /></div>
                                <div className="form-group"><label>Difficulty:</label><select value={customParams[activeCategory].difficulty} onChange={(e) => updateParam('difficulty', e.target.value)}><option value="beginner">Beginner</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                            </>
                        )}
                        {activeCategory === 'numberWriting' && (
                            <>
                                <div className="form-group"><label>From:</label><input type="number" value={customParams[activeCategory].from} onChange={(e) => updateParam('from', parseInt(e.target.value))} min="1" max="1000" /></div>
                                <div className="form-group"><label>To:</label><input type="number" value={customParams[activeCategory].to} onChange={(e) => updateParam('to', parseInt(e.target.value))} min={customParams[activeCategory].from} max="1000" /></div>
                                <div className="form-group"><label>Blank %:</label><input type="range" value={customParams[activeCategory].percentage} onChange={(e) => updateParam('percentage', parseInt(e.target.value))} min="0" max="100" /><span>{customParams[activeCategory].percentage}%</span></div>
                            </>
                        )}
                    </div>
                    <div className="generate-buttons">
                        <button className="btn-generate worksheet" onClick={() => generateCustom(false)} disabled={loading} style={{ background: categories.find(c => c.id === activeCategory)?.color }}>📄 Generate Worksheet</button>
                        {activeCategory !== 'numberWriting' && <button className="btn-generate answer" onClick={() => generateCustom(true)} disabled={loading} style={{ background: categories.find(c => c.id === activeCategory)?.color }}>✅ Generate Answer Key</button>}
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Generating worksheet...</p>
                </div>
            )}
        </div>
    );
}
