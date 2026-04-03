import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import CONFIG from '../../../Config';
import './ClassProgressViewer.css';

const ClassProgressViewer = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchTeacherClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTeacherClasses = async () => {
    try {
      const teacherId = user ? (user.id || user.email) : 'GUEST_USER';
      const response = await axios.get(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/teacher/classes?teacherId=${encodeURIComponent(teacherId)}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setClasses(response.data.classes || []);
        if (response.data.classes?.length > 0) {
          setSelectedClass(response.data.classes[0].classCode);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, dateRange]);

  const fetchClassStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/teacher/class/${selectedClass}/students?dateRange=${dateRange}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/student/grading-dashboard?userId=${encodeURIComponent(studentId)}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setStudentDetails(response.data.dashboard);
        setSelectedStudent(studentId);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const data = students.map(s => ({
      Name: s.name || s.userId,
      'Roll No': s.rollNumber || 'N/A',
      'Avg Score': `${s.avgScore || 0}%`,
      'Total Exams': s.totalExams || 0,
      Grade: s.letterGrade || 'N/A'
    }));
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class_${selectedClass}_report.csv`;
    a.click();
  };

  return (
    <div className="class-progress-container">
      <div className="progress-header">
        <h2><span>📊</span> Class Progress Viewer</h2>
        <p>Monitor student performance across your classes</p>
      </div>

      <div className="progress-controls">
        <div className="control-group">
          <label>Select Class:</label>
          <select value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value)} className="form-select">
            {classes.map(c => (
              <option key={c.classCode} value={c.classCode}>{c.className || c.classCode}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="form-select">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <button onClick={exportReport} disabled={students.length === 0} className="btn-export">📥 Export Report</button>
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      {!loading && selectedClass && (
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Avg Score</th>
                <th>Total Exams</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center',color:'#94a3b8'}}>No students found in this class</td></tr>
              ) : (
                students.map((student, index) => (
                  <tr key={index}>
                    <td>{student.rollNumber || 'N/A'}</td>
                    <td>{student.name || student.userId}</td>
                    <td><span className="score-badge">{student.avgScore || 0}%</span></td>
                    <td>{student.totalExams || 0}</td>
                    <td><span className={`grade-badge grade-${(student.letterGrade || 'F')[0]}`}>{student.letterGrade || 'N/A'}</span></td>
                    <td>
                      <button onClick={() => fetchStudentDetails(student.userId)} className="btn-view-details">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudent && studentDetails && (
        <div className="student-detail-modal" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedStudent(null)}>×</button>
            <h3>{selectedStudent} - Performance Details</h3>
            <div className="detail-stats">
              <div className="detail-stat"><span>Overall:</span><strong>{studentDetails.overallPerformance?.overallPercentage?.toFixed(1)}%</strong></div>
              <div className="detail-stat"><span>GPA:</span><strong>{studentDetails.overallPerformance?.gpa?.toFixed(2)}</strong></div>
              <div className="detail-stat"><span>Grade:</span><strong>{studentDetails.overallPerformance?.letterGrade}</strong></div>
            </div>
            <div className="subject-breakdown">
              <h4>Subject Breakdown</h4>
              {studentDetails.subjectBreakdown?.map((sub, i) => (
                <div key={i} className="subject-item">
                  <span>{sub.subject}</span>
                  <span>{sub.averageScore}% ({sub.letterGrade})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassProgressViewer;
