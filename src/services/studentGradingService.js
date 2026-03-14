import axios from 'axios';
import CONFIG from '../Config';

/**
 * Student Grading Dashboard API Service
 *
 * Provides methods to fetch grading dashboard data from kobs-assessment-service
 */
class StudentGradingService {

  /**
   * Get comprehensive grading dashboard for student
   */
  async getGradingDashboard(userId) {
    try {
      const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/student/grading-dashboard`;
      const params = userId ? { userId } : {};

      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching grading dashboard:', error);
      throw error;
    }
  }

  /**
   * Get subject-wise performance breakdown
   */
  async getSubjectBreakdown(userId) {
    try {
      const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/student/grading-dashboard/subjects`;
      const params = userId ? { userId } : {};

      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching subject breakdown:', error);
      throw error;
    }
  }

  /**
   * Get performance trends for charts
   */
  async getPerformanceTrends(userId) {
    try {
      const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/student/grading-dashboard/trends`;
      const params = userId ? { userId } : {};

      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching performance trends:', error);
      throw error;
    }
  }

  /**
   * Get recent graded exams
   */
  async getRecentExams(userId, limit = 10) {
    try {
      const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/student/grading-dashboard/exams`;
      const params = { limit };
      if (userId) params.userId = userId;

      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching recent exams:', error);
      throw error;
    }
  }

  /**
   * Get overall performance summary
   */
  async getOverallPerformance(userId) {
    try {
      const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/student/grading-dashboard/overall`;
      const params = userId ? { userId } : {};

      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching overall performance:', error);
      throw error;
    }
  }

  /**
   * Trigger metrics computation
   */
  async computeMetrics(userId) {
    try {
      const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/student/grading-dashboard/compute-metrics`;
      const params = userId ? { userId } : {};

      const response = await axios.post(url, null, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error computing metrics:', error);
      throw error;
    }
  }

  /**
   * Get student profile
   */
  async getProfile(userId) {
    try {
      const url = userId
        ? `${CONFIG.development.ADMIN_BASE_URL}/v1/student/profile/${userId}`
        : `${CONFIG.development.ADMIN_BASE_URL}/v1/student/profile/me`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  /**
   * Create or update student profile
   */
  async createOrUpdateProfile(profileData) {
    try {
      const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/student/profile`;

      const response = await axios.post(url, profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error saving student profile:', error);
      throw error;
    }
  }
}

export default new StudentGradingService();
