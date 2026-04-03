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

  simpleAddition: [
    { id: 1, name: 'Simple Addition 1-10 (20 problems)', count: 20, max: 10, description: 'Single digit vertical format' },
    { id: 2, name: 'Simple Addition 1-20 (30 problems)', count: 30, max: 20, description: 'Numbers up to 20' },
    { id: 3, name: 'Simple Addition 1-20 (40 problems)', count: 40, max: 20, description: 'Extended practice' },
    { id: 4, name: 'Simple Addition 1-50 (25 problems)', count: 25, max: 50, description: 'Two-digit addition' },
    { id: 5, name: 'Simple Addition 1-100 (30 problems)', count: 30, max: 100, description: 'Larger numbers' },
    { id: 6, name: 'Simple Addition 1-100 (50 problems)', count: 50, max: 100, description: 'Comprehensive practice' }
  ],

  simpleSubtraction: [
    { id: 1, name: 'Simple Subtraction 1-10 (20 problems)', count: 20, max: 10, description: 'Single digit vertical format' },
    { id: 2, name: 'Simple Subtraction 1-20 (30 problems)', count: 30, max: 20, description: 'Numbers up to 20' },
    { id: 3, name: 'Simple Subtraction 1-20 (40 problems)', count: 40, max: 20, description: 'Extended practice' },
    { id: 4, name: 'Simple Subtraction 1-50 (25 problems)', count: 25, max: 50, description: 'Two-digit subtraction' },
    { id: 5, name: 'Simple Subtraction 1-100 (30 problems)', count: 30, max: 100, description: 'Larger numbers' },
    { id: 6, name: 'Simple Subtraction 1-100 (50 problems)', count: 50, max: 100, description: 'Comprehensive practice' }
  ],

  simpleMultiplication: [
    { id: 1, name: 'Simple Multiplication 1-5 (20 problems)', count: 20, max: 5, description: 'Easy tables vertical format' },
    { id: 2, name: 'Simple Multiplication 1-10 (30 problems)', count: 30, max: 10, description: 'Standard tables' },
    { id: 3, name: 'Simple Multiplication 1-10 (40 problems)', count: 40, max: 10, description: 'Extended practice' },
    { id: 4, name: 'Simple Multiplication 1-12 (25 problems)', count: 25, max: 12, description: 'Complete tables' },
    { id: 5, name: 'Simple Multiplication 1-15 (30 problems)', count: 30, max: 15, description: 'Advanced practice' },
    { id: 6, name: 'Simple Multiplication 1-20 (40 problems)', count: 40, max: 20, description: 'Expert level' }
  ],

  simpleDivision: [
    { id: 1, name: 'Simple Division up to 50 (20 problems)', count: 20, max: 50, description: 'Long division format' },
    { id: 2, name: 'Simple Division up to 100 (30 problems)', count: 30, max: 100, description: 'Two-digit dividends' },
    { id: 3, name: 'Simple Division up to 100 (40 problems)', count: 40, max: 100, description: 'Extended practice' },
    { id: 4, name: 'Simple Division up to 144 (25 problems)', count: 25, max: 144, description: 'Tables up to 12' },
    { id: 5, name: 'Simple Division up to 200 (30 problems)', count: 30, max: 200, description: 'Larger dividends' },
    { id: 6, name: 'Simple Division up to 500 (40 problems)', count: 40, max: 500, description: 'Three-digit division' }
  ],

  romanNumeralsBasic: [
    { id: 1, name: 'Roman Numerals I-X (15 problems)', count: 15, description: 'Basic 1-10 conversion' },
    { id: 2, name: 'Roman Numerals I-X (20 problems)', count: 20, description: 'Standard practice' },
    { id: 3, name: 'Roman Numerals I-X (30 problems)', count: 30, description: 'Extended practice' },
    { id: 4, name: 'Roman Numerals I-X (40 problems)', count: 40, description: 'Comprehensive' }
  ],

  romanNumeralsAdvanced: [
    { id: 1, name: 'Roman Numerals X-C (15 problems)', count: 15, description: 'Numbers 10-100' },
    { id: 2, name: 'Roman Numerals X-C (20 problems)', count: 20, description: 'Two-digit Roman' },
    { id: 3, name: 'Roman Numerals X-D (25 problems)', count: 25, description: 'Up to 500' },
    { id: 4, name: 'Roman Numerals X-M (30 problems)', count: 30, description: 'Up to 1000' },
    { id: 5, name: 'Roman Numerals Challenge (40 problems)', count: 40, description: 'Mixed difficulty' }
  ],

  romanToArabic: [
    { id: 1, name: 'Roman to Arabic 1-20 (15 problems)', count: 15, max: 20, description: 'Basic conversion' },
    { id: 2, name: 'Roman to Arabic 1-50 (20 problems)', count: 20, max: 50, description: 'Standard practice' },
    { id: 3, name: 'Roman to Arabic 1-100 (25 problems)', count: 25, max: 100, description: 'Two-digit numbers' },
    { id: 4, name: 'Roman to Arabic 1-500 (30 problems)', count: 30, max: 500, description: 'Large numbers' },
    { id: 5, name: 'Roman to Arabic 1-1000 (35 problems)', count: 35, max: 1000, description: 'Expert level' }
  ],

  arabicToRoman: [
    { id: 1, name: 'Arabic to Roman 1-20 (15 problems)', count: 15, max: 20, description: 'Basic conversion' },
    { id: 2, name: 'Arabic to Roman 1-50 (20 problems)', count: 20, max: 50, description: 'Standard practice' },
    { id: 3, name: 'Arabic to Roman 1-100 (25 problems)', count: 25, max: 100, description: 'Two-digit numbers' },
    { id: 4, name: 'Arabic to Roman 1-500 (30 problems)', count: 30, max: 500, description: 'Large numbers' },
    { id: 5, name: 'Arabic to Roman 1-1000 (35 problems)', count: 35, max: 1000, description: 'Expert level' }
  ],

  timeClock: [
    { id: 1, name: 'Time Reading Easy (15 problems)', count: 15, difficulty: 'easy', description: 'Quarter hours only' },
    { id: 2, name: 'Time Reading Easy (20 problems)', count: 20, difficulty: 'easy', description: 'Basic clock reading' },
    { id: 3, name: 'Time Reading Medium (20 problems)', count: 20, difficulty: 'medium', description: 'Any minute' },
    { id: 4, name: 'Time Reading Medium (30 problems)', count: 30, difficulty: 'medium', description: 'Standard practice' },
    { id: 5, name: 'Time Reading Hard (25 problems)', count: 25, difficulty: 'hard', description: 'Complex times' }
  ],

  moneyCurrency: [
    { id: 1, name: 'Money Easy (15 problems)', count: 15, difficulty: 'easy', description: 'Simple addition/subtraction' },
    { id: 2, name: 'Money Easy (20 problems)', count: 20, difficulty: 'easy', description: 'Up to $20' },
    { id: 3, name: 'Money Medium (20 problems)', count: 20, difficulty: 'medium', description: 'Up to $100' },
    { id: 4, name: 'Money Medium (30 problems)', count: 30, difficulty: 'medium', description: 'Standard practice' },
    { id: 5, name: 'Money Hard (25 problems)', count: 25, difficulty: 'hard', description: 'Up to $500' }
  ],

  measurements: [
    { id: 1, name: 'Measurements Easy (15 problems)', count: 15, difficulty: 'easy', description: 'Basic conversions' },
    { id: 2, name: 'Measurements Easy (20 problems)', count: 20, difficulty: 'easy', description: 'cm, m, km' },
    { id: 3, name: 'Measurements Medium (20 problems)', count: 20, difficulty: 'medium', description: 'Multiple units' },
    { id: 4, name: 'Measurements Medium (30 problems)', count: 30, difficulty: 'medium', description: 'Standard practice' },
    { id: 5, name: 'Measurements Hard (25 problems)', count: 25, difficulty: 'hard', description: 'Complex conversions' }
  ],

  patterns: [
    { id: 1, name: 'Patterns Easy (15 problems)', count: 15, difficulty: 'easy', description: 'Simple sequences' },
    { id: 2, name: 'Patterns Easy (20 problems)', count: 20, difficulty: 'easy', description: 'Basic patterns' },
    { id: 3, name: 'Patterns Medium (20 problems)', count: 20, difficulty: 'medium', description: 'Skip counting' },
    { id: 4, name: 'Patterns Medium (30 problems)', count: 30, difficulty: 'medium', description: 'Standard practice' },
    { id: 5, name: 'Patterns Hard (25 problems)', count: 25, difficulty: 'hard', description: 'Complex sequences' }
  ],

  addition: [
    { id: 1, name: 'Addition 1-10 (20 problems)', count: 20, max: 10, difficulty: 'beginner', description: 'Single digit addition' },
    { id: 2, name: 'Addition 1-20 (30 problems)', count: 30, max: 20, difficulty: 'beginner', description: 'Numbers up to 20' },
    { id: 3, name: 'Addition 1-20 (50 problems)', count: 50, max: 20, difficulty: 'beginner', description: 'Extended practice' },
    { id: 4, name: 'Addition 1-30 (20 problems)', count: 20, max: 30, difficulty: 'easy', description: 'Two-digit introduction' },
    { id: 5, name: 'Addition 1-50 (25 problems)', count: 25, max: 50, difficulty: 'easy', description: 'Easy two-digit' },
    { id: 6, name: 'Addition 1-50 (40 problems)', count: 40, max: 50, difficulty: 'easy', description: 'Extended two-digit' },
    { id: 7, name: 'Addition 1-100 (20 problems)', count: 20, max: 100, difficulty: 'medium', description: 'Standard two-digit' },
    { id: 8, name: 'Addition 1-100 (30 problems)', count: 30, max: 100, difficulty: 'medium', description: 'Medium practice' },
    { id: 9, name: 'Addition 1-100 (50 problems)', count: 50, max: 100, difficulty: 'medium', description: 'Comprehensive practice' },
    { id: 10, name: 'Addition 1-200 (25 problems)', count: 25, max: 200, difficulty: 'hard', description: 'Three-digit introduction' },
    { id: 11, name: 'Addition 1-500 (30 problems)', count: 30, max: 500, difficulty: 'hard', description: 'Large numbers' },
    { id: 12, name: 'Addition 1-1000 (20 problems)', count: 20, max: 1000, difficulty: 'hard', description: 'Four-digit challenge' }
  ],

  subtraction: [
    { id: 1, name: 'Subtraction 1-10 (20 problems)', count: 20, max: 10, difficulty: 'beginner', description: 'Single digit subtraction' },
    { id: 2, name: 'Subtraction 1-20 (30 problems)', count: 30, max: 20, difficulty: 'beginner', description: 'Numbers up to 20' },
    { id: 3, name: 'Subtraction 1-20 (50 problems)', count: 50, max: 20, difficulty: 'beginner', description: 'Extended practice' },
    { id: 4, name: 'Subtraction 1-30 (20 problems)', count: 20, max: 30, difficulty: 'easy', description: 'Two-digit introduction' },
    { id: 5, name: 'Subtraction 1-50 (25 problems)', count: 25, max: 50, difficulty: 'easy', description: 'Easy two-digit' },
    { id: 6, name: 'Subtraction 1-50 (40 problems)', count: 40, max: 50, difficulty: 'easy', description: 'Extended two-digit' },
    { id: 7, name: 'Subtraction 1-100 (20 problems)', count: 20, max: 100, difficulty: 'medium', description: 'Standard two-digit' },
    { id: 8, name: 'Subtraction 1-100 (30 problems)', count: 30, max: 100, difficulty: 'medium', description: 'Medium practice' },
    { id: 9, name: 'Subtraction 1-100 (50 problems)', count: 50, max: 100, difficulty: 'medium', description: 'Comprehensive practice' },
    { id: 10, name: 'Subtraction 1-200 (25 problems)', count: 25, max: 200, difficulty: 'hard', description: 'Three-digit introduction' },
    { id: 11, name: 'Subtraction 1-500 (30 problems)', count: 30, max: 500, difficulty: 'hard', description: 'Large numbers' },
    { id: 12, name: 'Subtraction 1-1000 (20 problems)', count: 20, max: 1000, difficulty: 'hard', description: 'Four-digit challenge' }
  ],

  multiplication: [
    { id: 1, name: 'Multiplication Tables 1-5 (20 problems)', count: 20, max: 5, difficulty: 'beginner', description: 'Easy tables' },
    { id: 2, name: 'Multiplication Tables 1-5 (30 problems)', count: 30, max: 5, difficulty: 'beginner', description: 'Basic practice' },
    { id: 3, name: 'Multiplication Tables 1-5 (50 problems)', count: 50, max: 5, difficulty: 'beginner', description: 'Extended basic' },
    { id: 4, name: 'Multiplication Tables 1-10 (20 problems)', count: 20, max: 10, difficulty: 'easy', description: 'Standard tables' },
    { id: 5, name: 'Multiplication Tables 1-10 (30 problems)', count: 30, max: 10, difficulty: 'easy', description: 'Common practice' },
    { id: 6, name: 'Multiplication Tables 1-10 (50 problems)', count: 50, max: 10, difficulty: 'easy', description: 'Comprehensive' },
    { id: 7, name: 'Multiplication Tables 1-12 (25 problems)', count: 25, max: 12, difficulty: 'medium', description: 'Complete tables' },
    { id: 8, name: 'Multiplication Tables 1-12 (40 problems)', count: 40, max: 12, difficulty: 'medium', description: 'Full practice' },
    { id: 9, name: 'Multiplication Tables 1-12 (60 problems)', count: 60, max: 12, difficulty: 'medium', description: 'Extended practice' },
    { id: 10, name: 'Multiplication Tables 1-15 (30 problems)', count: 30, max: 15, difficulty: 'hard', description: 'Advanced tables' },
    { id: 11, name: 'Multiplication Tables 1-20 (40 problems)', count: 40, max: 20, difficulty: 'hard', description: 'Expert level' },
    { id: 12, name: 'Multiplication Mixed (50 problems)', count: 50, max: 20, difficulty: 'hard', description: 'Random challenge' }
  ],

  division: [
    { id: 1, name: 'Division by 1-5 (20 problems)', count: 20, max: 50, difficulty: 'beginner', description: 'Simple division' },
    { id: 2, name: 'Division up to 50 (25 problems)', count: 25, max: 50, difficulty: 'beginner', description: 'Basic practice' },
    { id: 3, name: 'Division up to 50 (40 problems)', count: 40, max: 50, difficulty: 'beginner', description: 'Extended basic' },
    { id: 4, name: 'Division up to 100 (20 problems)', count: 20, max: 100, difficulty: 'easy', description: 'Two-digit dividends' },
    { id: 5, name: 'Division up to 100 (30 problems)', count: 30, max: 100, difficulty: 'easy', description: 'Standard practice' },
    { id: 6, name: 'Division up to 100 (50 problems)', count: 50, max: 100, difficulty: 'easy', description: 'Comprehensive' },
    { id: 7, name: 'Division up to 144 (25 problems)', count: 25, max: 144, difficulty: 'medium', description: 'Tables up to 12' },
    { id: 8, name: 'Division up to 200 (30 problems)', count: 30, max: 200, difficulty: 'medium', description: 'Larger dividends' },
    { id: 9, name: 'Division up to 200 (50 problems)', count: 50, max: 200, difficulty: 'medium', description: 'Extended practice' },
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
    { id: 1, name: 'Mixed Ops 1-20 (20 problems)', count: 20, max: 20, difficulty: 'beginner', description: 'All four operations' },
    { id: 2, name: 'Mixed Ops 1-20 (30 problems)', count: 30, max: 20, difficulty: 'beginner', description: 'Basic mixed' },
    { id: 3, name: 'Mixed Ops 1-20 (50 problems)', count: 50, max: 20, difficulty: 'beginner', description: 'Extended basic' },
    { id: 4, name: 'Mixed Ops 1-50 (20 problems)', count: 20, max: 50, difficulty: 'easy', description: 'Two-digit mixed' },
    { id: 5, name: 'Mixed Ops 1-50 (30 problems)', count: 30, max: 50, difficulty: 'easy', description: 'Standard mixed' },
    { id: 6, name: 'Mixed Ops 1-50 (50 problems)', count: 50, max: 50, difficulty: 'easy', description: 'Comprehensive' },
    { id: 7, name: 'Mixed Ops 1-100 (25 problems)', count: 25, max: 100, difficulty: 'medium', description: 'All operations' },
    { id: 8, name: 'Mixed Ops 1-100 (40 problems)', count: 40, max: 100, difficulty: 'medium', description: 'Standard practice' },
    { id: 9, name: 'Mixed Ops 1-100 (60 problems)', count: 60, max: 100, difficulty: 'medium', description: 'Extended practice' },
    { id: 10, name: 'Mixed Ops 1-200 (30 problems)', count: 30, max: 200, difficulty: 'hard', description: 'Three-digit mixed' },
    { id: 11, name: 'Mixed Ops 1-500 (40 problems)', count: 40, max: 500, difficulty: 'hard', description: 'Large numbers' },
    { id: 12, name: 'Mixed Ops Challenge (50 problems)', count: 50, max: 1000, difficulty: 'hard', description: 'Expert challenge' }
  ],

  english4Line: [
    { id: 1, name: 'Blank 4-Line Paper', text: '', lines: 12, description: 'Standard blank 4-line paper for practice' },
    { id: 2, name: 'Alphabet Tracing (A-M)', text: 'A B C D E F G H I J K L M', lines: 12, description: 'Uppercase tracing (A-M)' },
    { id: 3, name: 'Alphabet Tracing (N-Z)', text: 'N O P Q R S T U V W X Y Z', lines: 12, description: 'Uppercase tracing (N-Z)' },
    { id: 4, name: 'Lowercase Tracing (a-m)', text: 'a b c d e f g h i j k l m', lines: 12, description: 'Lowercase tracing (a-m)' },
    { id: 5, name: 'Lowercase Tracing (n-z)', text: 'n o p q r s t u v w x y z', lines: 12, description: 'Lowercase tracing (n-z)' }
  ],

  hindi2Line: [
    { id: 1, name: 'Blank 2-Line Paper', text: '', lines: 10, description: 'Standard blank 2-line paper' },
    { id: 2, name: 'Generic Practice', text: 'A a B b C c D d E e F f', lines: 10, description: '2-line spacing practice' }
  ],

  mathGrid: [
    { id: 1, name: 'Medium Grid (10mm)', gridSize: 10, description: 'Standard math squares' },
    { id: 2, name: 'Small Grid (5mm)', gridSize: 5, description: 'Small math squares' },
    { id: 3, name: 'Large Grid (15mm)', gridSize: 15, description: 'Large squares for beginners' }
  ],

  cursiveWriting: [
    { id: 1, name: 'Blank Cursive 4-Line', text: '', lines: 12, description: 'Blank paper for cursive' },
    { id: 2, name: 'Cursive Alphabets', text: 'Aa Bb Cc Dd Ee Ff Gg', lines: 12, description: 'Basic cursive letters' },
    { id: 3, name: 'Cursive Words', text: 'apple banana cat dog', lines: 12, description: 'Simple cursive words' }
  ],
  storyPaper: [
    { id: 1, name: 'Standard Story Paper', lines: 8, is4Line: false, description: 'Half picture box, half standard writing lines' },
    { id: 2, name: 'Primary Story Paper (4-Line)', lines: 5, is4Line: true, description: 'Half picture box, half 4-line writing lines for early learners' }
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