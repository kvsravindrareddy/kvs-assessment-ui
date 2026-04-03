import React, { useState, useEffect } from 'react';
import { getConfig } from '../../Config';
import axios from 'axios';
import { PDFGenerator } from '../../utils/pdfGenerator';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import { loadCurrencyImages } from '../../utils/currencyImageLoader';
import './WorksheetsHub.css';

const getSubjectIcon = (subjectName) => {
    if (!subjectName) return '📝';
    const s = subjectName.toUpperCase();
    if (s.includes('MATH')) return '📐';
    if (s.includes('ENGLISH')) return '📚';
    if (s.includes('SCIENCE')) return '🔬';
    if (s.includes('HISTORY')) return '🏛️';
    if (s.includes('GEOGRAPHY')) return '🌍';
    if (s.includes('SOCIAL')) return '🤝';
    if (s.includes('COMPUTER') || s.includes('IT')) return '💻';
    if (s.includes('HINDI') || s.includes('TELUGU') || s.includes('LANGUAGE') || s.includes('SANSKRIT')) return '🗣️';
    if (s.includes('ART')) return '🎨';
    if (s.includes('MUSIC')) return '🎵';
    return '⭐';
};

export default function WorksheetsHub() {
    const config = getConfig();

    // Main Mode: 'custom-generators' or 'question-bank'
    const [mainMode, setMainMode] = useState('custom-generators');

    // --- 🚀 NEW: Subject Grouping for User Friendliness ---
    const [activeSubjectGroup, setActiveSubjectGroup] = useState('Math');
    
    // Custom Sub-modes
    const [activeCategory, setActiveCategory] = useState('multiplicationTables');
    const [mathMode, setMathMode] = useState('templates'); // 'templates' or 'custom'

    // Question Bank State
    const [activeTab, setActiveTab] = useState('by-grade');
    const [orderedGrades, setOrderedGrades] = useState([]);
    const [gradeSubjectMap, setGradeSubjectMap] = useState({});
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loadedQuestions, setLoadedQuestions] = useState([]);
    const [responseTime, setResponseTime] = useState(null);
    const [expandedPreview, setExpandedPreview] = useState(false);

    // Common State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Preview Modal State
    const [previewModal, setPreviewModal] = useState({ open: false, pdfUrl: null, template: null });

    // Format Preferences (horizontal vs vertical)
    const [formatPreference, setFormatPreference] = useState({
        simpleAddition: 'vertical', simpleSubtraction: 'vertical', simpleMultiplication: 'vertical', simpleDivision: 'vertical',
        addition: 'horizontal', subtraction: 'horizontal', multiplication: 'horizontal', division: 'horizontal',
        romanNumeralsBasic: 'horizontal', romanNumeralsAdvanced: 'horizontal', romanToArabic: 'horizontal', arabicToRoman: 'horizontal',
        timeClock: 'horizontal', moneyCurrency: 'horizontal', measurements: 'horizontal', patterns: 'horizontal',
        multiplicationTables: 'vertical', numberWriting: 'horizontal', mixedOperations: 'horizontal'
    });

    // Custom Parameters (Combined Original Math + New Writing)
    const [customParams, setCustomParams] = useState({
        multiplicationTables: { from: 1, to: 10 },
        simpleAddition: { count: 30, max: 20, difficulty: 'easy' },
        simpleSubtraction: { count: 30, max: 20, difficulty: 'easy' },
        simpleMultiplication: { count: 30, max: 10, difficulty: 'easy' },
        simpleDivision: { count: 30, max: 50, difficulty: 'easy' },
        addition: { count: 20, max: 100, difficulty: 'easy' },
        subtraction: { count: 20, max: 100, difficulty: 'easy' },
        multiplication: { count: 20, max: 12, difficulty: 'easy' },
        division: { count: 20, max: 144, difficulty: 'easy' },
        romanNumeralsBasic: { count: 20, max: 10, difficulty: 'easy' },
        romanNumeralsAdvanced: { count: 20, max: 1000, difficulty: 'medium' },
        romanToArabic: { count: 20, max: 100, difficulty: 'easy' },
        arabicToRoman: { count: 20, max: 100, difficulty: 'easy' },
        timeClock: { count: 20, difficulty: 'easy' },
        moneyCurrency: { count: 20, difficulty: 'easy' },
        measurements: { count: 20, difficulty: 'easy' },
        patterns: { count: 20, difficulty: 'easy' },
        numberWriting: { from: 1, to: 100, percentage: 50 },
        mixedOperations: { count: 20, max: 100, difficulty: 'easy' },
        // Writing Practice Params
        english4Line: { text: 'Aa Bb Cc', lines: 12 },
        hindi2Line: { text: 'अ आ इ ई', lines: 10 },
        mathGrid: { gridSize: 10 },
        cursiveWriting: { text: 'Cursive Practice', lines: 12 },
        storyPaper: { is4Line: false, lines: 8 }
    });

    // Question Bank Form
    const [worksheetForm, setWorksheetForm] = useState({
        topic: '', difficulty: 'MEDIUM', count: 20, randomize: true
    });

    // --- 🚀 NEW: Clearly Categorized UI Definitions ---
    const subjectGroups = [
        { id: 'Math', name: 'Mathematics', icon: '🧮', color: '#10b981', desc: 'Numbers, Operations & Logic' },
        { id: 'Writing', name: 'Handwriting & Stories', icon: '✍️', color: '#3b82f6', desc: 'Cursive, 4-Line & Story Paper' }
    ];

    const allCategories = [
        // Writing & English Group
        { id: 'english4Line', name: '4-Line English Practice', icon: '📝', color: '#3b82f6', subjectGroup: 'Writing' },
        { id: 'cursiveWriting', name: 'Cursive Generator', icon: '🖋️', color: '#8b5cf6', subjectGroup: 'Writing' },
        { id: 'storyPaper', name: 'Story Writing Paper', icon: '📖', color: '#ec4899', subjectGroup: 'Writing' },
        { id: 'hindi2Line', name: '2-Line Regional', icon: '✍️', color: '#f59e0b', subjectGroup: 'Writing' },

        // Math Group
        { id: 'mathGrid', name: 'Math Square Grid', icon: '🧮', color: '#10b981', subjectGroup: 'Math' },
        { id: 'multiplicationTables', name: 'Multiplication Tables', icon: '📊', color: '#667eea', subjectGroup: 'Math' },
        { id: 'simpleAddition', name: 'Simple Addition (1+2)', icon: '➕', color: '#56ab2f', subjectGroup: 'Math' },
        { id: 'simpleSubtraction', name: 'Simple Subtraction (5-2)', icon: '➖', color: '#f093fb', subjectGroup: 'Math' },
        { id: 'simpleMultiplication', name: 'Simple Multiplication (2×3)', icon: '✖️', color: '#fa709a', subjectGroup: 'Math' },
        { id: 'simpleDivision', name: 'Simple Division (6÷2)', icon: '➗', color: '#4facfe', subjectGroup: 'Math' },
        { id: 'addition', name: 'Advanced Addition', icon: '➕', color: '#56ab2f', subjectGroup: 'Math' },
        { id: 'subtraction', name: 'Advanced Subtraction', icon: '➖', color: '#f093fb', subjectGroup: 'Math' },
        { id: 'multiplication', name: 'Advanced Multiplication', icon: '✖️', color: '#fa709a', subjectGroup: 'Math' },
        { id: 'division', name: 'Advanced Division', icon: '➗', color: '#4facfe', subjectGroup: 'Math' },
        { id: 'mixedOperations', name: 'Mixed Operations', icon: '🔢', color: '#fa8bff', subjectGroup: 'Math' },
        { id: 'romanNumeralsBasic', name: 'Roman Numerals (I-X)', icon: 'Ⅰ', color: '#8e44ad', subjectGroup: 'Math' },
        { id: 'romanNumeralsAdvanced', name: 'Roman Numerals (X-M)', icon: 'Ⅹ', color: '#9b59b6', subjectGroup: 'Math' },
        { id: 'romanToArabic', name: 'Roman → Number', icon: '🔄', color: '#e74c3c', subjectGroup: 'Math' },
        { id: 'arabicToRoman', name: 'Number → Roman', icon: '🔃', color: '#c0392b', subjectGroup: 'Math' },
        { id: 'timeClock', name: 'Time & Clock', icon: '🕐', color: '#3498db', subjectGroup: 'Math' },
        { id: 'moneyCurrency', name: 'Money & Currency', icon: '💰', color: '#27ae60', subjectGroup: 'Math' },
        { id: 'measurements', name: 'Measurements', icon: '📏', color: '#16a085', subjectGroup: 'Math' },
        { id: 'patterns', name: 'Patterns & Sequences', icon: '🔢', color: '#e67e22', subjectGroup: 'Math' },
        { id: 'numberWriting', name: 'Number Writing', icon: '✏️', color: '#43e97b', subjectGroup: 'Math' }
    ];

    // Filter tabs based on selected parent subject
    const activeCategories = allCategories.filter(c => c.subjectGroup === activeSubjectGroup);
    const noAnswersCategories = ['numberWriting', 'english4Line', 'hindi2Line', 'mathGrid', 'cursiveWriting', 'storyPaper'];

    // Auto-select first tab when switching subjects
    useEffect(() => {
        if (activeSubjectGroup === 'Math') setActiveCategory('multiplicationTables');
        if (activeSubjectGroup === 'Writing') setActiveCategory('english4Line');
    }, [activeSubjectGroup]);

    useEffect(() => {
        if (mainMode === 'question-bank' && orderedGrades.length === 0) {
            loadGradesAndSubjects();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainMode]);

    useEffect(() => {
        const loadImages = async () => {
            try {
                const currencyImages = await loadCurrencyImages();
                PDFGenerator.setCurrencyImages(currencyImages);
            } catch (error) {}
        };
        loadImages();
    }, []);

    // Sync Grades and Subjects from API for Question Bank Mode
    const loadGradesAndSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = config.GATEWAY_URL || config.ADMIN_BASE_URL;
            const response = await axios.get(`${baseUrl}/admin-assessment/v1/grade-subjects`, { 
                headers: { Authorization: token ? `Bearer ${token}` : '' } 
            });

            let activeGrades = (response.data || []).filter(g => g.isActive);
            activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

            const gradesList = activeGrades.map(g => g.gradeCode);
            const subjMap = {};

            activeGrades.forEach(g => {
                subjMap[g.gradeCode] = (g.subjects || [])
                    .filter(s => !s.isTechnology && !s.technology)
                    .map(s => s.subjectName);
            });

            setOrderedGrades(gradesList);
            setGradeSubjectMap(subjMap);

            if (gradesList.length > 0) {
                setSelectedGrade(gradesList.includes('V') ? 'V' : gradesList[0]);
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    };

    // ==================== CUSTOM GENERATORS LOGIC ====================

    const generatePDFForTemplate = (template, includeAnswers) => {
        const format = formatPreference[activeCategory] || 'vertical';
        let doc;

        // Math Logic
        if (activeCategory === 'simpleAddition') {
            doc = format === 'vertical' ? PDFGenerator.generateSimpleAdditionWorksheet(template.count, template.max, includeAnswers) : PDFGenerator.generateAdditionWorksheet(template.count, template.max, 'easy', includeAnswers);
        } else if (activeCategory === 'simpleSubtraction') {
            doc = format === 'vertical' ? PDFGenerator.generateSimpleSubtractionWorksheet(template.count, template.max, includeAnswers) : PDFGenerator.generateSubtractionWorksheet(template.count, template.max, 'easy', includeAnswers);
        } else if (activeCategory === 'simpleMultiplication') {
            doc = format === 'vertical' ? PDFGenerator.generateSimpleMultiplicationWorksheet(template.count, template.max, includeAnswers) : PDFGenerator.generateMultiplicationWorksheet(template.count, template.max, 'easy', includeAnswers);
        } else if (activeCategory === 'simpleDivision') {
            doc = format === 'vertical' ? PDFGenerator.generateSimpleDivisionWorksheet(template.count, template.max, includeAnswers) : PDFGenerator.generateDivisionWorksheet(template.count, template.max, 'easy', includeAnswers);
        } else if (activeCategory === 'multiplicationTables') {
            doc = PDFGenerator.generateMultiplicationTable(template.from, template.to, includeAnswers);
        } else if (activeCategory === 'addition') {
            doc = PDFGenerator.generateAdditionWorksheet(template.count, template.max, template.difficulty, includeAnswers);
        } else if (activeCategory === 'subtraction') {
            doc = PDFGenerator.generateSubtractionWorksheet(template.count, template.max, template.difficulty, includeAnswers);
        } else if (activeCategory === 'multiplication') {
            doc = PDFGenerator.generateMultiplicationWorksheet(template.count, template.max, template.difficulty, includeAnswers);
        } else if (activeCategory === 'division') {
            doc = PDFGenerator.generateDivisionWorksheet(template.count, template.max, template.difficulty, includeAnswers);
        } else if (activeCategory === 'romanNumeralsBasic') {
            doc = PDFGenerator.generateRomanNumeralsBasicWorksheet(template.count, includeAnswers);
        } else if (activeCategory === 'romanNumeralsAdvanced') {
            doc = PDFGenerator.generateRomanNumeralsAdvancedWorksheet(template.count, includeAnswers);
        } else if (activeCategory === 'romanToArabic') {
            doc = PDFGenerator.generateRomanToArabicWorksheet(template.count, template.max, includeAnswers);
        } else if (activeCategory === 'arabicToRoman') {
            doc = PDFGenerator.generateArabicToRomanWorksheet(template.count, template.max, includeAnswers);
        } else if (activeCategory === 'timeClock') {
            doc = PDFGenerator.generateTimeClockWorksheet(template.count, template.difficulty, includeAnswers);
        } else if (activeCategory === 'moneyCurrency') {
            doc = PDFGenerator.generateMoneyCurrencyWorksheet(template.count, template.difficulty, includeAnswers);
        } else if (activeCategory === 'measurements') {
            doc = PDFGenerator.generateMeasurementsWorksheet(template.count, template.difficulty, includeAnswers);
        } else if (activeCategory === 'patterns') {
            doc = PDFGenerator.generatePatternsWorksheet(template.count, template.difficulty, includeAnswers);
        } else if (activeCategory === 'numberWriting') {
            doc = PDFGenerator.generateNumberWritingWorksheet(template.from, template.to, template.percentage);
        } else if (activeCategory === 'mixedOperations') {
            doc = PDFGenerator.generateMixedOperationsWorksheet(template.count, template.max, template.difficulty, includeAnswers);
        } 
        
        // Writing Logic
        else if (activeCategory === 'english4Line') {
            doc = PDFGenerator.generate4LineWorksheet(template.text, template.lines || 12, false);
        } else if (activeCategory === 'hindi2Line') {
            doc = PDFGenerator.generate2LineWorksheet(template.text, template.lines || 10);
        } else if (activeCategory === 'mathGrid') {
            doc = PDFGenerator.generateMathGridWorksheet(template.gridSize || 10);
        } else if (activeCategory === 'cursiveWriting') {
            doc = PDFGenerator.generate4LineWorksheet(template.text, template.lines || 12, true);
        } else if (activeCategory === 'storyPaper') {
            doc = PDFGenerator.generateStoryPaperWorksheet(template.is4Line, template.lines || 8);
        }

        return doc;
    };

    const generateFromTemplate = (template, includeAnswers, print = false) => {
        setLoading(true);
        try {
            const doc = generatePDFForTemplate(template, includeAnswers);
            if (print) {
                PDFGenerator.printPDF(doc);
            } else {
                PDFGenerator.downloadPDF(doc, `${template.name.replace(/\s+/g, '_')}_${includeAnswers ? 'answers' : 'worksheet'}.pdf`);
            }
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Failed to generate worksheet' });
        } finally {
            setLoading(false);
        }
    };

    const generateCustom = (includeAnswers, print = false) => {
        setLoading(true);
        try {
            const params = customParams[activeCategory];
            let doc = generatePDFForTemplate(params, includeAnswers);
            
            if (print) {
                PDFGenerator.printPDF(doc);
            } else {
                PDFGenerator.downloadPDF(doc, `custom_${activeCategory}_${includeAnswers ? 'answers' : 'worksheet'}.pdf`);
            }
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Failed to generate custom worksheet' });
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

    const previewWorksheet = (template) => {
        try {
            setLoading(true);
            let doc = generatePDFForTemplate(template, false);
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPreviewModal({ open: true, pdfUrl, template });
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Failed to generate preview' });
        } finally {
            setLoading(false);
        }
    };

    const closePreview = () => {
        if (previewModal.pdfUrl) URL.revokeObjectURL(previewModal.pdfUrl);
        setPreviewModal({ open: false, pdfUrl: null, template: null });
    };

    // ==================== QUESTION BANK LOGIC ====================

    const handleLoadQuestions = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setLoadedQuestions([]);

        const startTime = Date.now();
        try {
            const payload = {
                grade: selectedGrade,
                subject: selectedSubject,
                topic: worksheetForm.topic,
                difficulty: worksheetForm.difficulty,
                count: worksheetForm.count,
                randomize: worksheetForm.randomize
            };
            
            const endpoint = worksheetForm.topic 
                ? `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-topic`
                : `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-subject`;

            const response = await axios.post(endpoint, payload);
            const data = response.data;
            const clientResponseTime = Date.now() - startTime;

            if (data.success && data.questions && data.questions.length > 0) {
                setLoadedQuestions(data.questions);
                setResponseTime({ server: data.responseTimeMs, client: clientResponseTime });
                setMessage({ type: 'success', text: `✅ Loaded ${data.questions.length} questions` });
            } else {
                setMessage({ type: 'warning', text: `⚠️ No questions found for this configuration.` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load questions from database.' });
        } finally {
            setLoading(false);
        }
    };

    const generateWorksheetPDF = (includeAnswers = false, print = false) => {
        if (loadedQuestions.length === 0) return alert('Please load questions first!');
        try {
            setLoading(true);
            const doc = PDFGenerator.generateCustomQuestionWorksheet(loadedQuestions, {
                title: `${selectedSubject || 'Math'} Worksheet - Grade ${selectedGrade.replace('_', ' ')}`,
                grade: selectedGrade,
                topic: worksheetForm.topic,
                includeAnswers: includeAnswers,
                showDifficulty: false
            });

            if (print) {
                PDFGenerator.printPDF(doc);
            } else {
                PDFGenerator.downloadPDF(doc, `worksheet_${selectedGrade}_${Date.now()}_${includeAnswers ? 'answers' : 'questions'}.pdf`);
            }
        } catch (error) {
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="worksheets-hub" role="main">
            {/* SEO-Optimized Header */}
            <header className="worksheets-header">
                <h1 className="h1-seo">Free Printable Educational Worksheets & Generators</h1>
                <p className="subtitle">
                    Generate custom handwriting paper, infinite math problems, or pull from our verified school curriculum bank.
                </p>
            </header>

            {/* High-Level Mode Selection */}
            <nav aria-label="Worksheet Tools" className="main-mode-selector">
                <button
                    className={`main-mode-btn ${mainMode === 'custom-generators' ? 'active' : ''}`}
                    onClick={() => setMainMode('custom-generators')}
                    aria-pressed={mainMode === 'custom-generators'}
                    style={{ background: mainMode === 'custom-generators' ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }}
                >
                    <span className="mode-icon" aria-hidden="true">🎨</span>
                    <div className="mode-info">
                        <h2>Infinite Generators</h2>
                        <small>Handwriting, Math Grids & Stories</small>
                    </div>
                </button>

                <button
                    className={`main-mode-btn ${mainMode === 'question-bank' ? 'active' : ''}`}
                    onClick={() => setMainMode('question-bank')}
                    aria-pressed={mainMode === 'question-bank'}
                    style={{ background: mainMode === 'question-bank' ? '#10b981' : 'rgba(255,255,255,0.1)' }}
                >
                    <span className="mode-icon" aria-hidden="true">🗃️</span>
                    <div className="mode-info">
                        <h2>School Question Bank</h2>
                        <small>Curated Core DB Curriculum</small>
                    </div>
                </button>
            </nav>

            {/* ==================== CUSTOM GENERATORS SECTION ==================== */}
            {mainMode === 'custom-generators' && (
                <section aria-labelledby="custom-generators-heading" className="custom-math-section">
                    <h2 id="custom-generators-heading" className="visually-hidden">Custom Content Generators</h2>
                    
                    {/* 🚀 BEAUTIFUL SUBJECT HIGHLIGHTING */}
                    <div className="subject-group-nav" role="group" aria-label="Select Subject Type" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                        {subjectGroups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => setActiveSubjectGroup(group.id)}
                                aria-pressed={activeSubjectGroup === group.id}
                                className={`subject-group-btn ${activeSubjectGroup === group.id ? 'active' : ''}`}
                                style={{
                                    padding: '15px 30px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'left',
                                    border: `3px solid ${activeSubjectGroup === group.id ? group.color : '#cbd5e1'}`,
                                    background: activeSubjectGroup === group.id ? `${group.color}15` : 'white',
                                    color: activeSubjectGroup === group.id ? group.color : '#475569',
                                    boxShadow: activeSubjectGroup === group.id ? `0 10px 20px ${group.color}33` : '0 4px 6px rgba(0,0,0,0.05)',
                                    transform: activeSubjectGroup === group.id ? 'translateY(-2px)' : 'none'
                                }}
                            >
                                <span style={{ fontSize: '2.5rem' }} aria-hidden="true">{group.icon}</span>
                                <div>
                                    <div style={{ fontWeight: '900', fontSize: '1.2rem', marginBottom: '2px' }}>{group.name}</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: '600' }}>{group.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mode-toggle" role="group" aria-label="Template or Custom">
                        <button className={`mode-btn ${mathMode === 'templates' ? 'active' : ''}`} onClick={() => setMathMode('templates')} aria-pressed={mathMode === 'templates'}>
                            ⚡ Quick Templates
                        </button>
                        <button className={`mode-btn ${mathMode === 'custom' ? 'active' : ''}`} onClick={() => setMathMode('custom')} aria-pressed={mathMode === 'custom'}>
                            🎨 Custom Generator
                        </button>
                    </div>

                    {/* Contextual Category Sub-Tabs */}
                    <nav aria-label="Worksheet Categories" className="category-tabs">
                        {activeCategories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                aria-pressed={activeCategory === cat.id}
                                style={{
                                    borderColor: activeCategory === cat.id ? cat.color : 'transparent',
                                    background: activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.2)'
                                }}
                            >
                                <span className="tab-icon" aria-hidden="true">{cat.icon}</span>
                                <span className="tab-name">{cat.name}</span>
                                {mathMode === 'templates' && <span className="badge" title={`${WORKSHEET_TEMPLATES[cat.id]?.length || 0} templates available`}>{WORKSHEET_TEMPLATES[cat.id]?.length || 0}</span>}
                            </button>
                        ))}
                    </nav>

                    {/* Math Format Toggles */}
                    {mathMode === 'templates' && activeSubjectGroup === 'Math' && ['simpleAddition', 'simpleSubtraction', 'simpleMultiplication', 'simpleDivision', 'addition', 'subtraction', 'multiplication', 'division'].includes(activeCategory) && (
                        <div className="format-toggle-container">
                            <div className="format-info">
                                <span className="format-label">Problem Layout:</span>
                            </div>
                            <div className="format-toggle-buttons">
                                <button className={`format-option ${formatPreference[activeCategory] === 'vertical' ? 'active' : ''}`} onClick={() => setFormatPreference(prev => ({ ...prev, [activeCategory]: 'vertical' }))}>
                                    <div className="format-icon">📐</div>
                                    <div className="format-name">Vertical</div>
                                </button>
                                <button className={`format-option ${formatPreference[activeCategory] === 'horizontal' ? 'active' : ''}`} onClick={() => setFormatPreference(prev => ({ ...prev, [activeCategory]: 'horizontal' }))}>
                                    <div className="format-icon">➡️</div>
                                    <div className="format-name">Horizontal</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {mathMode === 'templates' && (
                        <div className="templates-grid">
                            {WORKSHEET_TEMPLATES[activeCategory]?.map(template => (
                                <article key={template.id} className="template-card">
                                    <header className="template-header">
                                        <h3>{template.name}</h3>
                                        <span className="template-id" style={{ background: allCategories.find(c => c.id === activeCategory)?.color }} title={`Template ID: ${template.id}`}>
                                            #{template.id}
                                        </span>
                                    </header>
                                    <p className="template-description">{template.description}</p>
                                    
                                    <footer className="template-actions" aria-label={`Actions for ${template.name}`}>
                                        <button className="btn-icon preview-btn" onClick={() => previewWorksheet(template)} disabled={loading} aria-label={`Preview ${template.name}`} title="Preview worksheet">👁️</button>
                                        <button className="btn-icon download-btn" onClick={() => generateFromTemplate(template, false)} disabled={loading} aria-label={`Download ${template.name}`} title="Download worksheet">📥</button>
                                        <button className="btn-icon print-btn" onClick={() => generateFromTemplate(template, false, true)} disabled={loading} aria-label={`Print ${template.name}`} title="Print worksheet">🖨️</button>
                                        
                                        {!noAnswersCategories.includes(activeCategory) && (
                                            <button className="btn-icon answer-btn" onClick={() => generateFromTemplate(template, true)} disabled={loading} aria-label={`Download answers for ${template.name}`} title="Download answers">✅</button>
                                        )}
                                    </footer>
                                </article>
                            ))}
                        </div>
                    )}

                    {mathMode === 'custom' && (
                        <section className="custom-form" aria-labelledby="custom-settings-heading">
                            <header className="custom-header" style={{ borderColor: allCategories.find(c => c.id === activeCategory)?.color }}>
                                <h3 id="custom-settings-heading">
                                    <span aria-hidden="true">{allCategories.find(c => c.id === activeCategory)?.icon}</span> Configure {allCategories.find(c => c.id === activeCategory)?.name}
                                </h3>
                            </header>
                            
                            <div className="form-grid">
                                {['english4Line', 'cursiveWriting', 'hindi2Line'].includes(activeCategory) && (
                                    <>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label htmlFor="tracingText">Tracing Text (Optional):</label>
                                            <input id="tracingText" type="text" value={customParams[activeCategory].text} onChange={(e) => updateParam('text', e.target.value)} placeholder="Leave blank for empty paper" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lineCount">Number of Lines:</label>
                                            <input id="lineCount" type="number" value={customParams[activeCategory].lines} onChange={(e) => updateParam('lines', parseInt(e.target.value))} min="5" max="20" />
                                        </div>
                                    </>
                                )}
                                {activeCategory === 'storyPaper' && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="lineStyle">Line Style:</label>
                                            <select id="lineStyle" value={customParams[activeCategory].is4Line} onChange={(e) => updateParam('is4Line', e.target.value === 'true')}>
                                                <option value="false">Standard Single Lines</option>
                                                <option value="true">4-Line (For Early Learners)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="storyLineCount">Number of Lines:</label>
                                            <input id="storyLineCount" type="number" value={customParams[activeCategory].lines} onChange={(e) => updateParam('lines', parseInt(e.target.value))} min="3" max="15" />
                                        </div>
                                    </>
                                )}
                                {activeCategory === 'mathGrid' && (
                                    <div className="form-group">
                                        <label htmlFor="gridSize">Grid Size (mm):</label>
                                        <input id="gridSize" type="number" value={customParams[activeCategory].gridSize} onChange={(e) => updateParam('gridSize', parseInt(e.target.value))} min="2" max="30" />
                                    </div>
                                )}
                                {['addition', 'subtraction', 'multiplication', 'division', 'mixedOperations'].includes(activeCategory) && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="problemCount">Number of Problems:</label>
                                            <input id="problemCount" type="number" value={customParams[activeCategory].count} onChange={(e) => updateParam('count', parseInt(e.target.value))} min="10" max="100" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="maxNumber">Max Number Range:</label>
                                            <input id="maxNumber" type="number" value={customParams[activeCategory].max} onChange={(e) => updateParam('max', parseInt(e.target.value))} min="10" max="1000" />
                                        </div>
                                    </>
                                )}
                                {activeCategory === 'multiplicationTables' && (
                                    <>
                                        <div className="form-group">
                                            <label>From Table:</label>
                                            <input type="number" value={customParams[activeCategory].from} onChange={(e) => updateParam('from', parseInt(e.target.value))} min="1" max="20" />
                                        </div>
                                        <div className="form-group">
                                            <label>To Table:</label>
                                            <input type="number" value={customParams[activeCategory].to} onChange={(e) => updateParam('to', parseInt(e.target.value))} min={customParams[activeCategory].from} max="20" />
                                        </div>
                                    </>
                                )}
                                {['romanNumeralsBasic', 'romanNumeralsAdvanced', 'romanToArabic', 'arabicToRoman'].includes(activeCategory) && (
                                    <>
                                        <div className="form-group">
                                            <label>Problems:</label>
                                            <input type="number" value={customParams[activeCategory].count} onChange={(e) => updateParam('count', parseInt(e.target.value))} min="10" max="100" />
                                        </div>
                                    </>
                                )}
                                {activeCategory === 'numberWriting' && (
                                    <>
                                        <div className="form-group">
                                            <label>From:</label>
                                            <input type="number" value={customParams[activeCategory].from} onChange={(e) => updateParam('from', parseInt(e.target.value))} min="1" max="1000" />
                                        </div>
                                        <div className="form-group">
                                            <label>To:</label>
                                            <input type="number" value={customParams[activeCategory].to} onChange={(e) => updateParam('to', parseInt(e.target.value))} min={customParams[activeCategory].from} max="1000" />
                                        </div>
                                        <div className="form-group">
                                            <label>Blank %:</label>
                                            <input type="range" value={customParams[activeCategory].percentage} onChange={(e) => updateParam('percentage', parseInt(e.target.value))} min="0" max="100" />
                                            <span>{customParams[activeCategory].percentage}%</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="generate-buttons">
                                <button className="btn-generate worksheet" onClick={() => generateCustom(false)} disabled={loading} style={{ background: allCategories.find(c => c.id === activeCategory)?.color }}>📄 Download PDF</button>
                                <button className="btn-generate print" onClick={() => generateCustom(false, true)} disabled={loading} style={{ background: '#6b7280' }}>🖨️ Print Direct</button>
                                {!noAnswersCategories.includes(activeCategory) && (
                                    <button className="btn-generate answer" onClick={() => generateCustom(true)} disabled={loading} style={{ background: allCategories.find(c => c.id === activeCategory)?.color }}>✅ Download Key</button>
                                )}
                            </div>
                        </section>
                    )}
                </section>
            )}

            {/* ==================== QUESTION BANK SECTION ==================== */}
            {mainMode === 'question-bank' && (
                <section aria-labelledby="question-bank-heading" className="worksheets-content" style={{ display: 'block' }}>
                    <div style={{ background: '#ffffff', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
                        <h2 id="question-bank-heading" style={{ fontSize: '2rem', color: '#1e293b', textAlign: 'center', marginBottom: '30px' }}>Subject Question Bank 📚</h2>
                        <p className="visually-hidden">Create worksheets from our verified curriculum question bank.</p>

                        <nav aria-label="Grade Selection" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '20px' }}>
                            {orderedGrades.map(grade => (
                                <button
                                    key={grade}
                                    onClick={() => { setSelectedGrade(grade); setSelectedSubject(null); setLoadedQuestions([]); }}
                                    aria-pressed={selectedGrade === grade}
                                    style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer', background: selectedGrade === grade ? '#0f172a' : '#f1f5f9', color: selectedGrade === grade ? 'white' : '#475569', transition: 'all 0.2s' }}
                                >
                                    Grade {grade.replace('_', ' ')}
                                </button>
                            ))}
                        </nav>

                        {selectedGrade && gradeSubjectMap[selectedGrade] && gradeSubjectMap[selectedGrade].length > 0 ? (
                            <div role="group" aria-label="Subject Selection" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                                {gradeSubjectMap[selectedGrade].map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => { setSelectedSubject(subject); setLoadedQuestions([]); }}
                                        aria-pressed={selectedSubject === subject}
                                        style={{ padding: '15px', borderRadius: '16px', border: `2px solid ${selectedSubject === subject ? '#10b981' : '#e2e8f0'}`, background: selectedSubject === subject ? '#ecfdf5' : 'white', cursor: 'pointer', textAlign: 'center', transition: '0.2s', boxShadow: selectedSubject === subject ? '0 4px 15px rgba(16,185,129,0.2)' : 'none', width: '100%' }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '5px' }} aria-hidden="true">{getSubjectIcon(subject)}</div>
                                        <div style={{ fontWeight: 'bold', color: selectedSubject === subject ? '#065f46' : '#475569' }}>{subject.replace('_', ' ')}</div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', color: '#64748b', marginBottom: '30px', border: '1px dashed #cbd5e1' }}>
                                No subjects assigned to this grade yet.
                            </div>
                        )}

                        {selectedSubject && (
                            <form onSubmit={handleLoadQuestions} aria-label="Question Configuration" style={{ background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                    <div style={{ flex: '1 1 200px' }}>
                                        <label htmlFor="qbDifficulty" style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>Difficulty Level</label>
                                        <select id="qbDifficulty" value={worksheetForm.difficulty} onChange={(e) => setWorksheetForm({...worksheetForm, difficulty: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                            <option value="EASY">🟢 Easy</option>
                                            <option value="MEDIUM">🟡 Medium</option>
                                            <option value="COMPLEX">🔴 Complex</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: '1 1 200px' }}>
                                        <label htmlFor="qbCount" style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>Total Questions</label>
                                        <input id="qbCount" type="number" min="5" max="100" value={worksheetForm.count} onChange={(e) => setWorksheetForm({...worksheetForm, count: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div style={{ flex: '1 1 200px' }}>
                                        <label htmlFor="qbTopic" style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>Specific Topic (Optional)</label>
                                        <input id="qbTopic" type="text" placeholder="e.g. Algebra" value={worksheetForm.topic} onChange={(e) => setWorksheetForm({...worksheetForm, topic: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: '#3b82f6', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
                                    {loading ? 'Fetching questions...' : '⚡ Fetch Questions from Database'}
                                </button>
                            </form>
                        )}
                    </div>

                    {loadedQuestions.length > 0 && (
                        <article className="results-panel" style={{ width: '100%', maxWidth: '100%' }}>
                            <div className="results-container">
                                <header className="results-summary">
                                    <div className="summary-badge">
                                        <span className="badge-icon" aria-hidden="true">✅</span>
                                        <div className="badge-info">
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{loadedQuestions.length} Questions Prepared</h3>
                                            <small>Ready to compile into PDF</small>
                                        </div>
                                    </div>
                                </header>

                                <footer className="download-section">
                                    <button className="download-btn primary" onClick={() => generateWorksheetPDF(false)} disabled={loading} aria-label="Download student worksheet PDF">📄 Download Worksheet</button>
                                    <button className="download-btn print" onClick={() => generateWorksheetPDF(false, true)} disabled={loading} aria-label="Print worksheet directly">🖨️ Print Directly</button>
                                    <button className="download-btn secondary" onClick={() => generateWorksheetPDF(true)} disabled={loading} aria-label="Download teacher answer key">✅ Download Answer Key</button>
                                </footer>
                            </div>
                        </article>
                    )}
                </section>
            )}

            {/* Accessibility and UI Overlays */}
            {loading && (
                <div className="loading-overlay" role="alert" aria-busy="true">
                    <div className="spinner-large" aria-hidden="true"></div>
                    <p>Generating Document...</p>
                </div>
            )}

            {message && message.type === 'error' && (
                <div role="alert" style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#ef4444', color: 'white', padding: '15px 20px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {message.text}
                </div>
            )}

            {previewModal.open && (
                <div className="preview-modal-overlay" onClick={closePreview} role="dialog" aria-modal="true" aria-labelledby="preview-heading">
                    <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <header className="preview-modal-header">
                            <h2 id="preview-heading">📄 Document Preview</h2>
                            <button className="preview-close-btn" onClick={closePreview} aria-label="Close preview">✕</button>
                        </header>
                        <div className="preview-modal-body">
                            {previewModal.pdfUrl && <iframe src={previewModal.pdfUrl} title="PDF Preview" className="preview-pdf-iframe" />}
                        </div>
                        <footer className="preview-modal-footer">
                            <button className="preview-action-btn download-btn" onClick={() => { generateFromTemplate(previewModal.template, false); closePreview(); }}>📥 Download</button>
                            {!noAnswersCategories.includes(activeCategory) && <button className="preview-action-btn answer-btn" onClick={() => { generateFromTemplate(previewModal.template, true); closePreview(); }}>✅ Answers</button>}
                        </footer>
                    </div>
                </div>
            )}
        </main>
    );
}