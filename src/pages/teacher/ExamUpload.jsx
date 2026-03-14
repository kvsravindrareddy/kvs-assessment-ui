import React, { useState } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
import '../../css/ExamUpload.css';

const ExamUpload = () => {
    const [formData, setFormData] = useState({
        studentUserId: '',
        studentName: '',
        studentEmail: '',
        sessionId: '',
        assessmentId: '',
        assessmentName: '',
        gradeCode: '',
        subject: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);

    const grades = [
        { code: 'PRE_K', name: 'Pre-Kindergarten' },
        { code: 'KINDERGARTEN', name: 'Kindergarten' },
        { code: 'I', name: 'Grade 1' },
        { code: 'II', name: 'Grade 2' },
        { code: 'III', name: 'Grade 3' },
        { code: 'IV', name: 'Grade 4' },
        { code: 'V', name: 'Grade 5' },
        { code: 'VI', name: 'Grade 6' },
        { code: 'VII', name: 'Grade 7' },
        { code: 'VIII', name: 'Grade 8' },
        { code: 'IX', name: 'Grade 9' },
        { code: 'X', name: 'Grade 10' },
        { code: 'XI', name: 'Grade 11' },
        { code: 'XII', name: 'Grade 12' }
    ];

    const subjects = ['MATH', 'ENGLISH', 'SCIENCE', 'SOCIAL_STUDIES', 'HISTORY', 'GEOGRAPHY', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (10MB)
            if (file.size > 10485760) {
                setError('File size must be less than 10MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only PDF, JPG, PNG, and HEIC files are allowed');
                return;
            }

            setSelectedFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setUploadResult(null);

        // Validate required fields
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        if (!formData.studentUserId || !formData.assessmentName || !formData.gradeCode) {
            setError('Please fill all required fields');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Create FormData
            const data = new FormData();
            data.append('file', selectedFile);

            // Generate UUID for sessionId if not provided
            const sessionId = formData.sessionId || crypto.randomUUID();

            const requestData = {
                studentUserId: formData.studentUserId,
                studentName: formData.studentName,
                studentEmail: formData.studentEmail,
                sessionId: sessionId,
                assessmentId: formData.assessmentId || `EXAM-${Date.now()}`,
                assessmentName: formData.assessmentName,
                gradeCode: formData.gradeCode,
                subject: formData.subject
            };

            data.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

            // Upload file
            const response = await axios.post(
                `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/exams/upload`,
                data,
                {
                    headers: {
                        'X-Teacher-Id': localStorage.getItem('userId') || 'teacher123',
                        'X-Teacher-Name': localStorage.getItem('userName') || 'Teacher'
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                }
            );

            setUploadResult(response.data);
            setUploading(false);

            // Reset form
            setFormData({
                studentUserId: '',
                studentName: '',
                studentEmail: '',
                sessionId: '',
                assessmentId: '',
                assessmentName: '',
                gradeCode: '',
                subject: ''
            });
            setSelectedFile(null);

            // Redirect to results page after 3 seconds
            setTimeout(() => {
                window.location.href = `/exam-results/${response.data.submissionId}`;
            }, 3000);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload exam paper');
            setUploading(false);
        }
    };

    return (
        <div className="exam-upload-container">
            <div className="exam-upload-header">
                <h1>📄 Upload Exam Paper</h1>
                <p>Upload student exam papers for AI-powered grading</p>
            </div>

            <div className="exam-upload-content">
                <form onSubmit={handleSubmit} className="exam-upload-form">
                    <div className="form-section">
                        <h3>Student Information</h3>

                        <div className="form-group">
                            <label>Student ID *</label>
                            <input
                                type="text"
                                name="studentUserId"
                                value={formData.studentUserId}
                                onChange={handleChange}
                                placeholder="e.g., student123"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Student Name</label>
                            <input
                                type="text"
                                name="studentName"
                                value={formData.studentName}
                                onChange={handleChange}
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        <div className="form-group">
                            <label>Student Email</label>
                            <input
                                type="email"
                                name="studentEmail"
                                value={formData.studentEmail}
                                onChange={handleChange}
                                placeholder="e.g., john@example.com"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Assessment Details</h3>

                        <div className="form-group">
                            <label>Assessment Name *</label>
                            <input
                                type="text"
                                name="assessmentName"
                                value={formData.assessmentName}
                                onChange={handleChange}
                                placeholder="e.g., Math Final Exam"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Grade Level *</label>
                                <select
                                    name="gradeCode"
                                    value={formData.gradeCode}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {grades.map(grade => (
                                        <option key={grade.code} value={grade.code}>
                                            {grade.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Subject</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>
                                            {subject.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Assessment ID (Optional)</label>
                            <input
                                type="text"
                                name="assessmentId"
                                value={formData.assessmentId}
                                onChange={handleChange}
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Upload Exam Paper</h3>

                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="exam-file"
                                accept=".pdf,.jpg,.jpeg,.png,.heic"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="exam-file" className="file-upload-label">
                                <div className="upload-icon">📁</div>
                                <div className="upload-text">
                                    {selectedFile ? (
                                        <>
                                            <strong>{selectedFile.name}</strong>
                                            <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </>
                                    ) : (
                                        <>
                                            <strong>Click to upload exam paper</strong>
                                            <span>PDF, JPG, PNG, or HEIC (max 10MB)</span>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            ❌ {error}
                        </div>
                    )}

                    {uploading && (
                        <div className="upload-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <p>Uploading... {uploadProgress}%</p>
                        </div>
                    )}

                    {uploadResult && (
                        <div className="success-message">
                            ✅ {uploadResult.message}
                            <div className="submission-info">
                                <strong>Submission ID:</strong> {uploadResult.submissionId}
                                <br />
                                <strong>Status:</strong> {uploadResult.status}
                                <br />
                                <em>Redirecting to results page...</em>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={uploading || !selectedFile}>
                            {uploading ? 'Uploading...' : '🚀 Upload & Grade Exam'}
                        </button>
                    </div>
                </form>

                <div className="info-panel">
                    <h3>ℹ️ How it works</h3>
                    <ol>
                        <li>Upload student exam paper (PDF or image)</li>
                        <li>AI analyzes and grades the exam (~30-60 seconds)</li>
                        <li>Review AI-generated grades and feedback</li>
                        <li>Adjust scores if needed and approve</li>
                        <li>Student receives notification with results</li>
                    </ol>

                    <div className="info-box">
                        <strong>Supported Formats:</strong>
                        <ul>
                            <li>PDF documents (multi-page supported)</li>
                            <li>JPG/JPEG images</li>
                            <li>PNG images</li>
                            <li>HEIC images (iPhone photos)</li>
                        </ul>
                    </div>

                    <div className="info-box">
                        <strong>Best Practices:</strong>
                        <ul>
                            <li>Ensure text is clear and readable</li>
                            <li>Good lighting for scanned documents</li>
                            <li>Questions should be clearly numbered</li>
                            <li>Resolution: 300 DPI or higher</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamUpload;
