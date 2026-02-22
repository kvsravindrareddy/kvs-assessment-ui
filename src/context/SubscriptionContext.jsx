import React, { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  GUEST: 'GUEST',
  STUDENT_FREE: 'STUDENT_FREE',
  STUDENT_INDIVIDUAL: 'STUDENT_INDIVIDUAL',
  FAMILY_PLAN: 'FAMILY_PLAN',
  TEACHER_FREE: 'TEACHER_FREE',
  TEACHER_BASIC: 'TEACHER_BASIC',
  SCHOOL_STANDARD: 'SCHOOL_STANDARD',
  SCHOOL_PREMIUM: 'SCHOOL_PREMIUM',
  DISTRICT_ENTERPRISE: 'DISTRICT_ENTERPRISE'
};

// Feature limits for each tier
const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.GUEST]: {
    assessmentsPerDay: 3,
    assessmentsTotal: 3,
    storiesPerDay: 2,
    gamesPerDay: 1,
    aiQuestionsPerMonth: 0,
    canSaveProgress: false,
    canDownloadCertificates: false,
    canAccessAI: false,
    showWatermark: true,
    canCreateClasses: false,
    maxStudents: 0
  },
  [SUBSCRIPTION_TIERS.STUDENT_FREE]: {
    assessmentsPerDay: 5,
    assessmentsTotal: -1, // unlimited total
    storiesPerDay: 5,
    gamesPerDay: 3,
    aiQuestionsPerMonth: 0,
    canSaveProgress: true,
    canDownloadCertificates: false,
    canAccessAI: false,
    showWatermark: false,
    canCreateClasses: false,
    maxStudents: 0
  },
  [SUBSCRIPTION_TIERS.STUDENT_INDIVIDUAL]: {
    assessmentsPerDay: -1, // unlimited
    assessmentsTotal: -1,
    storiesPerDay: -1,
    gamesPerDay: -1,
    aiQuestionsPerMonth: 100,
    canSaveProgress: true,
    canDownloadCertificates: true,
    canAccessAI: true,
    showWatermark: false,
    canCreateClasses: false,
    maxStudents: 1,
    price: 9.99
  },
  [SUBSCRIPTION_TIERS.FAMILY_PLAN]: {
    assessmentsPerDay: -1,
    assessmentsTotal: -1,
    storiesPerDay: -1,
    gamesPerDay: -1,
    aiQuestionsPerMonth: 300,
    canSaveProgress: true,
    canDownloadCertificates: true,
    canAccessAI: true,
    showWatermark: false,
    canCreateClasses: false,
    maxStudents: 4,
    price: 19.99
  },
  [SUBSCRIPTION_TIERS.TEACHER_FREE]: {
    assessmentsPerDay: -1,
    assessmentsTotal: -1,
    storiesPerDay: -1,
    gamesPerDay: -1,
    aiQuestionsPerMonth: 0,
    canSaveProgress: true,
    canDownloadCertificates: false,
    canAccessAI: false,
    showWatermark: false,
    canCreateClasses: true,
    maxClasses: 1,
    maxStudents: 10,
    canExportReports: false
  },
  [SUBSCRIPTION_TIERS.TEACHER_BASIC]: {
    assessmentsPerDay: -1,
    assessmentsTotal: -1,
    storiesPerDay: -1,
    gamesPerDay: -1,
    aiQuestionsPerMonth: 500,
    canSaveProgress: true,
    canDownloadCertificates: true,
    canAccessAI: true,
    showWatermark: false,
    canCreateClasses: true,
    maxClasses: -1,
    maxStudents: 50,
    canExportReports: true,
    canBulkUpload: false,
    price: 29.99
  },
  [SUBSCRIPTION_TIERS.SCHOOL_STANDARD]: {
    assessmentsPerDay: -1,
    assessmentsTotal: -1,
    storiesPerDay: -1,
    gamesPerDay: -1,
    aiQuestionsPerMonth: -1,
    canSaveProgress: true,
    canDownloadCertificates: true,
    canAccessAI: true,
    showWatermark: false,
    canCreateClasses: true,
    maxClasses: -1,
    maxStudents: 500,
    maxTeachers: -1,
    canExportReports: true,
    canBulkUpload: true,
    canCustomBrand: true,
    hasAPIAccess: 'limited',
    maxBranches: 1,
    price: 499
  },
  [SUBSCRIPTION_TIERS.SCHOOL_PREMIUM]: {
    assessmentsPerDay: -1,
    assessmentsTotal: -1,
    storiesPerDay: -1,
    gamesPerDay: -1,
    aiQuestionsPerMonth: -1,
    canSaveProgress: true,
    canDownloadCertificates: true,
    canAccessAI: true,
    showWatermark: false,
    canCreateClasses: true,
    maxClasses: -1,
    maxStudents: 1500,
    maxTeachers: -1,
    canExportReports: true,
    canBulkUpload: true,
    canCustomBrand: true,
    hasAPIAccess: 'full',
    maxBranches: -1,
    price: 999
  },
  [SUBSCRIPTION_TIERS.DISTRICT_ENTERPRISE]: {
    assessmentsPerDay: -1,
    assessmentsTotal: -1,
    storiesPerDay: -1,
    gamesPerDay: -1,
    aiQuestionsPerMonth: -1,
    canSaveProgress: true,
    canDownloadCertificates: true,
    canAccessAI: true,
    showWatermark: false,
    canCreateClasses: true,
    maxClasses: -1,
    maxStudents: -1,
    maxTeachers: -1,
    maxSchools: -1,
    canExportReports: true,
    canBulkUpload: true,
    canCustomBrand: true,
    hasAPIAccess: 'full',
    maxBranches: -1,
    price: 'custom'
  }
};

