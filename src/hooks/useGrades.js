import { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../Config';

/**
 * Custom hook to fetch and manage grades from the API
 * Replaces hardcoded grade arrays throughout the application
 */
export const useGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/grades/active`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        // Sort by displayOrder and extract grade codes
        const sortedGrades = (response.data || [])
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(g => g.gradeCode);

        setGrades(sortedGrades);
        setError(null);
      } catch (err) {
        console.error('Error fetching grades:', err);
        // Fallback to default grades if API fails
        const fallbackGrades = ['PRE_K', 'KINDERGARTEN', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        setGrades(fallbackGrades);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return { grades, loading, error };
};
