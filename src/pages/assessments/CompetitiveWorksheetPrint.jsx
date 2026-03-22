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

    useEffect(() => {
        if (!exam) return navigate('/competitive-hub');

        const fetchQuestions = async () => {
            try {
                const baseUrl = config.GATEWAY_URL || config.ASSESSMENT_BASE_URL;
                const token = localStorage.getItem('token');
                const userId = user?.username || user?.id || 'GUEST';
                const userEmail = user?.email || 'guest@kivolearning.com'; 

                const promises = exam.sections.map(async (section) => {
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
                    
                    // 🚀 ULTRA-ROBUST EXTRACTOR
                    let extractedQuestions = [];
                    if (res.data.questions && Array.isArray(res.data.questions)) extractedQuestions = res.data.questions;
                    else if (res.data.questionDTOs && Array.isArray(res.data.questionDTOs)) extractedQuestions = res.data.questionDTOs;
                    else if (res.data.assessmentQuestions && Array.isArray(res.data.assessmentQuestions)) extractedQuestions = res.data.assessmentQuestions;
                    else if (res.data.data && Array.isArray(res.data.data)) extractedQuestions = res.data.data;
                    else {
                        const arrayProp = Object.values(res.data).find(val => Array.isArray(val));
                        if (arrayProp) extractedQuestions = arrayProp;
                    }

                    return { ...section, questions: extractedQuestions };
                });

                const results = await Promise.all(promises);
                setSectionsData(results);
                setLoading(false);

                setTimeout(() => window.print(), 1000);
            } catch (err) {
                console.error("Print generation error", err);
                alert("Failed to load paper. Ensure questions exist in the database for this blueprint.");
                navigate('/competitive-hub');
            }
        };

        fetchQuestions();
    }, [exam, navigate, config, user]);

    if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.5rem' }}>Generating Print Format...</div>;

    return (
        <div style={{ background: 'white', color: 'black', padding: '40px', fontFamily: '"Times New Roman", Times, serif', maxWidth: '850px', margin: '0 auto' }}>
            
            <style>
                {`
                    @media print {
                        body { background: white; margin: 0; padding: 0; }
                        .no-print { display: none; }
                        .page-break { page-break-before: always; }
                        .avoid-break { page-break-inside: avoid; }
                    }
                `}
            </style>

            <button className="no-print" onClick={() => navigate('/competitive-hub')} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '5px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold' }}>← Back to Matrix</button>

            <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0', textTransform: 'uppercase' }}>{exam.examName} MOCK PAPER</h1>
                <p style={{ margin: 0, fontSize: '1.2rem' }}>Total Time: <strong>{exam.totalDurationMinutes} Minutes</strong> | Negative Marking: <strong>-{exam.negativeMarkingFactor * 100}%</strong></p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    <span>Name: _______________________</span>
                    <span>Date: _______________</span>
                </div>
            </div>

            {sectionsData.map((sec, secIndex) => (
                <div key={sec.id} style={{ marginBottom: '40px' }}>
                    <h2 style={{ background: '#f1f5f9', padding: '10px', border: '1px solid black', textTransform: 'uppercase' }}>
                        PART {secIndex + 1}: {sec.sectionName} ({sec.questions.length} Questions)
                    </h2>
                    
                    {sec.questions.length > 0 ? sec.questions.map((q, qIndex) => {
                        const qText = q.questionText || q.question?.name || q.text || "Question text missing";
                        const qOptions = q.options || q.question?.options || {};

                        return (
                            <div key={q.id || qIndex} className="avoid-break" style={{ marginBottom: '25px', paddingLeft: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <strong>{qIndex + 1}.</strong>
                                    <span>{qText}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '25px' }}>
                                    {Object.entries(qOptions).map(([key, val]) => (
                                        <div key={key}>({key}) {val}</div>
                                    ))}
                                </div>
                            </div>
                        );
                    }) : (
                        <p style={{fontStyle: 'italic', color: 'gray'}}>No questions available for this section.</p>
                    )}
                </div>
            ))}

            <div className="page-break"></div>

            <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '30px' }}>
                <h2>OFFICIAL ANSWER KEY</h2>
            </div>
            
            {sectionsData.map(sec => (
                <div key={'key-'+sec.id} className="avoid-break" style={{ marginBottom: '30px' }}>
                    <h3 style={{ textDecoration: 'underline' }}>{sec.sectionName}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '15px' }}>
                        {sec.questions.map((q, index) => {
                            const actualAnswer = q.correctAnswer || q.answer?.values?.[0] || q.answer || "N/A";
                            return (
                                <div key={'ans-'+(q.id||index)}><strong>{index + 1}.</strong> {actualAnswer}</div>
                            );
                        })}
                    </div>
                </div>
            ))}
            
            <div className="no-print" style={{ textAlign: 'center', marginTop: '50px' }}>
                <button onClick={() => window.print()} style={{ padding: '15px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>🖨️ Print Document</button>
            </div>
        </div>
    );
}