export const SubscriptionProvider = ({ children }) => {
  // Get user's subscription tier from localStorage or default to GUEST
  const [subscriptionTier, setSubscriptionTier] = useState(() => {
    const saved = localStorage.getItem('subscriptionTier');
    return saved || SUBSCRIPTION_TIERS.GUEST;
  });

  // Track daily usage
  const [usageStats, setUsageStats] = useState(() => {
    const saved = localStorage.getItem('usageStats');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset if it's a new day
      const today = new Date().toDateString();
      if (parsed.date !== today) {
        return { date: today, assessments: 0, stories: 0, games: 0, aiQuestions: 0 };
      }
      return parsed;
    }
    return { date: new Date().toDateString(), assessments: 0, stories: 0, games: 0, aiQuestions: 0 };
  });

  // Guest user tracking (total attempts)
  const [guestUsage, setGuestUsage] = useState(() => {
    const saved = localStorage.getItem('guestUsage');
    return saved ? JSON.parse(saved) : { totalAssessments: 0, totalStories: 0, totalGames: 0 };
  });

  // Save to localStorage whenever subscription tier changes
  useEffect(() => {
    localStorage.setItem('subscriptionTier', subscriptionTier);
  }, [subscriptionTier]);

  // Save usage stats to localStorage
  useEffect(() => {
    localStorage.setItem('usageStats', JSON.stringify(usageStats));
  }, [usageStats]);

  // Save guest usage to localStorage
  useEffect(() => {
    localStorage.setItem('guestUsage', JSON.stringify(guestUsage));
  }, [guestUsage]);

  // Get current tier limits
  const getLimits = () => {
    return TIER_LIMITS[subscriptionTier] || TIER_LIMITS[SUBSCRIPTION_TIERS.GUEST];
  };

  // Check if user can perform an action
  const canPerformAction = (action) => {
    const limits = getLimits();
    const today = new Date().toDateString();

    // Reset usage if it's a new day
    if (usageStats.date !== today) {
      setUsageStats({ date: today, assessments: 0, stories: 0, games: 0, aiQuestions: 0 });
    }

    switch (action) {
      case 'assessment':
        // For guests, check total limit
        if (subscriptionTier === SUBSCRIPTION_TIERS.GUEST) {
          return guestUsage.totalAssessments < limits.assessmentsTotal;
        }
        // For others, check daily limit
        return limits.assessmentsPerDay === -1 || usageStats.assessments < limits.assessmentsPerDay;

      case 'story':
        if (subscriptionTier === SUBSCRIPTION_TIERS.GUEST) {
          return guestUsage.totalStories < limits.storiesPerDay;
        }
        return limits.storiesPerDay === -1 || usageStats.stories < limits.storiesPerDay;

      case 'game':
        if (subscriptionTier === SUBSCRIPTION_TIERS.GUEST) {
          return guestUsage.totalGames < limits.gamesPerDay;
        }
        return limits.gamesPerDay === -1 || usageStats.games < limits.gamesPerDay;

      case 'ai':
        return limits.canAccessAI && (limits.aiQuestionsPerMonth === -1 || usageStats.aiQuestions < limits.aiQuestionsPerMonth);

      case 'certificate':
        return limits.canDownloadCertificates;

      case 'saveProgress':
        return limits.canSaveProgress;

      case 'createClass':
        return limits.canCreateClasses;

      case 'exportReports':
        return limits.canExportReports;

      case 'bulkUpload':
        return limits.canBulkUpload;

      default:
        return false;
    }
  };

  // Track usage
  const trackUsage = (action) => {
    const today = new Date().toDateString();

    if (subscriptionTier === SUBSCRIPTION_TIERS.GUEST) {
      // Track guest total usage
      setGuestUsage(prev => ({
        ...prev,
        [`total${action.charAt(0).toUpperCase() + action.slice(1)}s`]: prev[`total${action.charAt(0).toUpperCase() + action.slice(1)}s`] + 1
      }));
    }

    // Track daily usage
    setUsageStats(prev => {
      if (prev.date !== today) {
        return { date: today, [action + 's']: 1 };
      }
      return { ...prev, [action + 's']: prev[action + 's'] + 1 };
    });
  };

  // Get remaining usage
  const getRemainingUsage = (action) => {
    const limits = getLimits();
    const today = new Date().toDateString();

    if (usageStats.date !== today) {
      return limits[`${action}sPerDay`];
    }

    if (subscriptionTier === SUBSCRIPTION_TIERS.GUEST) {
      if (action === 'assessment') return Math.max(0, limits.assessmentsTotal - guestUsage.totalAssessments);
      if (action === 'story') return Math.max(0, limits.storiesPerDay - guestUsage.totalStories);
      if (action === 'game') return Math.max(0, limits.gamesPerDay - guestUsage.totalGames);
    }

    const limit = limits[`${action}sPerDay`];
    if (limit === -1) return '∞';
    return Math.max(0, limit - usageStats[action + 's']);
  };

  // Check if feature is locked
  const isFeatureLocked = (feature) => {
    const limits = getLimits();

    switch (feature) {
      case 'ai':
        return !limits.canAccessAI;
      case 'certificate':
        return !limits.canDownloadCertificates;
      case 'analytics':
        return subscriptionTier === SUBSCRIPTION_TIERS.GUEST || subscriptionTier === SUBSCRIPTION_TIERS.STUDENT_FREE;
      case 'exportReports':
        return !limits.canExportReports;
      case 'bulkUpload':
        return !limits.canBulkUpload;
      case 'customBranding':
        return !limits.canCustomBrand;
      case 'api':
        return !limits.hasAPIAccess;
      default:
        return false;
    }
  };

  // Get upgrade prompt message
  const getUpgradeMessage = (feature) => {
    const messages = {
      assessment: `You've reached your assessment limit. Upgrade to get unlimited access!`,
      story: `You've used all your free stories. Upgrade for unlimited reading!`,
      game: `Game limit reached. Upgrade for unlimited playtime!`,
      ai: `AI Tutor is only available for paid subscribers. Upgrade now!`,
      certificate: `Download certificates with a paid subscription!`,
      analytics: `Detailed analytics available for paid users only.`,
      exportReports: `Export reports with Teacher Basic or School plans.`,
      bulkUpload: `Bulk upload is available for School plans.`,
      customBranding: `Custom branding available for School plans.`,
      api: `API access available for School and District plans.`
    };
    return messages[feature] || 'Upgrade to unlock this feature!';
  };

  // Get recommended tier for upgrade
  const getRecommendedTier = (userRole) => {
    if (userRole === 'STUDENT') return SUBSCRIPTION_TIERS.STUDENT_INDIVIDUAL;
    if (userRole === 'PARENT') return SUBSCRIPTION_TIERS.FAMILY_PLAN;
    if (userRole === 'TEACHER') return SUBSCRIPTION_TIERS.TEACHER_BASIC;
    if (userRole === 'SCHOOL_ADMIN') return SUBSCRIPTION_TIERS.SCHOOL_STANDARD;
    if (userRole === 'DISTRICT_ADMIN') return SUBSCRIPTION_TIERS.DISTRICT_ENTERPRISE;
    return SUBSCRIPTION_TIERS.STUDENT_INDIVIDUAL;
  };

  const value = {
    subscriptionTier,
    setSubscriptionTier,
    usageStats,
    guestUsage,
    getLimits,
    canPerformAction,
    trackUsage,
    getRemainingUsage,
    isFeatureLocked,
    getUpgradeMessage,
    getRecommendedTier,
    SUBSCRIPTION_TIERS,
    TIER_LIMITS
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
