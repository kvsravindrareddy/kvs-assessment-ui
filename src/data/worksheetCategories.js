/**
 * Worksheet Category Definitions
 * Each category has unique configuration needs and rendering logic
 */

export const WORKSHEET_CATEGORIES = {
  // Basic Operations
  ADDITION: {
    id: 'ADDITION',
    name: 'Addition',
    icon: '➕',
    color: '#56ab2f',
    description: 'Addition problems with various difficulty levels',
    configFields: ['problemCount', 'maxNumber', 'minNumber', 'requireRegrouping', 'layout', 'numberOfOperands'],
    defaultConfig: {
      problemCount: 20,
      maxNumber: 100,
      minNumber: 1,
      requireRegrouping: false,
      layout: 'VERTICAL',
      numberOfOperands: 2
    },
    subcategories: ['SIMPLE', 'WITH_REGROUPING', 'TWO_STEP', 'THREE_STEP']
  },

  SUBTRACTION: {
    id: 'SUBTRACTION',
    name: 'Subtraction',
    icon: '➖',
    color: '#f093fb',
    description: 'Subtraction problems with borrowing options',
    configFields: ['problemCount', 'maxNumber', 'minNumber', 'requireBorrowing', 'layout'],
    defaultConfig: {
      problemCount: 20,
      maxNumber: 100,
      minNumber: 1,
      requireBorrowing: false,
      layout: 'VERTICAL'
    },
    subcategories: ['SIMPLE', 'WITH_BORROWING', 'TWO_STEP']
  },

  MULTIPLICATION: {
    id: 'MULTIPLICATION',
    name: 'Multiplication',
    icon: '✖️',
    color: '#fa709a',
    description: 'Multiplication problems and tables',
    configFields: ['problemCount', 'maxMultiplier', 'layout', 'includeCarrying'],
    defaultConfig: {
      problemCount: 20,
      maxMultiplier: 12,
      layout: 'VERTICAL',
      includeCarrying: false
    },
    subcategories: ['SIMPLE', 'TWO_DIGIT', 'THREE_DIGIT']
  },

  MULTIPLICATION_TABLES: {
    id: 'MULTIPLICATION_TABLES',
    name: 'Multiplication Tables',
    icon: '📊',
    color: '#667eea',
    description: 'Complete multiplication tables',
    configFields: ['fromTable', 'toTable', 'layout'],
    defaultConfig: {
      fromTable: 1,
      toTable: 10,
      layout: 'TWO_COLUMN'
    },
    subcategories: []
  },

  DIVISION: {
    id: 'DIVISION',
    name: 'Division',
    icon: '➗',
    color: '#4facfe',
    description: 'Division problems with remainder options',
    configFields: ['problemCount', 'maxDividend', 'maxDivisor', 'includeRemainders', 'layout'],
    defaultConfig: {
      problemCount: 20,
      maxDividend: 100,
      maxDivisor: 12,
      includeRemainders: false,
      layout: 'LONG_DIVISION'
    },
    subcategories: ['SIMPLE', 'WITH_REMAINDERS', 'LONG_DIVISION']
  },

  MIXED_OPERATIONS: {
    id: 'MIXED_OPERATIONS',
    name: 'Mixed Operations',
    icon: '🔢',
    color: '#fa8bff',
    description: 'Mix of all four operations',
    configFields: ['problemCount', 'maxNumber', 'operations', 'layout'],
    defaultConfig: {
      problemCount: 20,
      maxNumber: 100,
      operations: ['+', '-', '×', '÷'],
      layout: 'HORIZONTAL'
    },
    subcategories: []
  },

  // Fractions
  FRACTIONS: {
    id: 'FRACTIONS',
    name: 'Fractions',
    icon: '🍰',
    color: '#f6d365',
    description: 'Fraction operations and simplification',
    configFields: ['operationType', 'problemCount', 'maxDenominator', 'sameDenominator', 'requireSimplification', 'includeMixedNumbers'],
    defaultConfig: {
      operationType: 'ADDITION',
      problemCount: 15,
      maxDenominator: 12,
      sameDenominator: true,
      requireSimplification: false,
      includeMixedNumbers: false
    },
    subcategories: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'SIMPLIFICATION', 'MIXED_NUMBERS']
  },

  // Decimals
  DECIMALS: {
    id: 'DECIMALS',
    name: 'Decimals',
    icon: '🔢',
    color: '#84fab0',
    description: 'Decimal operations',
    configFields: ['operationType', 'problemCount', 'maxValue', 'decimalPlaces', 'layout'],
    defaultConfig: {
      operationType: 'ADDITION',
      problemCount: 20,
      maxValue: 100,
      decimalPlaces: 2,
      layout: 'VERTICAL'
    },
    subcategories: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION']
  },

  // Number Skills
  NUMBER_WRITING: {
    id: 'NUMBER_WRITING',
    name: 'Number Writing',
    icon: '✏️',
    color: '#43e97b',
    description: 'Fill in missing numbers',
    configFields: ['fromNumber', 'toNumber', 'blankPercentage', 'layout'],
    defaultConfig: {
      fromNumber: 1,
      toNumber: 100,
      blankPercentage: 50,
      layout: 'GRID_10x10'
    },
    subcategories: ['SEQUENTIAL', 'SKIP_COUNTING', 'ODD_EVEN']
  },

  SKIP_COUNTING: {
    id: 'SKIP_COUNTING',
    name: 'Skip Counting',
    icon: '🔢',
    color: '#ffeaa7',
    description: 'Count by 2s, 5s, 10s, etc.',
    configFields: ['skipBy', 'fromNumber', 'toNumber', 'problemCount'],
    defaultConfig: {
      skipBy: 2,
      fromNumber: 0,
      toNumber: 100,
      problemCount: 20
    },
    subcategories: ['BY_2', 'BY_5', 'BY_10', 'BY_3', 'BY_4']
  },

  PLACE_VALUE: {
    id: 'PLACE_VALUE',
    name: 'Place Value',
    icon: '🔢',
    color: '#74b9ff',
    description: 'Identify place values',
    configFields: ['problemCount', 'maxDigits', 'questionType'],
    defaultConfig: {
      problemCount: 20,
      maxDigits: 4,
      questionType: 'IDENTIFY'
    },
    subcategories: ['ONES_TENS', 'HUNDREDS', 'THOUSANDS']
  },

  COMPARING_NUMBERS: {
    id: 'COMPARING_NUMBERS',
    name: 'Comparing Numbers',
    icon: '⚖️',
    color: '#a29bfe',
    description: 'Use >, <, = symbols',
    configFields: ['problemCount', 'maxNumber', 'numberType'],
    defaultConfig: {
      problemCount: 20,
      maxNumber: 100,
      numberType: 'WHOLE'
    },
    subcategories: []
  },

  ROUNDING: {
    id: 'ROUNDING',
    name: 'Rounding',
    icon: '🔄',
    color: '#fd79a8',
    description: 'Round to nearest 10, 100, 1000',
    configFields: ['problemCount', 'maxNumber', 'roundTo'],
    defaultConfig: {
      problemCount: 20,
      maxNumber: 1000,
      roundTo: 'TEN'
    },
    subcategories: ['TO_TEN', 'TO_HUNDRED', 'TO_THOUSAND']
  },

  // Word Problems
  WORD_PROBLEMS: {
    id: 'WORD_PROBLEMS',
    name: 'Word Problems',
    icon: '📖',
    color: '#55efc4',
    description: 'Real-world math scenarios',
    configFields: ['problemType', 'contextType', 'problemCount', 'maxNumber', 'includeIllustrations'],
    defaultConfig: {
      problemType: 'MIXED',
      contextType: 'GENERAL',
      problemCount: 10,
      maxNumber: 100,
      includeIllustrations: false
    },
    subcategories: ['MONEY', 'TIME', 'DISTANCE', 'SHOPPING', 'MEASUREMENT']
  },

  // Geometry
  GEOMETRY: {
    id: 'GEOMETRY',
    name: 'Geometry',
    icon: '📐',
    color: '#00b894',
    description: 'Area, perimeter, volume',
    configFields: ['shapeType', 'measurementType', 'problemCount', 'maxDimension', 'includeUnits', 'units'],
    defaultConfig: {
      shapeType: 'RECTANGLE',
      measurementType: 'AREA',
      problemCount: 15,
      maxDimension: 20,
      includeUnits: true,
      units: 'cm'
    },
    subcategories: ['AREA_RECTANGLE', 'AREA_TRIANGLE', 'AREA_CIRCLE', 'PERIMETER', 'VOLUME']
  },

  // Algebra
  ALGEBRA_EQUATIONS: {
    id: 'ALGEBRA_EQUATIONS',
    name: 'Equations',
    icon: '🔢',
    color: '#e17055',
    description: 'Solve for x',
    configFields: ['problemCount', 'equationType', 'maxValue', 'includeNegatives'],
    defaultConfig: {
      problemCount: 15,
      equationType: 'ONE_STEP',
      maxValue: 50,
      includeNegatives: false
    },
    subcategories: ['ONE_STEP', 'TWO_STEP', 'MULTI_STEP', 'VARIABLES_BOTH_SIDES']
  },

  // Time & Money
  TIME: {
    id: 'TIME',
    name: 'Time',
    icon: '⏰',
    color: '#fdcb6e',
    description: 'Clock reading and elapsed time',
    configFields: ['problemType', 'problemCount', 'timeFormat'],
    defaultConfig: {
      problemType: 'CLOCK_READING',
      problemCount: 20,
      timeFormat: '12_HOUR'
    },
    subcategories: ['CLOCK_READING', 'ELAPSED_TIME', 'TIME_CONVERSION']
  },

  MONEY: {
    id: 'MONEY',
    name: 'Money',
    icon: '💰',
    color: '#00cec9',
    description: 'Counting money and making change',
    configFields: ['problemType', 'problemCount', 'maxAmount', 'currency'],
    defaultConfig: {
      problemType: 'ADDITION',
      problemCount: 20,
      maxAmount: 100,
      currency: 'USD'
    },
    subcategories: ['COUNTING_COINS', 'ADDITION', 'SUBTRACTION', 'MAKING_CHANGE']
  },

  // Advanced
  PERCENTAGES: {
    id: 'PERCENTAGES',
    name: 'Percentages',
    icon: '%',
    color: '#e84393',
    description: 'Percentage calculations',
    configFields: ['problemType', 'problemCount', 'maxValue'],
    defaultConfig: {
      problemType: 'CALCULATE',
      problemCount: 15,
      maxValue: 100
    },
    subcategories: ['CALCULATE', 'TO_DECIMAL', 'TO_FRACTION', 'WORD_PROBLEMS']
  },

  ORDER_OF_OPERATIONS: {
    id: 'ORDER_OF_OPERATIONS',
    name: 'Order of Operations',
    icon: '🔢',
    color: '#6c5ce7',
    description: 'PEMDAS/BODMAS',
    configFields: ['problemCount', 'maxNumber', 'useParentheses', 'operations'],
    defaultConfig: {
      problemCount: 15,
      maxNumber: 20,
      useParentheses: true,
      operations: ['+', '-', '×', '÷']
    },
    subcategories: ['NO_PARENTHESES', 'WITH_PARENTHESES']
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = (id) => {
  return WORKSHEET_CATEGORIES[id];
};

/**
 * Get all categories as array
 */
export const getAllCategories = () => {
  return Object.values(WORKSHEET_CATEGORIES);
};

/**
 * Get categories by group
 */
export const getCategoriesByGroup = () => {
  return {
    'Basic Operations': [
      WORKSHEET_CATEGORIES.ADDITION,
      WORKSHEET_CATEGORIES.SUBTRACTION,
      WORKSHEET_CATEGORIES.MULTIPLICATION,
      WORKSHEET_CATEGORIES.MULTIPLICATION_TABLES,
      WORKSHEET_CATEGORIES.DIVISION,
      WORKSHEET_CATEGORIES.MIXED_OPERATIONS
    ],
    'Number Skills': [
      WORKSHEET_CATEGORIES.NUMBER_WRITING,
      WORKSHEET_CATEGORIES.SKIP_COUNTING,
      WORKSHEET_CATEGORIES.PLACE_VALUE,
      WORKSHEET_CATEGORIES.COMPARING_NUMBERS,
      WORKSHEET_CATEGORIES.ROUNDING
    ],
    'Fractions & Decimals': [
      WORKSHEET_CATEGORIES.FRACTIONS,
      WORKSHEET_CATEGORIES.DECIMALS,
      WORKSHEET_CATEGORIES.PERCENTAGES
    ],
    'Applied Math': [
      WORKSHEET_CATEGORIES.WORD_PROBLEMS,
      WORKSHEET_CATEGORIES.TIME,
      WORKSHEET_CATEGORIES.MONEY
    ],
    'Geometry & Algebra': [
      WORKSHEET_CATEGORIES.GEOMETRY,
      WORKSHEET_CATEGORIES.ALGEBRA_EQUATIONS,
      WORKSHEET_CATEGORIES.ORDER_OF_OPERATIONS
    ]
  };
};

/**
 * Get config fields for a category
 */
export const getConfigFields = (categoryId) => {
  const category = WORKSHEET_CATEGORIES[categoryId];
  return category ? category.configFields : [];
};

/**
 * Get default config for a category
 */
export const getDefaultConfig = (categoryId) => {
  const category = WORKSHEET_CATEGORIES[categoryId];
  return category ? { ...category.defaultConfig } : {};
};
