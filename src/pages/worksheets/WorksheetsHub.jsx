import React, { useState, useEffect } from 'react';
import { getConfig } from '../../Config';
import axios from 'axios';
import { PDFGenerator } from '../../utils/pdfGenerator';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import { loadCurrencyImages } from '../../utils/currencyImageLoader';
import './WorksheetsHub.css';

/**
 * 🚀 Ultimate Worksheets Hub - Future-Proof Design
 * Combines custom math generators + question bank + AI-generated content
 * Designed to scale for the next 200 years of educational technology
 */
export default function WorksheetsHub() {
    const config = getConfig();

    // Main Mode: 'custom-math', 'question-bank', 'templates'
    const [mainMode, setMainMode] = useState('custom-math');

    // Custom Math Sub-modes
    const [activeCategory, setActiveCategory] = useState('multiplicationTables');
    const [mathMode, setMathMode] = useState('templates'); // 'templates' or 'custom'

    // Question Bank State
    const [activeTab, setActiveTab] = useState('by-grade');
    const [grades, setGrades] = useState([]);
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
        simpleAddition: 'vertical',
        simpleSubtraction: 'vertical',
        simpleMultiplication: 'vertical',
        simpleDivision: 'vertical',
        addition: 'horizontal',
        subtraction: 'horizontal',
        multiplication: 'horizontal',
        division: 'horizontal',
        romanNumeralsBasic: 'horizontal',
        romanNumeralsAdvanced: 'horizontal',
        romanToArabic: 'horizontal',
        arabicToRoman: 'horizontal',
        timeClock: 'horizontal',
        moneyCurrency: 'horizontal',
        measurements: 'horizontal',
        patterns: 'horizontal',
        multiplicationTables: 'vertical',
        numberWriting: 'horizontal',
        mixedOperations: 'horizontal'
    });

    // Custom Math Parameters
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
        mixedOperations: { count: 20, max: 100, difficulty: 'easy' }
    });

    // Question Bank Form
    const [worksheetForm, setWorksheetForm] = useState({
        grade: 'V',
        subject: 'Math',
        topic: '',
        difficulty: 'MEDIUM',
        count: 20,
        randomize: true
    });

    // Math categories
    const categories = [
        { id: 'multiplicationTables', name: 'Multiplication Tables', icon: '📊', color: '#667eea' },
        { id: 'simpleAddition', name: 'Simple Addition (1+2)', icon: '➕', color: '#56ab2f' },
        { id: 'simpleSubtraction', name: 'Simple Subtraction (5-2)', icon: '➖', color: '#f093fb' },
        { id: 'simpleMultiplication', name: 'Simple Multiplication (2×3)', icon: '✖️', color: '#fa709a' },
        { id: 'simpleDivision', name: 'Simple Division (6÷2)', icon: '➗', color: '#4facfe' },
        { id: 'addition', name: 'Advanced Addition', icon: '➕', color: '#56ab2f' },
        { id: 'subtraction', name: 'Advanced Subtraction', icon: '➖', color: '#f093fb' },
        { id: 'multiplication', name: 'Advanced Multiplication', icon: '✖️', color: '#fa709a' },
        { id: 'division', name: 'Advanced Division', icon: '➗', color: '#4facfe' },
        { id: 'romanNumeralsBasic', name: 'Roman Numerals (I-X)', icon: 'Ⅰ', color: '#8e44ad' },
        { id: 'romanNumeralsAdvanced', name: 'Roman Numerals (X-M)', icon: 'Ⅹ', color: '#9b59b6' },
        { id: 'romanToArabic', name: 'Roman → Number', icon: '🔄', color: '#e74c3c' },
        { id: 'arabicToRoman', name: 'Number → Roman', icon: '🔃', color: '#c0392b' },
        { id: 'timeClock', name: 'Time & Clock', icon: '🕐', color: '#3498db' },
        { id: 'moneyCurrency', name: 'Money & Currency', icon: '💰', color: '#27ae60' },
        { id: 'measurements', name: 'Measurements', icon: '📏', color: '#16a085' },
        { id: 'patterns', name: 'Patterns & Sequences', icon: '🔢', color: '#e67e22' },
        { id: 'numberWriting', name: 'Number Writing', icon: '✏️', color: '#43e97b' },
        { id: 'mixedOperations', name: 'Mixed Operations', icon: '🔢', color: '#fa8bff' }
    ];

    const subjects = [
        { value: 'Math', label: '🔢 Math' },
        { value: 'English', label: '📝 English' },
        { value: 'Science', label: '🔬 Science' },
        { value: 'Social Studies', label: '🌍 Social Studies' },
        { value: 'Reading', label: '📚 Reading' }
    ];

    // Load grades on mount
    useEffect(() => {
        if (mainMode === 'question-bank') {
            loadGrades();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainMode]);

    // Load real currency images on mount
    useEffect(() => {
        const loadImages = async () => {
            try {
                const currencyImages = await loadCurrencyImages();
                PDFGenerator.setCurrencyImages(currencyImages);
                console.log('Currency images loaded:', Object.keys(currencyImages.bills).length + Object.keys(currencyImages.coins).length, 'images');
            } catch (error) {
                console.log('Currency images not available, using drawn versions');
            }
        };
        loadImages();
    }, []);

    const loadGrades = async () => {
        try {
            const response = await axios.get(
                `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/available-grades`
            );

            if (response.data.success && response.data.grades && Array.isArray(response.data.grades)) {
                const mappedGrades = response.data.grades.map(grade => ({
                    code: grade.gradeCode,
                    name: grade.gradeName
                }));
                setGrades(mappedGrades);

                const defaultGrade = mappedGrades.find(g => g.code === 'V') || mappedGrades[0];
                if (defaultGrade) {
                    setWorksheetForm(prev => ({ ...prev, grade: defaultGrade.code }));
                }
            }
        } catch (error) {
            console.error('Error loading grades:', error);
            const fallbackGrades = [
                { code: 'V', name: 'Grade 5' },
                { code: 'PROFESSIONAL', name: 'Professional' }
            ];
            setGrades(fallbackGrades);
            setWorksheetForm(prev => ({ ...prev, grade: 'V' }));
        }
    };

    // ==================== CUSTOM MATH GENERATORS ====================

    const generateFromTemplate = (template, includeAnswers, print = false) => {
        setLoading(true);
        try {
            let doc;
            if (activeCategory === 'multiplicationTables') {
                doc = PDFGenerator.generateMultiplicationTable(template.from, template.to, includeAnswers);
            } else if (activeCategory === 'simpleAddition') {
                doc = PDFGenerator.generateSimpleAdditionWorksheet(template.count, template.max, includeAnswers);
            } else if (activeCategory === 'simpleSubtraction') {
                doc = PDFGenerator.generateSimpleSubtractionWorksheet(template.count, template.max, includeAnswers);
            } else if (activeCategory === 'simpleMultiplication') {
                doc = PDFGenerator.generateSimpleMultiplicationWorksheet(template.count, template.max, includeAnswers);
            } else if (activeCategory === 'simpleDivision') {
                doc = PDFGenerator.generateSimpleDivisionWorksheet(template.count, template.max, includeAnswers);
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

            if (print) {
                PDFGenerator.printPDF(doc);
                setMessage({ type: 'success', text: '✅ Opening print dialog...' });
            } else {
                PDFGenerator.downloadPDF(doc, `${template.name.replace(/\s+/g, '_')}_${includeAnswers ? 'answers' : 'worksheet'}.pdf`);
                setMessage({ type: 'success', text: '✅ PDF downloaded successfully!' });
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
            let doc;
            const params = customParams[activeCategory];
            if (activeCategory === 'multiplicationTables') {
                doc = PDFGenerator.generateMultiplicationTable(params.from, params.to, includeAnswers);
            } else if (activeCategory === 'simpleAddition') {
                doc = PDFGenerator.generateSimpleAdditionWorksheet(params.count, params.max, includeAnswers);
            } else if (activeCategory === 'simpleSubtraction') {
                doc = PDFGenerator.generateSimpleSubtractionWorksheet(params.count, params.max, includeAnswers);
            } else if (activeCategory === 'simpleMultiplication') {
                doc = PDFGenerator.generateSimpleMultiplicationWorksheet(params.count, params.max, includeAnswers);
            } else if (activeCategory === 'simpleDivision') {
                doc = PDFGenerator.generateSimpleDivisionWorksheet(params.count, params.max, includeAnswers);
            } else if (activeCategory === 'addition') {
                doc = PDFGenerator.generateAdditionWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            } else if (activeCategory === 'subtraction') {
                doc = PDFGenerator.generateSubtractionWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            } else if (activeCategory === 'multiplication') {
                doc = PDFGenerator.generateMultiplicationWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            } else if (activeCategory === 'division') {
                doc = PDFGenerator.generateDivisionWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            } else if (activeCategory === 'romanNumeralsBasic') {
                doc = PDFGenerator.generateRomanNumeralsBasicWorksheet(params.count, includeAnswers);
            } else if (activeCategory === 'romanNumeralsAdvanced') {
                doc = PDFGenerator.generateRomanNumeralsAdvancedWorksheet(params.count, includeAnswers);
            } else if (activeCategory === 'romanToArabic') {
                doc = PDFGenerator.generateRomanToArabicWorksheet(params.count, params.max, includeAnswers);
            } else if (activeCategory === 'arabicToRoman') {
                doc = PDFGenerator.generateArabicToRomanWorksheet(params.count, params.max, includeAnswers);
            } else if (activeCategory === 'timeClock') {
                doc = PDFGenerator.generateTimeClockWorksheet(params.count, params.difficulty, includeAnswers);
            } else if (activeCategory === 'moneyCurrency') {
                doc = PDFGenerator.generateMoneyCurrencyWorksheet(params.count, params.difficulty, includeAnswers);
            } else if (activeCategory === 'measurements') {
                doc = PDFGenerator.generateMeasurementsWorksheet(params.count, params.difficulty, includeAnswers);
            } else if (activeCategory === 'patterns') {
                doc = PDFGenerator.generatePatternsWorksheet(params.count, params.difficulty, includeAnswers);
            } else if (activeCategory === 'numberWriting') {
                doc = PDFGenerator.generateNumberWritingWorksheet(params.from, params.to, params.percentage);
            } else if (activeCategory === 'mixedOperations') {
                doc = PDFGenerator.generateMixedOperationsWorksheet(params.count, params.max, params.difficulty, includeAnswers);
            }

            if (print) {
                PDFGenerator.printPDF(doc);
                setMessage({ type: 'success', text: '✅ Opening print dialog...' });
            } else {
                PDFGenerator.downloadPDF(doc, `custom_${activeCategory}_${includeAnswers ? 'answers' : 'worksheet'}.pdf`);
                setMessage({ type: 'success', text: '✅ Custom worksheet downloaded!' });
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

    // Preview worksheet before downloading
    const previewWorksheet = (template) => {
        try {
            setLoading(true);
            let doc = generatePDFForTemplate(template, false);

            // Convert PDF to blob URL
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);

            setPreviewModal({ open: true, pdfUrl, template });
            setMessage({ type: 'success', text: '✅ Preview ready!' });
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Failed to generate preview' });
        } finally {
            setLoading(false);
        }
    };

    // Generate PDF based on template and format preference
    const generatePDFForTemplate = (template, includeAnswers) => {
        const format = formatPreference[activeCategory] || 'vertical';
        let doc;

        // Simple math - check format preference
        if (activeCategory === 'simpleAddition') {
            doc = format === 'vertical'
                ? PDFGenerator.generateSimpleAdditionWorksheet(template.count, template.max, includeAnswers)
                : PDFGenerator.generateAdditionWorksheet(template.count, template.max, 'easy', includeAnswers);
        } else if (activeCategory === 'simpleSubtraction') {
            doc = format === 'vertical'
                ? PDFGenerator.generateSimpleSubtractionWorksheet(template.count, template.max, includeAnswers)
                : PDFGenerator.generateSubtractionWorksheet(template.count, template.max, 'easy', includeAnswers);
        } else if (activeCategory === 'simpleMultiplication') {
            doc = format === 'vertical'
                ? PDFGenerator.generateSimpleMultiplicationWorksheet(template.count, template.max, includeAnswers)
                : PDFGenerator.generateMultiplicationWorksheet(template.count, template.max, 'easy', includeAnswers);
        } else if (activeCategory === 'simpleDivision') {
            doc = format === 'vertical'
                ? PDFGenerator.generateSimpleDivisionWorksheet(template.count, template.max, includeAnswers)
                : PDFGenerator.generateDivisionWorksheet(template.count, template.max, 'easy', includeAnswers);
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

        return doc;
    };

    // Close preview modal
    const closePreview = () => {
        if (previewModal.pdfUrl) {
            URL.revokeObjectURL(previewModal.pdfUrl);
        }
        setPreviewModal({ open: false, pdfUrl: null, template: null });
    };

    // Toggle format preference
    const toggleFormat = () => {
        setFormatPreference(prev => ({
            ...prev,
            [activeCategory]: prev[activeCategory] === 'vertical' ? 'horizontal' : 'vertical'
        }));
    };

    // ==================== QUESTION BANK SYSTEM ====================

    const handleLoadQuestions = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setLoadedQuestions([]);
        setResponseTime(null);

        const startTime = Date.now();

        try {
            let endpoint = '';
            let payload = {
                grade: worksheetForm.grade,
                difficulty: worksheetForm.difficulty,
                count: worksheetForm.count,
                randomize: worksheetForm.randomize
            };

            if (activeTab === 'by-topic' && worksheetForm.topic) {
                endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-topic`;
                payload.topic = worksheetForm.topic;
            } else if (activeTab === 'by-subject') {
                endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-subject`;
                payload.subject = worksheetForm.subject;
            } else {
                endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-grade`;
            }

            const response = await axios.post(endpoint, payload);
            const data = response.data;
            const clientResponseTime = Date.now() - startTime;

            if (data.success && data.questions && data.questions.length > 0) {
                setLoadedQuestions(data.questions);
                setResponseTime({
                    server: data.responseTimeMs,
                    client: clientResponseTime
                });
                setMessage({
                    type: 'success',
                    text: `✅ Loaded ${data.questions.length} questions in ${clientResponseTime}ms`
                });
            } else {
                setMessage({
                    type: 'warning',
                    text: `⚠️ No questions found. Available: Grade V (Math, Science), Professional (Java). Please select from available options.`
                });
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load questions'
            });
        } finally {
            setLoading(false);
        }
    };

    const generateWorksheetPDF = (includeAnswers = false, print = false) => {
        if (loadedQuestions.length === 0) {
            alert('Please load questions first!');
            return;
        }

        try {
            setLoading(true);
            const doc = PDFGenerator.generateCustomQuestionWorksheet(
                loadedQuestions,
                {
                    title: `${worksheetForm.subject || 'Math'} Worksheet - Grade ${worksheetForm.grade}`,
                    grade: worksheetForm.grade,
                    topic: worksheetForm.topic,
                    includeAnswers: includeAnswers,
                    showDifficulty: false  // Don't show difficulty in PDF
                }
            );

            if (print) {
                PDFGenerator.printPDF(doc);
                setMessage({
                    type: 'success',
                    text: '✅ Opening print dialog...'
                });
            } else {
                const filename = `worksheet_${worksheetForm.grade}_${Date.now()}_${includeAnswers ? 'answers' : 'questions'}.pdf`;
                PDFGenerator.downloadPDF(doc, filename);
                setMessage({
                    type: 'success',
                    text: `✅ ${includeAnswers ? 'Answer key' : 'Worksheet'} downloaded!`
                });
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    // ==================== RENDER ====================

    return (
        <div className="worksheets-hub">
            {/* Header */}
            <div className="worksheets-header">
                <h1>⚡ Ultimate Worksheets Hub</h1>
                <p className="subtitle">
                    Custom Math Generators | Dynamic Question Bank | 80+ Templates | Instant PDF | Answer Keys
                </p>
            </div>

            {/* Main Mode Selector */}
            <div className="main-mode-selector">
                <button
                    className={`main-mode-btn ${mainMode === 'custom-math' ? 'active' : ''}`}
                    onClick={() => setMainMode('custom-math')}
                    style={{ background: mainMode === 'custom-math' ? '#667eea' : 'rgba(255,255,255,0.1)' }}
                >
                    <span className="mode-icon">🔢</span>
                    <div className="mode-info">
                        <strong>Custom Math</strong>
                        <small>80+ Templates | Multiplication, Addition, etc.</small>
                    </div>
                </button>

                <button
                    className={`main-mode-btn ${mainMode === 'question-bank' ? 'active' : ''}`}
                    onClick={() => setMainMode('question-bank')}
                    style={{ background: mainMode === 'question-bank' ? '#10b981' : 'rgba(255,255,255,0.1)' }}
                >
                    <span className="mode-icon">🗃️</span>
                    <div className="mode-info">
                        <strong>Question Bank</strong>
                        <small>Curated Question Library | Multiple Subjects | All Grades</small>
                    </div>
                </button>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`message-box ${message.type}`}>
                    <span className="message-icon">
                        {message.type === 'success' ? '✓' : message.type === 'warning' ? '⚠' : '⚠'}
                    </span>
                    {message.text}
                </div>
            )}

            {/* ==================== CUSTOM MATH MODE ==================== */}
            {mainMode === 'custom-math' && (
                <div className="custom-math-section">
                    <div className="mode-toggle">
                        <button
                            className={`mode-btn ${mathMode === 'templates' ? 'active' : ''}`}
                            onClick={() => setMathMode('templates')}
                        >
                            ⚡ Quick Templates (80+)
                        </button>
                        <button
                            className={`mode-btn ${mathMode === 'custom' ? 'active' : ''}`}
                            onClick={() => setMathMode('custom')}
                        >
                            🎨 Custom Generator
                        </button>
                    </div>

                    <div className="category-tabs">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    borderColor: activeCategory === cat.id ? cat.color : 'transparent',
                                    background: activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.2)'
                                }}
                            >
                                <span className="tab-icon">{cat.icon}</span>
                                <span className="tab-name">{cat.name}</span>
                                {mathMode === 'templates' && (
                                    <span className="badge">{WORKSHEET_TEMPLATES[cat.id]?.length || 0}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {mathMode === 'templates' && (
                        <>
                            {/* Format Toggle for math categories */}
                            {['simpleAddition', 'simpleSubtraction', 'simpleMultiplication', 'simpleDivision', 'addition', 'subtraction', 'multiplication', 'division'].includes(activeCategory) && (
                                <div className="format-toggle-container">
                                    <div className="format-info">
                                        <span className="format-label">Problem Layout:</span>
                                        <span className="format-default">
                                            {['simpleAddition', 'simpleSubtraction', 'simpleMultiplication', 'simpleDivision'].includes(activeCategory)
                                                ? '(Default: Vertical ⬇️)'
                                                : '(Default: Horizontal ➡️)'}
                                        </span>
                                    </div>
                                    <div className="format-toggle-buttons">
                                        <button
                                            className={`format-option ${formatPreference[activeCategory] === 'vertical' ? 'active' : ''}`}
                                            onClick={() => setFormatPreference(prev => ({ ...prev, [activeCategory]: 'vertical' }))}
                                            title="Column/Stacked format - Traditional method"
                                        >
                                            <div className="format-icon">📐</div>
                                            <div className="format-name">Vertical</div>
                                            <div className="format-preview-mini">
                                                <pre>  123{'\n'}+ 456{'\n'}-----</pre>
                                            </div>
                                        </button>
                                        <button
                                            className={`format-option ${formatPreference[activeCategory] === 'horizontal' ? 'active' : ''}`}
                                            onClick={() => setFormatPreference(prev => ({ ...prev, [activeCategory]: 'horizontal' }))}
                                            title="Row/Table format - Compact layout"
                                        >
                                            <div className="format-icon">➡️</div>
                                            <div className="format-name">Horizontal</div>
                                            <div className="format-preview-mini">
                                                <span>123 + 456 = ___</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="templates-grid">
                                {WORKSHEET_TEMPLATES[activeCategory]?.map(template => (
                                    <div key={template.id} className="template-card">
                                        <div className="template-header">
                                            <h3>{template.name}</h3>
                                            <span
                                                className="template-id"
                                                style={{ background: categories.find(c => c.id === activeCategory)?.color }}
                                            >
                                                #{template.id}
                                            </span>
                                        </div>
                                        <p className="template-description">{template.description}</p>
                                        <div className="template-details">
                                            {template.from !== undefined && (
                                                <span className="detail-badge">📊 {template.from}-{template.to}</span>
                                            )}
                                            {template.count !== undefined && (
                                                <span className="detail-badge">📝 {template.count} problems</span>
                                            )}
                                            {template.difficulty && (
                                                <span className={`detail-badge difficulty-${template.difficulty}`}>
                                                    {template.difficulty.toUpperCase()}
                                                </span>
                                            )}
                                            {template.percentage !== undefined && (
                                                <span className="detail-badge">🎯 {template.percentage}% blank</span>
                                            )}
                                        </div>
                                        <div className="template-actions">
                                            <button
                                                className="btn-icon preview-btn"
                                                onClick={() => previewWorksheet(template)}
                                                disabled={loading}
                                                title="Preview worksheet"
                                                aria-label="Preview"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn-icon download-btn"
                                                onClick={() => generateFromTemplate(template, false)}
                                                disabled={loading}
                                                title="Download worksheet"
                                                aria-label="Download"
                                            >
                                                📥
                                            </button>
                                            <button
                                                className="btn-icon print-btn"
                                                onClick={() => generateFromTemplate(template, false, true)}
                                                disabled={loading}
                                                title="Print worksheet"
                                                aria-label="Print"
                                            >
                                                🖨️
                                            </button>
                                            {activeCategory !== 'numberWriting' && (
                                                <button
                                                    className="btn-icon answer-btn"
                                                    onClick={() => generateFromTemplate(template, true)}
                                                    disabled={loading}
                                                    title="Download with answers"
                                                    aria-label="Answers"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {mathMode === 'custom' && (
                        <div className="custom-form">
                            <div className="custom-header" style={{ borderColor: categories.find(c => c.id === activeCategory)?.color }}>
                                <h2>
                                    {categories.find(c => c.id === activeCategory)?.icon}{' '}
                                    {categories.find(c => c.id === activeCategory)?.name} - Custom Settings
                                </h2>
                                <p>Create your own customized worksheet</p>
                            </div>
                            <div className="form-grid">
                                {activeCategory === 'multiplicationTables' && (
                                    <>
                                        <div className="form-group">
                                            <label>From Table:</label>
                                            <input
                                                type="number"
                                                value={customParams[activeCategory].from}
                                                onChange={(e) => updateParam('from', parseInt(e.target.value))}
                                                min="1"
                                                max="20"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>To Table:</label>
                                            <input
                                                type="number"
                                                value={customParams[activeCategory].to}
                                                onChange={(e) => updateParam('to', parseInt(e.target.value))}
                                                min={customParams[activeCategory].from}
                                                max="20"
                                            />
                                        </div>
                                    </>
                                )}
                                {['addition', 'subtraction', 'multiplication', 'division', 'mixedOperations'].includes(activeCategory) && (
                                    <>
                                        <div className="form-group">
                                            <label>Problems:</label>
                                            <input
                                                type="number"
                                                value={customParams[activeCategory].count}
                                                onChange={(e) => updateParam('count', parseInt(e.target.value))}
                                                min="10"
                                                max="100"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Max Number:</label>
                                            <input
                                                type="number"
                                                value={customParams[activeCategory].max}
                                                onChange={(e) => updateParam('max', parseInt(e.target.value))}
                                                min="10"
                                                max="1000"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Difficulty:</label>
                                            <select
                                                value={customParams[activeCategory].difficulty}
                                                onChange={(e) => updateParam('difficulty', e.target.value)}
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {activeCategory === 'numberWriting' && (
                                    <>
                                        <div className="form-group">
                                            <label>From:</label>
                                            <input
                                                type="number"
                                                value={customParams[activeCategory].from}
                                                onChange={(e) => updateParam('from', parseInt(e.target.value))}
                                                min="1"
                                                max="1000"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>To:</label>
                                            <input
                                                type="number"
                                                value={customParams[activeCategory].to}
                                                onChange={(e) => updateParam('to', parseInt(e.target.value))}
                                                min={customParams[activeCategory].from}
                                                max="1000"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Blank %:</label>
                                            <input
                                                type="range"
                                                value={customParams[activeCategory].percentage}
                                                onChange={(e) => updateParam('percentage', parseInt(e.target.value))}
                                                min="0"
                                                max="100"
                                            />
                                            <span>{customParams[activeCategory].percentage}%</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="generate-buttons">
                                <button
                                    className="btn-generate worksheet"
                                    onClick={() => generateCustom(false)}
                                    disabled={loading}
                                    style={{ background: categories.find(c => c.id === activeCategory)?.color }}
                                >
                                    📄 Download Worksheet
                                </button>
                                <button
                                    className="btn-generate print"
                                    onClick={() => generateCustom(false, true)}
                                    disabled={loading}
                                    style={{ background: '#6b7280' }}
                                    title="Print worksheet"
                                >
                                    🖨️ Print Worksheet
                                </button>
                                {activeCategory !== 'numberWriting' && (
                                    <button
                                        className="btn-generate answer"
                                        onClick={() => generateCustom(true)}
                                        disabled={loading}
                                        style={{ background: categories.find(c => c.id === activeCategory)?.color }}
                                    >
                                        ✅ Download Answers
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== QUESTION BANK MODE ==================== */}
            {mainMode === 'question-bank' && (
                <div className="question-bank-section">
                    {/* Compact Query Type Pills */}
                    <div className="query-type-pills">
                        <button
                            className={`query-pill ${activeTab === 'by-grade' ? 'active' : ''}`}
                            onClick={() => setActiveTab('by-grade')}
                            style={{ background: activeTab === 'by-grade' ? '#10b981' : 'rgba(255,255,255,0.15)' }}
                        >
                            📚 By Grade
                        </button>
                        <button
                            className={`query-pill ${activeTab === 'by-subject' ? 'active' : ''}`}
                            onClick={() => setActiveTab('by-subject')}
                            style={{ background: activeTab === 'by-subject' ? '#3b82f6' : 'rgba(255,255,255,0.15)' }}
                        >
                            📖 By Subject
                        </button>
                        <button
                            className={`query-pill ${activeTab === 'by-topic' ? 'active' : ''}`}
                            onClick={() => setActiveTab('by-topic')}
                            style={{ background: activeTab === 'by-topic' ? '#8b5cf6' : 'rgba(255,255,255,0.15)' }}
                        >
                            🎯 By Topic
                        </button>
                    </div>

                    <div className="worksheets-content">
                        <div className="filter-panel">
                            <div className="panel-header">
                                <h3>🎛️ Worksheet Configuration</h3>
                                <p>Select criteria and load questions</p>
                            </div>

                            <form onSubmit={handleLoadQuestions}>
                                <div className="form-grid-modern">
                                    <div className="form-field">
                                        <label>📚 Grade Level *</label>
                                        <select
                                            value={worksheetForm.grade}
                                            onChange={(e) => setWorksheetForm({...worksheetForm, grade: e.target.value})}
                                            required
                                        >
                                            {grades.map(grade => (
                                                <option key={grade.code} value={grade.code}>
                                                    {grade.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {(activeTab === 'by-subject' || activeTab === 'by-topic') && (
                                        <div className="form-field">
                                            <label>📖 Subject *</label>
                                            <select
                                                value={worksheetForm.subject}
                                                onChange={(e) => setWorksheetForm({...worksheetForm, subject: e.target.value})}
                                                required
                                            >
                                                {subjects.map(subj => (
                                                    <option key={subj.value} value={subj.value}>
                                                        {subj.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {activeTab === 'by-topic' && (
                                        <div className="form-field">
                                            <label>🎯 Topic/Chapter</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Algebra, Fractions"
                                                value={worksheetForm.topic}
                                                onChange={(e) => setWorksheetForm({...worksheetForm, topic: e.target.value})}
                                            />
                                        </div>
                                    )}

                                    <div className="form-field">
                                        <label>🎚️ Difficulty Level *</label>
                                        <select
                                            value={worksheetForm.difficulty}
                                            onChange={(e) => setWorksheetForm({...worksheetForm, difficulty: e.target.value})}
                                            required
                                        >
                                            <option value="EASY">🟢 Easy</option>
                                            <option value="MEDIUM">🟡 Medium</option>
                                            <option value="COMPLEX">🔴 Complex</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>🔢 Number of Questions</label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="100"
                                            value={worksheetForm.count}
                                            onChange={(e) => setWorksheetForm({...worksheetForm, count: parseInt(e.target.value)})}
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>🎲 Worksheet Type</label>
                                        <select
                                            value={worksheetForm.randomize ? 'random' : 'static'}
                                            onChange={(e) => setWorksheetForm({...worksheetForm, randomize: e.target.value === 'random'})}
                                        >
                                            <option value="random">🎲 Random</option>
                                            <option value="static">📌 Static</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="load-button" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>⚡ Load Questions</>
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="results-panel">
                            {loadedQuestions.length > 0 ? (
                                <div className="results-container">
                                    <div className="results-summary">
                                        <div className="summary-badge">
                                            <span className="badge-icon">✅</span>
                                            <div className="badge-info">
                                                <strong>{loadedQuestions.length} Questions</strong>
                                                <small>Ready for PDF</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="questions-preview-compact">
                                        <h4>📝 Preview</h4>
                                        <div className="questions-list-compact">
                                            {(expandedPreview ? loadedQuestions : loadedQuestions.slice(0, 3)).map((q, idx) => (
                                                <div key={idx} className="question-card-compact">
                                                    <span className="q-number">Q{idx + 1}</span>
                                                    <span className="q-text">{q.question?.name || q.name || 'Question'}</span>
                                                    <span className={`q-badge ${q.complexity?.toLowerCase() || 'medium'}`}>
                                                        {q.complexity || 'MEDIUM'}
                                                    </span>
                                                </div>
                                            ))}
                                            {loadedQuestions.length > 3 && (
                                                <button
                                                    className="expand-btn"
                                                    onClick={() => setExpandedPreview(!expandedPreview)}
                                                >
                                                    {expandedPreview ? (
                                                        <>▲ Show Less</>
                                                    ) : (
                                                        <>▼ + {loadedQuestions.length - 3} more questions</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="download-section">
                                        <button
                                            className="download-btn primary"
                                            onClick={() => generateWorksheetPDF(false)}
                                            disabled={loading}
                                        >
                                            📄 Download
                                        </button>
                                        <button
                                            className="download-btn print"
                                            onClick={() => generateWorksheetPDF(false, true)}
                                            disabled={loading}
                                            title="Print worksheet"
                                        >
                                            🖨️ Print
                                        </button>
                                        <button
                                            className="download-btn secondary"
                                            onClick={() => generateWorksheetPDF(true)}
                                            disabled={loading}
                                        >
                                            ✅ Answers
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <h3>No Questions Loaded</h3>
                                    <p>Configure filters and click "Load Questions"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner-large"></div>
                    <p>Processing...</p>
                </div>
            )}

            {/* Preview Modal */}
            {previewModal.open && (
                <div className="preview-modal-overlay" onClick={closePreview}>
                    <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="preview-modal-header">
                            <h2>📄 Worksheet Preview</h2>
                            <button className="preview-close-btn" onClick={closePreview}>✕</button>
                        </div>
                        <div className="preview-modal-body">
                            {previewModal.pdfUrl && (
                                <iframe
                                    src={previewModal.pdfUrl}
                                    title="Worksheet Preview"
                                    className="preview-pdf-iframe"
                                />
                            )}
                        </div>
                        <div className="preview-modal-footer">
                            <button
                                className="preview-action-btn download-btn"
                                onClick={() => {
                                    generateFromTemplate(previewModal.template, false);
                                    closePreview();
                                }}
                            >
                                📥 Download Worksheet
                            </button>
                            <button
                                className="preview-action-btn answer-btn"
                                onClick={() => {
                                    generateFromTemplate(previewModal.template, true);
                                    closePreview();
                                }}
                            >
                                ✅ Download with Answers
                            </button>
                            <button
                                className="preview-action-btn print-btn"
                                onClick={() => {
                                    generateFromTemplate(previewModal.template, false, true);
                                    closePreview();
                                }}
                            >
                                🖨️ Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
