import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getConfig } from '../../Config';

export default function CompetitiveWorksheetPrint() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const config = getConfig();
    const exam = state?.exam;
    
    const [sectionsData, setSectionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState("Initializing...");
    
    const [printConfig, setPrintConfig] = useState({
        showAnswers: false, 
        showExplanations: false
    });

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchSequentially = async (indices, baseUrl, token, userId, userEmail, assessmentId, sectionName) => {
        const results = [];
        for (let i = 0; i < indices.length; i++) {
            const idx = indices[i];
            setLoadingProgress(`Fetching ${sectionName} Question ${idx} of ${indices.length}...`);
            
            let success = false;
            let attempts = 0;
            
            while (!success && attempts < 3) {
                try {
                    const qRes = await axios.post(`${baseUrl}/v1/assessment/questions/start`, {
                        userId: userId.toString(),
                        email: userEmail,
                        assessmentId: assessmentId,
                        questionIndex: idx
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    
                    if (qRes.data) results.push(qRes.data);
                    success = true;
                    await sleep(150); 
                } catch (err) {
                    attempts++;
                    console.warn(`Rate limit hit on Q${idx}, retrying...`);
                    await sleep(1000); 
                }
            }
        }
        return results;
    };

    useEffect(() => {
        if (!exam) return navigate('/competitive-hub');

        const fetchQuestionsBatched = async () => {
            try {
                const baseUrl = config.GATEWAY_URL || config.ASSESSMENT_BASE_URL;
                const token = localStorage.getItem('token');
                const userId = user?.username || user?.id || 'GUEST';
                const userEmail = user?.email || 'guest@kivolearning.com'; 

                const finalResults = [];

                for (let s = 0; s < exam.sections.length; s++) {
                    const section = exam.sections[s];
                    setLoadingProgress(`Creating Session for ${section.sectionName}...`);

                    const payload = {
                        category: exam.examName,
                        type: section.sectionName,
                        complexity: "COMPLEX", 
                        numberOfQuestions: section.questionCount,
                        userId: userId.toString(),
                        email: userEmail 
                    };

                    const res = await axios.post(`${baseUrl}/v1/assessment/questions/load`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    const assessmentId = res.data.assessmentId;
                    const loadedCount = res.data.numberOfQuestions || section.questionCount;
                    
                    const indicesToFetch = Array.from({ length: loadedCount }, (_, i) => i + 1);
                    const extractedQuestions = await fetchSequentially(indicesToFetch, baseUrl, token, userId, userEmail, assessmentId, section.sectionName);
                    
                    const sanitizedQuestions = extractedQuestions.map(q => {
                        if (q.questions && Array.isArray(q.questions)) return q.questions[0];
                        if (q.question) return q.question;
                        return q;
                    });
                    
                    finalResults.push({ ...section, questions: sanitizedQuestions });
                    await sleep(500); 
                }

                setSectionsData(finalResults);
                setLoading(false);
            } catch (err) {
                console.error("Print generation error", err);
                alert("Failed to load paper. Check your network or contact support.");
                navigate('/competitive-hub');
            }
        };

        fetchQuestionsBatched();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exam]);

    const getQDetails = (qNode) => {
        if (!qNode) return { qText: '', qOptions: {}, actualAnswer: 'N/A', explanation: '' };

        const qText = qNode.question?.name || qNode.name || qNode.questionText || "Question text missing";
        const qOptions = qNode.question?.options || qNode.options || {};
        
        let actualAnswer = "N/A";
        let explanation = "";

        const targetAns = qNode.answer || qNode.question?.answer || qNode.correctAnswer;
        if (targetAns) {
            if (targetAns.values && Array.isArray(targetAns.values)) {
                actualAnswer = targetAns.values.join(', ');
            } else if (typeof targetAns === 'string') {
                actualAnswer = targetAns;
            }
            explanation = targetAns.explanation || qNode.explanation || ""; 
        }
        
        return { qText, qOptions, actualAnswer, explanation };
    };

    if (loading) {
        return (
            <div style={{ background: '#0f172a', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontFamily: 'monospace' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🖨️</div>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Generating Mock Paper...</div>
                <div style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold' }}>{loadingProgress}</div>
                <p style={{ color: '#64748b', marginTop: '20px' }}>Safely compiling questions sequentially to protect database stability.</p>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px', fontFamily: '"Times New Roman", Times, serif' }}>
            
            {/* 🚀 BULLETPROOF PRINT CSS */}
            <style>
                {`
                    @media print {
                        /* Force browsers to allow full scrolling and infinite height for printing */
                        html, body, #root, .app-container {
                            height: auto !important;
                            min-height: auto !important;
                            overflow: visible !important;
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        
                        /* Hide navigation and settings panel */
                        .no-print { display: none !important; }
                        
                        /* Layout fixes */
                        .print-container { 
                            box-shadow: none !important; 
                            padding: 0 !important; 
                            max-width: 100% !important; 
                            margin: 0 !important; 
                        }
                        .page-break { page-break-before: always; }
                        .avoid-break { page-break-inside: avoid; }
                        
                        /* Ensure the Header shows up specifically in Print */
                        .print-header { display: block !important; }

                        /* Configure native browser page numbers */
                        @page {
                            margin: 20mm 15mm;
                            size: A4 portrait;
                        }
                    }
                    
                    /* Hide the print-header on the normal web view */
                    .print-header { display: none; }
                `}
            </style>

            <div className="no-print" style={{ maxWidth: '850px', margin: '0 auto 20px auto', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 10px 0', fontFamily: 'sans-serif' }}>⚙️ Paper Settings</h3>
                    <div style={{ display: 'flex', gap: '20px', fontFamily: 'sans-serif', fontSize: '14px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={printConfig.showAnswers} onChange={e => setPrintConfig({...printConfig, showAnswers: e.target.checked})} />
                            Include Answer Key
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: printConfig.showAnswers ? 1 : 0.5 }}>
                            <input type="checkbox" checked={printConfig.showExplanations} onChange={e => setPrintConfig({...printConfig, showExplanations: e.target.checked})} disabled={!printConfig.showAnswers} />
                            Include Explanations
                        </label>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/competitive-hub')} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                    <button onClick={() => window.print()} style={{ padding: '10px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Paper</button>
                </div>
            </div>

            <div className="print-container" style={{ background: 'white', color: 'black', padding: '40px', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                
                {/* 🚀 PRINT SPECIFIC HEADER: KiVO Logo + Name */}
                <div className="print-header" style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid black', paddingBottom: '20px' }}>
                    <img 
                        src="/kivo-logo.png" 
                        alt="KiVO Learning" 
                        style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }} 
                        onError={(e) => { e.target.style.display = 'none'; }} // Failsafe if logo path changes
                    />
                    <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '24px' }}>KiVO Learning International</h2>
                    <h3 style={{ margin: '0', color: '#555' }}>{exam.examName} MOCK PAPER</h3>
                </div>

                {/* Normal Web View Header */}
                <div className="no-print" style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '30px' }}>
                    <h1 style={{ margin: '0 0 10px 0', textTransform: 'uppercase' }}>{exam.examName} MOCK PAPER</h1>
                </div>

                {/* Sub Header for both */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <p style={{ margin: 0, fontSize: '1.2rem' }}>Total Time: <strong>{exam.totalDurationMinutes} Minutes</strong> | Negative Marking: <strong>-{exam.negativeMarkingFactor * 100}%</strong></p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px', fontWeight: 'bold' }}>
                        <span>Student Name: ___________________________</span>
                        <span>Date: ___________________</span>
                    </div>
                </div>

                {sectionsData.map((sec, secIndex) => (
                    <div key={sec.id} style={{ marginBottom: '40px' }}>
                        <h2 style={{ background: '#f1f5f9', padding: '10px', border: '1px solid black', textTransform: 'uppercase' }}>
                            PART {secIndex + 1}: {sec.sectionName} ({sec.questions.length} Questions)
                        </h2>
                        
                        {sec.questions.length > 0 ? sec.questions.map((qNode, qIndex) => {
                            const { qText, qOptions } = getQDetails(qNode);

                            return (
                                <div key={qNode.id || qIndex} className="avoid-break" style={{ marginBottom: '35px', paddingLeft: '15px' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <strong>{qIndex + 1}.</strong>
                                        <span>{qText}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '25px', marginBottom: '15px' }}>
                                        {Object.entries(qOptions).map(([key, val]) => (
                                            <div key={key}>({key}) {typeof val === 'object' ? JSON.stringify(val) : String(val)}</div>
                                        ))}
                                    </div>
                                    <div style={{ paddingLeft: '25px' }}>
                                        <div style={{ display: 'inline-block', border: '2px dashed #94a3b8', padding: '8px 20px', borderRadius: '4px', color: '#64748b', fontSize: '0.9rem' }}>
                                            Your Answer: _________
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p style={{fontStyle: 'italic', color: 'gray'}}>No questions available for this section.</p>
                        )}
                    </div>
                ))}

                {printConfig.showAnswers && (
                    <>
                        <div className="page-break"></div>
                        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '30px' }}>
                            <h2>OFFICIAL ANSWER KEY & EXPLANATIONS</h2>
                        </div>
                        
                        {sectionsData.map(sec => (
                            <div key={'key-'+sec.id} style={{ marginBottom: '30px' }}>
                                <h3 style={{ textDecoration: 'underline', background: '#f1f5f9', padding: '5px' }}>{sec.sectionName}</h3>
                                
                                {!printConfig.showExplanations ? (
                                    <div className="avoid-break" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '15px', marginTop: '15px' }}>
                                        {sec.questions.map((qNode, index) => {
                                            const { actualAnswer } = getQDetails(qNode);
                                            return <div key={'ans-'+index}><strong>{index + 1}.</strong> {actualAnswer}</div>;
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                                        {sec.questions.map((qNode, index) => {
                                            const { actualAnswer, explanation } = getQDetails(qNode);
                                            return (
                                                <div key={'expl-'+index} className="avoid-break" style={{ borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
                                                    <div><strong>Q{index + 1}. Correct Answer:</strong> <span style={{color: 'green', fontWeight: 'bold'}}>{actualAnswer}</span></div>
                                                    {explanation && (
                                                        <div style={{ marginTop: '5px', fontStyle: 'italic', color: '#444' }}>
                                                            <strong>Explanation:</strong> {explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}