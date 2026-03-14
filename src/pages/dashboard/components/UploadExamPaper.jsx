import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import './UploadExamPaper.css';

/**
 * Upload Exam Paper Component for Teacher Dashboard
 *
 * Allows teachers to upload exam papers for AI-powered grading
 * Integrates with kvs-admin-assessment service
 */
const UploadExamPaper = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    studentUserId: '',
    assessmentName: '',
    subject: 'MATH',
    gradeLevel: 'X',
    totalQuestions: 10,
    maxMarksPerQuestion: 10
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const subjects = ['MATH', 'SCIENCE', 'ENGLISH', 'SOCIAL_STUDIES', 'COMPUTER_SCIENCE', 'HINDI', 'SANSKRIT'];
  const gradeLevels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalQuestions' || name === 'maxMarksPerQuestion' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setUploadStatus(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus({
        type: 'error',
        message: 'Please select at least one file to upload'
      });
      return;
    }

    if (!formData.studentUserId || !formData.assessmentName) {
      setUploadStatus({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus(null);

      const data = new FormData();
      selectedFiles.forEach(file => {
        data.append('files', file);
      });
      data.append('studentUserId', formData.studentUserId);
      data.append('assessmentName', formData.assessmentName);
      data.append('subject', formData.subject);
      data.append('gradeLevel', formData.gradeLevel);
      data.append('totalQuestions', formData.totalQuestions);
      data.append('maxMarksPerQuestion', formData.maxMarksPerQuestion);

      const teacherUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
      data.append('teacherUserId', teacherUserId);

      const response = await axios.post(
        'http://localhost:8083/api/admin-assessment/v1/exams/upload',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.data.success) {
        setUploadStatus({
          type: 'success',
          message: `Exam uploaded successfully! Submission ID: ${response.data.submissionId}`,
          submissionId: response.data.submissionId
        });

        // Reset form
        setSelectedFiles([]);
        setFormData({
          studentUserId: '',
          assessmentName: '',
          subject: 'MATH',
          gradeLevel: 'X',
          totalQuestions: 10,
          maxMarksPerQuestion: 10
        });
        document.getElementById('file-input').value = '';
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to upload exam paper'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-exam-paper-container">
      <div className="upload-header">
        <h2>
          <span className="header-icon">📄</span>
          Upload Exam Paper for AI Grading
        </h2>
        <p className="header-description">
          Upload student exam papers to receive AI-powered grading with detailed feedback
        </p>
      </div>

      <div className="upload-form-card">
        {/* Student Information */}
        <div className="form-section">
          <h3 className="section-title">Student Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="studentUserId">Student Email / ID *</label>
              <input
                type="text"
                id="studentUserId"
                name="studentUserId"
                value={formData.studentUserId}
                onChange={handleInputChange}
                placeholder="student@example.com"
                className="form-input"
                required
              />
              <span className="form-hint">Enter student's registered email or user ID</span>
            </div>
          </div>
        </div>

        {/* Assessment Details */}
        <div className="form-section">
          <h3 className="section-title">Assessment Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="assessmentName">Assessment Name *</label>
              <input
                type="text"
                id="assessmentName"
                name="assessmentName"
                value={formData.assessmentName}
                onChange={handleInputChange}
                placeholder="e.g., Mid-term Math Exam 2025"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="form-select"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gradeLevel">Grade Level *</label>
              <select
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleInputChange}
                className="form-select"
              >
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="totalQuestions">Total Questions *</label>
              <input
                type="number"
                id="totalQuestions"
                name="totalQuestions"
                value={formData.totalQuestions}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxMarksPerQuestion">Max Marks Per Question *</label>
              <input
                type="number"
                id="maxMarksPerQuestion"
                name="maxMarksPerQuestion"
                value={formData.maxMarksPerQuestion}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="form-section">
          <h3 className="section-title">Exam Paper Files</h3>
          <div className="file-upload-area">
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="file-input-hidden"
            />
            <label htmlFor="file-input" className="file-upload-label">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <p className="upload-primary">Click to browse or drag and drop</p>
                <p className="upload-secondary">Supports JPG, PNG, PDF (Max 10 files, 10MB each)</p>
              </div>
            </label>

            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files ({selectedFiles.length})</h4>
                <div className="files-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="progress-text">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`}>
            <span className="status-icon">{uploadStatus.type === 'success' ? '✅' : '⚠️'}</span>
            <p>{uploadStatus.message}</p>
            {uploadStatus.submissionId && (
              <p className="submission-id">Processing will take a few moments. Check Grade Submissions tab for results.</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? 'Uploading...' : 'Upload for AI Grading'}
          </button>
          <button
            className="btn-reset"
            onClick={() => {
              setSelectedFiles([]);
              setFormData({
                studentUserId: '',
                assessmentName: '',
                subject: 'MATH',
                gradeLevel: 'X',
                totalQuestions: 10,
                maxMarksPerQuestion: 10
              });
              setUploadStatus(null);
              document.getElementById('file-input').value = '';
            }}
            disabled={uploading}
          >
            Reset Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadExamPaper;
