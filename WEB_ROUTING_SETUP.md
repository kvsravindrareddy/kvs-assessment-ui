# Web UI Routing Setup for Exam Grading System

## Components Created

1. **ExamUpload.jsx** - Upload exam papers
2. **ExamGradingResults.jsx** - View grading results with real-time status
3. **ExamReview.jsx** - Review and approve AI grading
4. **ExamHistory.jsx** - List all exam submissions

## CSS Files Created

1. **ExamUpload.css**
2. **ExamGradingResults.css**
3. **ExamReview.css**
4. **ExamHistory.css**

## Routes to Add

Add these routes to your main routing file (e.g., `App.jsx` or `Routes.jsx`):

```javascript
import ExamUpload from './pages/teacher/ExamUpload';
import ExamGradingResults from './pages/teacher/ExamGradingResults';
import ExamReview from './pages/teacher/ExamReview';
import ExamHistory from './pages/teacher/ExamHistory';

// In your Routes component:
<Route path="/exam-upload" element={<ExamUpload />} />
<Route path="/exam-results/:submissionId" element={<ExamGradingResults />} />
<Route path="/exam-review/:submissionId" element={<ExamReview />} />
<Route path="/exams" element={<ExamHistory />} />
```

## Navigation Links

Add these links to your navigation menu for teachers:

```jsx
{userRole === 'TEACHER' && (
  <>
    <Link to="/exam-upload">Upload Exam</Link>
    <Link to="/exams">Exam History</Link>
  </>
)}
```

For students:
```jsx
{userRole === 'STUDENT' && (
  <Link to="/exams">My Exams</Link>
)}
```

## User Flow

### Teacher Flow:
1. **Upload**: `/exam-upload` → Upload exam paper
2. **Processing**: Redirects to `/exam-results/{submissionId}` → Shows real-time processing status
3. **Review**: Click "Review & Approve" button → `/exam-review/{submissionId}` → Adjust scores
4. **History**: `/exams` → View all submissions

### Student Flow:
1. **History**: `/exams` → View personal exam submissions
2. **Results**: Click "View" → `/exam-results/{submissionId}` → See detailed results

## Configuration Required

Ensure your `Config.js` file has the correct backend URL:

```javascript
const CONFIG = {
  development: {
    ADMIN_SUPPORT_BASE_URL: 'http://localhost:8083/api'  // or your backend URL
  }
};
```

## LocalStorage Keys Used

- `userId` - User ID (student or teacher)
- `userName` - User name
- `userRole` - User role (STUDENT, TEACHER)

Make sure these are set during login.

## Features

### ExamUpload
- Student information form
- Assessment details
- File upload with validation (PDF, JPG, PNG, HEIC)
- Progress tracking
- Auto-redirect after upload

### ExamGradingResults
- Real-time status polling
- Processing animation
- Score display with color coding
- Question-by-question breakdown
- AI confidence meters
- Teacher feedback display

### ExamReview
- Side-by-side score comparison
- Individual question score adjustment
- Teacher feedback per question
- Overall review notes
- Real-time total recalculation

### ExamHistory
- Filterable table view
- Status filtering
- Student filtering (for teachers)
- Pagination
- View/Review buttons
- Separate views for students and teachers

## API Endpoints Used

- `POST /admin-assessment/v1/exams/upload` - Upload exam
- `GET /admin-assessment/v1/exams/{id}/status` - Get processing status
- `GET /admin-assessment/v1/exams/{id}` - Get grading results
- `POST /admin-assessment/v1/exams/{id}/review` - Submit review
- `GET /admin-assessment/v1/exams/student/{userId}` - Get student submissions
- `GET /admin-assessment/v1/exams/teacher/{userId}` - Get teacher submissions
- `GET /admin-assessment/v1/exams/admin/submissions` - Get all submissions (with filters)

## Next Steps

1. Add routes to your routing configuration
2. Add navigation links to your menu
3. Test the complete flow
4. Deploy backend API if not already running
