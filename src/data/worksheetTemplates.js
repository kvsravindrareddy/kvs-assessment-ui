/**
 * Predefined Worksheet Templates
 * 50+ ready-to-use worksheet configurations
 */

export const WORKSHEET_TEMPLATES = {
  multiplicationTables: [
    { id: 1, name: 'Tables 1-5 (Beginner)', from: 1, to: 5, description: 'Perfect for early learners' },
    { id: 2, name: 'Tables 2-10 (Essential)', from: 2, to: 10, description: 'Most commonly used tables' },
    { id: 3, name: 'Tables 1-10 (Complete Basic)', from: 1, to: 10, description: 'Full basic multiplication' },
    { id: 4, name: 'Tables 1-12 (Standard)', from: 1, to: 12, description: 'Complete standard set' },
    { id: 5, name: 'Tables 1-15 (Extended)', from: 1, to: 15, description: 'Extended practice' },
    { id: 6, name: 'Tables 11-20 (Advanced)', from: 11, to: 20, description: 'For advanced students' },
    { id: 7, name: 'Even Tables (2,4,6,8,10)', from: 2, to: 10, description: 'Even numbers only', filter: 'even' },
    { id: 8, name: 'Odd Tables (1,3,5,7,9)', from: 1, to: 9, description: 'Odd numbers only', filter: 'odd' },
    { id: 9, name: 'Tables 5-15', from: 5, to: 15, description: 'Mid-range practice' },
    { id: 10, name: 'Tables 10-20', from: 10, to: 20, description: 'Higher numbers' }
  ],

  addition: [
    // Beginner Level (1-20)
    { id: 1, name: 'Addition 1-10 (20 problems)', count: 20, max: 10, difficulty: 'beginner', description: 'Single digit addition' },
    { id: 2, name: 'Addition 1-20 (30 problems)', count: 30, max: 20, difficulty: 'beginner', description: 'Numbers up to 20' },
    { id: 3, name: 'Addition 1-20 (50 problems)', count: 50, max: 20, difficulty: 'beginner', description: 'Extended practice' },

    // Easy Level (1-50)
    { id: 4, name: 'Addition 1-30 (20 problems)', count: 20, max: 30, difficulty: 'easy', description: 'Two-digit introduction' },
    { id: 5, name: 'Addition 1-50 (25 problems)', count: 25, max: 50, difficulty: 'easy', description: 'Easy two-digit' },
    { id: 6, name: 'Addition 1-50 (40 problems)', count: 40, max: 50, difficulty: 'easy', description: 'Extended two-digit' },

    // Medium Level (1-100)
    { id: 7, name: 'Addition 1-100 (20 problems)', count: 20, max: 100, difficulty: 'medium', description: 'Standard two-digit' },
    { id: 8, name: 'Addition 1-100 (30 problems)', count: 30, max: 100, difficulty: 'medium', description: 'Medium practice' },
    { id: 9, name: 'Addition 1-100 (50 problems)', count: 50, max: 100, difficulty: 'medium', description: 'Comprehensive practice' },

    // Hard Level (1-500)
    { id: 10, name: 'Addition 1-200 (25 problems)', count: 25, max: 200, difficulty: 'hard', description: 'Three-digit introduction' },
    { id: 11, name: 'Addition 1-500 (30 problems)', count: 30, max: 500, difficulty: 'hard', description: 'Large numbers' },
    { id: 12, name: 'Addition 1-1000 (20 problems)', count: 20, max: 1000, difficulty: 'hard', description: 'Four-digit challenge' }
  ],

  subtraction: [
    // Beginner Level
    { id: 1, name: 'Subtraction 1-10 (20 problems)', count: 20, max: 10, difficulty: 'beginner', description: 'Single digit subtraction' },
    { id: 2, name: 'Subtraction 1-20 (30 problems)', count: 30, max: 20, difficulty: 'beginner', description: 'Numbers up to 20' },
    { id: 3, name: 'Subtraction 1-20 (50 problems)', count: 50, max: 20, difficulty: 'beginner', description: 'Extended practice' },

    // Easy Level
    { id: 4, name: 'Subtraction 1-30 (20 problems)', count: 20, max: 30, difficulty: 'easy', description: 'Two-digit introduction' },
    { id: 5, name: 'Subtraction 1-50 (25 problems)', count: 25, max: 50, difficulty: 'easy', description: 'Easy two-digit' },
    { id: 6, name: 'Subtraction 1-50 (40 problems)', count: 40, max: 50, difficulty: 'easy', description: 'Extended two-digit' },

    // Medium Level
    { id: 7, name: 'Subtraction 1-100 (20 problems)', count: 20, max: 100, difficulty: 'medium', description: 'Standard two-digit' },
    { id: 8, name: 'Subtraction 1-100 (30 problems)', count: 30, max: 100, difficulty: 'medium', description: 'Medium practice' },
    { id: 9, name: 'Subtraction 1-100 (50 problems)', count: 50, max: 100, difficulty: 'medium', description: 'Comprehensive practice' },

    // Hard Level
    { id: 10, name: 'Subtraction 1-200 (25 problems)', count: 25, max: 200, difficulty: 'hard', description: 'Three-digit introduction' },
    { id: 11, name: 'Subtraction 1-500 (30 problems)', count: 30, max: 500, difficulty: 'hard', description: 'Large numbers' },
    { id: 12, name: 'Subtraction 1-1000 (20 problems)', count: 20, max: 1000, difficulty: 'hard', description: 'Four-digit challenge' }
  ],

  multiplication: [
    // Beginner Level (Tables 1-5)
    { id: 1, name: 'Multiplication Tables 1-5 (20 problems)', count: 20, max: 5, difficulty: 'beginner', description: 'Easy tables' },
    { id: 2, name: 'Multiplication Tables 1-5 (30 problems)', count: 30, max: 5, difficulty: 'beginner', description: 'Basic practice' },
    { id: 3, name: 'Multiplication Tables 1-5 (50 problems)', count: 50, max: 5, difficulty: 'beginner', description: 'Extended basic' },

    // Easy Level (Tables 1-10)
    { id: 4, name: 'Multiplication Tables 1-10 (20 problems)', count: 20, max: 10, difficulty: 'easy', description: 'Standard tables' },
    { id: 5, name: 'Multiplication Tables 1-10 (30 problems)', count: 30, max: 10, difficulty: 'easy', description: 'Common practice' },
    { id: 6, name: 'Multiplication Tables 1-10 (50 problems)', count: 50, max: 10, difficulty: 'easy', description: 'Comprehensive' },

    // Medium Level (Tables 1-12)
    { id: 7, name: 'Multiplication Tables 1-12 (25 problems)', count: 25, max: 12, difficulty: 'medium', description: 'Complete tables' },
    { id: 8, name: 'Multiplication Tables 1-12 (40 problems)', count: 40, max: 12, difficulty: 'medium', description: 'Full practice' },
    { id: 9, name: 'Multiplication Tables 1-12 (60 problems)', count: 60, max: 12, difficulty: 'medium', description: 'Extended practice' },

    // Hard Level (Tables up to 20)
    { id: 10, name: 'Multiplication Tables 1-15 (30 problems)', count: 30, max: 15, difficulty: 'hard', description: 'Advanced tables' },
    { id: 11, name: 'Multiplication Tables 1-20 (40 problems)', count: 40, max: 20, difficulty: 'hard', description: 'Expert level' },
    { id: 12, name: 'Multiplication Mixed (50 problems)', count: 50, max: 20, difficulty: 'hard', description: 'Random challenge' }
  ],

  division: [
    // Beginner Level
    { id: 1, name: 'Division by 1-5 (20 problems)', count: 20, max: 50, difficulty: 'beginner', description: 'Simple division' },
    { id: 2, name: 'Division up to 50 (25 problems)', count: 25, max: 50, difficulty: 'beginner', description: 'Basic practice' },
    { id: 3, name: 'Division up to 50 (40 problems)', count: 40, max: 50, difficulty: 'beginner', description: 'Extended basic' },

    // Easy Level
    { id: 4, name: 'Division up to 100 (20 problems)', count: 20, max: 100, difficulty: 'easy', description: 'Two-digit dividends' },
    { id: 5, name: 'Division up to 100 (30 problems)', count: 30, max: 100, difficulty: 'easy', description: 'Standard practice' },
    { id: 6, name: 'Division up to 100 (50 problems)', count: 50, max: 100, difficulty: 'easy', description: 'Comprehensive' },

    // Medium Level
    { id: 7, name: 'Division up to 144 (25 problems)', count: 25, max: 144, difficulty: 'medium', description: 'Tables up to 12' },
    { id: 8, name: 'Division up to 200 (30 problems)', count: 30, max: 200, difficulty: 'medium', description: 'Larger dividends' },
    { id: 9, name: 'Division up to 200 (50 problems)', count: 50, max: 200, difficulty: 'medium', description: 'Extended practice' },

    // Hard Level
    { id: 10, name: 'Division up to 500 (30 problems)', count: 30, max: 500, difficulty: 'hard', description: 'Three-digit division' },
    { id: 11, name: 'Division up to 1000 (40 problems)', count: 40, max: 1000, difficulty: 'hard', description: 'Large numbers' },
    { id: 12, name: 'Division Mixed (50 problems)', count: 50, max: 1000, difficulty: 'hard', description: 'Expert challenge' }
  ],

  numberWriting: [
    { id: 1, name: 'Numbers 1-20 (30% missing)', from: 1, to: 20, percentage: 30, description: 'Basic counting' },
    { id: 2, name: 'Numbers 1-50 (40% missing)', from: 1, to: 50, percentage: 40, description: 'Counting to 50' },
    { id: 3, name: 'Numbers 1-100 (50% missing)', from: 1, to: 100, percentage: 50, description: 'Complete hundreds' },
    { id: 4, name: 'Numbers 1-100 (70% missing)', from: 1, to: 100, percentage: 70, description: 'Challenge mode' },
    { id: 5, name: 'Numbers 50-150 (40% missing)', from: 50, to: 150, percentage: 40, description: 'Mid-range' },
    { id: 6, name: 'Numbers 100-200 (50% missing)', from: 100, to: 200, percentage: 50, description: 'Hundreds practice' },
    { id: 7, name: 'Numbers 1-200 (30% missing)', from: 1, to: 200, percentage: 30, description: 'Extended range' },
    { id: 8, name: 'Numbers 200-300 (40% missing)', from: 200, to: 300, percentage: 40, description: 'Higher numbers' },
    { id: 9, name: 'Even Numbers 2-100 (50% missing)', from: 2, to: 100, percentage: 50, description: 'Even only', filter: 'even' },
    { id: 10, name: 'Odd Numbers 1-99 (50% missing)', from: 1, to: 99, percentage: 50, description: 'Odd only', filter: 'odd' }
  ],

  mixedOperations: [
    // Beginner Level
    { id: 1, name: 'Mixed Ops 1-20 (20 problems)', count: 20, max: 20, difficulty: 'beginner', description: 'All four operations' },
    { id: 2, name: 'Mixed Ops 1-20 (30 problems)', count: 30, max: 20, difficulty: 'beginner', description: 'Basic mixed' },
    { id: 3, name: 'Mixed Ops 1-20 (50 problems)', count: 50, max: 20, difficulty: 'beginner', description: 'Extended basic' },

    // Easy Level
    { id: 4, name: 'Mixed Ops 1-50 (20 problems)', count: 20, max: 50, difficulty: 'easy', description: 'Two-digit mixed' },
    { id: 5, name: 'Mixed Ops 1-50 (30 problems)', count: 30, max: 50, difficulty: 'easy', description: 'Standard mixed' },
    { id: 6, name: 'Mixed Ops 1-50 (50 problems)', count: 50, max: 50, difficulty: 'easy', description: 'Comprehensive' },

    // Medium Level
    { id: 7, name: 'Mixed Ops 1-100 (25 problems)', count: 25, max: 100, difficulty: 'medium', description: 'All operations' },
    { id: 8, name: 'Mixed Ops 1-100 (40 problems)', count: 40, max: 100, difficulty: 'medium', description: 'Standard practice' },
    { id: 9, name: 'Mixed Ops 1-100 (60 problems)', count: 60, max: 100, difficulty: 'medium', description: 'Extended practice' },

    // Hard Level
    { id: 10, name: 'Mixed Ops 1-200 (30 problems)', count: 30, max: 200, difficulty: 'hard', description: 'Three-digit mixed' },
    { id: 11, name: 'Mixed Ops 1-500 (40 problems)', count: 40, max: 500, difficulty: 'hard', description: 'Large numbers' },
    { id: 12, name: 'Mixed Ops Challenge (50 problems)', count: 50, max: 1000, difficulty: 'hard', description: 'Expert challenge' }
  ]
};

/**
 * Get template by category and ID
 */
export const getTemplate = (category, id) => {
  return WORKSHEET_TEMPLATES[category]?.find(t => t.id === id);
};

/**
 * Get all templates for a category
 */
export const getTemplatesByCategory = (category) => {
  return WORKSHEET_TEMPLATES[category] || [];
};

/**
 * Get template count
 */
export const getTemplateCount = () => {
  return Object.values(WORKSHEET_TEMPLATES).reduce((sum, arr) => sum + arr.length, 0);
};
