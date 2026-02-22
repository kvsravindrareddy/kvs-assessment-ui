import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import './BulkRegistration.css';

const BulkRegistration = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // CSV Template structure
  const csvTemplate = [
    ['firstName', 'lastName', 'email', 'phone', 'role', 'grade', 'section', 'rollNumber', 'dateOfBirth'],
    ['John', 'Doe', 'john.doe@school.com', '1234567890', 'STUDENT', '5', 'A', '101', '2015-05-15'],
    ['Jane', 'Smith', 'jane.smith@school.com', '0987654321', 'STUDENT', '5', 'A', '102', '2015-03-20'],
    ['Mike', 'Johnson', 'mike.j@school.com', '5551234567', 'TEACHER', '', '', '', '1985-08-10']
  ];

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = csvTemplate.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_registration_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    const data = [];
    const validationErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      const rowErrors = [];
      if (!row.firstName) rowErrors.push('First name is required');
      if (!row.lastName) rowErrors.push('Last name is required');
      if (!row.email) rowErrors.push('Email is required');
      if (!row.role) rowErrors.push('Role is required');

      // Email validation
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        rowErrors.push('Invalid email format');
      }

      // Role validation
      const validRoles = ['STUDENT', 'TEACHER', 'PARENT', 'COUNSELOR', 'CONTENT_CREATOR'];
      if (row.role && !validRoles.includes(row.role)) {
        rowErrors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      if (rowErrors.length > 0) {
        validationErrors.push({ row: i, errors: rowErrors, data: row });
      }

      row.rowNumber = i;
      row.hasErrors = rowErrors.length > 0;
      data.push(row);
    }

    setPreviewData(data);
    setErrors(validationErrors);
    return data;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Process file
  const processFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Upload to backend
  const handleUpload = async () => {
    if (errors.length > 0) {
      alert('Please fix all errors before uploading');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare data for backend
      const usersToRegister = previewData.filter(row => !row.hasErrors);

      const response = await axios.post(
        'http://localhost:9000/auth/admin/bulk-register',
        {
          schoolId: user.schoolId || 1,
          users: usersToRegister.map(row => ({
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone || null,
            role: row.role,
            grade: row.grade || null,
            section: row.section || null,
            rollNumber: row.rollNumber || null,
            dateOfBirth: row.dateOfBirth || null
          }))
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadResult({
        success: true,
        successCount: response.data.successCount || usersToRegister.length,
        failedCount: response.data.failedCount || 0,
        errors: response.data.errors || []
      });

      // Clear preview after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewData([]);
        setErrors([]);
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error.response?.data?.message || 'Failed to upload users. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bulk-registration-container">
      <div className="bulk-reg-header">
        <h2>📋 Bulk User Registration</h2>
        <p>Upload a CSV file to register multiple users at once</p>
      </div>

      {/* Step 1: Download Template */}
      <div className="bulk-reg-section">
        <div className="section-header">
          <span className="step-number">1</span>
          <h3>Download CSV Template</h3>
        </div>
        <p className="section-description">
          Download our template with the correct format and fill in your user data.
        </p>
        <button className="download-template-btn" onClick={downloadTemplate}>
          <span className="btn-icon">📥</span>
          Download Template
        </button>
      </div>

      {/* Step 2: Upload File */}
      <div className="bulk-reg-section">
        <div className="section-header">
          <span className="step-number">2</span>
          <h3>Upload CSV File</h3>
        </div>
        <p className="section-description">
          Upload your filled CSV file. We'll validate the data before registration.
        </p>

        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            id="csv-upload"
            className="file-input"
          />
          <label htmlFor="csv-upload" className="upload-label">
            <div className="upload-icon">📂</div>
            <p className="upload-text">
              {selectedFile ? selectedFile.name : 'Drag & drop CSV file here or click to browse'}
            </p>
            <p className="upload-hint">Supported format: .csv (max 1000 rows)</p>
          </label>
        </div>
      </div>

      {/* Step 3: Preview & Validate */}
      {previewData.length > 0 && (
        <div className="bulk-reg-section">
          <div className="section-header">
            <span className="step-number">3</span>
            <h3>Preview & Validate</h3>
          </div>

          {errors.length > 0 && (
            <div className="validation-errors">
              <h4>⚠️ Validation Errors ({errors.length})</h4>
              <div className="errors-list">
                {errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="error-item">
                    <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                  </div>
                ))}
                {errors.length > 5 && (
                  <div className="error-item">+ {errors.length - 5} more errors...</div>
                )}
              </div>
            </div>
          )}

          <div className="preview-stats">
            <div className="stat-card success">
              <span className="stat-number">{previewData.length - errors.length}</span>
              <span className="stat-label">Valid Users</span>
            </div>
            <div className="stat-card error">
              <span className="stat-number">{errors.length}</span>
              <span className="stat-label">Errors</span>
            </div>
            <div className="stat-card total">
              <span className="stat-number">{previewData.length}</span>
              <span className="stat-label">Total Rows</span>
            </div>
          </div>

          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((row, index) => (
                  <tr key={index} className={row.hasErrors ? 'error-row' : 'success-row'}>
                    <td>{row.rowNumber}</td>
                    <td>{row.firstName}</td>
                    <td>{row.lastName}</td>
                    <td>{row.email}</td>
                    <td>{row.role}</td>
                    <td>{row.grade || '-'}</td>
                    <td>
                      {row.hasErrors ? (
                        <span className="status-badge error">Error</span>
                      ) : (
                        <span className="status-badge success">Valid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <p className="preview-note">Showing first 10 rows. Total: {previewData.length} rows</p>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Confirm & Upload */}
      {previewData.length > 0 && (
        <div className="bulk-reg-section">
          <div className="section-header">
            <span className="step-number">4</span>
            <h3>Confirm & Upload</h3>
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="progress-text">Uploading... {uploadProgress}%</p>
            </div>
          )}

          {uploadResult && (
            <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
              {uploadResult.success ? (
                <>
                  <div className="result-icon">✅</div>
                  <h4>Upload Successful!</h4>
                  <p>
                    Successfully registered {uploadResult.successCount} users.
                    {uploadResult.failedCount > 0 && ` ${uploadResult.failedCount} failed.`}
                  </p>
                  <p className="result-note">
                    Welcome emails with login credentials have been sent to all users.
                  </p>
                </>
              ) : (
                <>
                  <div className="result-icon">❌</div>
                  <h4>Upload Failed</h4>
                  <p>{uploadResult.message}</p>
                </>
              )}
            </div>
          )}

          <div className="upload-actions">
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={uploading || errors.length > 0 || !previewData.length}
            >
              {uploading ? 'Uploading...' : `Register ${previewData.length - errors.length} Users`}
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setSelectedFile(null);
                setPreviewData([]);
                setErrors([]);
                setUploadResult(null);
              }}
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bulk-reg-section instructions">
        <h3>📖 Instructions</h3>
        <ol>
          <li>Download the CSV template and fill in user information</li>
          <li>Required fields: firstName, lastName, email, role</li>
          <li>Valid roles: STUDENT, TEACHER, PARENT, COUNSELOR, CONTENT_CREATOR</li>
          <li>For students, include grade, section, and rollNumber</li>
          <li>Upload the CSV file and review the preview</li>
          <li>Fix any validation errors</li>
          <li>Click "Register Users" to complete bulk registration</li>
          <li>Users will receive welcome emails with login credentials</li>
        </ol>
      </div>
    </div>
  );
};

export default BulkRegistration;
