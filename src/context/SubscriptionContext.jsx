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
    storiesTotal: 2, // Added missing total limit for guest
    gamesPerDay: 1,
    gamesTotal: 1, // Added missing total limit for guest
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
    assessmentsTotal: -1, 
    storiesPerDay: 5,
    gamesPerDay: -1, 
    aiQuestionsPerMonth: -1, 
    canSaveProgress: true,
    canDownloadCertificates: false,
    canAccessAI: true, 
    showWatermark: false,
    canCreateClasses: false,
    maxStudents: 0
  },
  [SUBSCRIPTION_TIERS.STUDENT_INDIVIDUAL]: {
    assessmentsPerDay: -1, 
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
    aiQuestionsPerMonth: -1, 
    canSaveProgress: true,
    canDownloadCertificates: false,
    canAccessAI: true, 
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

// Helper function to safely get the plural form of the action key
const getPluralKey = (action) => {
    if (action === 'story') return 'stories';
    return action + 's';
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionTier, setSubscriptionTier] = useState(() => {
    const saved = localStorage.getItem('subscriptionTier');
    if (saved) {
      console.log('SubscriptionContext: Loaded tier from localStorage:', saved);
      return saved;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.subscriptionTier) {
          console.log('SubscriptionContext: Using tier from user object:', user.subscriptionTier);
          localStorage.setItem('subscriptionTier', user.subscriptionTier);
          return user.subscriptionTier;
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }

    console.log('SubscriptionContext: Defaulting to GUEST');
    return SUBSCRIPTION_TIERS.GUEST;
  });

  const [usageStats, setUsageStats] = useState(() => {
    const saved = localStorage.getItem('usageStats');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      if (parsed.date !== today) {
        return { date: today, assessments: 0, stories: 0, games: 0, aiQuestions: 0 };
      }
      return parsed;
    }
    return { date: new Date().toDateString(), assessments: 0, stories: 0, games: 0, aiQuestions: 0 };
  });

  const [guestUsage, setGuestUsage] = useState(() => {
    const saved = localStorage.getItem('guestUsage');
    return saved ? JSON.parse(saved) : { totalAssessments: 0, totalStories: 0, totalGames: 0 };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const newTier = localStorage.getItem('subscriptionTier');
      if (newTier && newTier !== subscriptionTier) {
        console.log('SubscriptionContext: Tier changed in localStorage, syncing:', newTier);
        setSubscriptionTier(newTier);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const intervalId = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [subscriptionTier]);

  useEffect(() => {
    localStorage.setItem('subscriptionTier', subscriptionTier);
  }, [subscriptionTier]);

  useEffect(() => {
    localStorage.setItem('usageStats', JSON.stringify(usageStats));
  }, [usageStats]);

  useEffect(() => {
    localStorage.setItem('guestUsage', JSON.stringify(guestUsage));
  }, [guestUsage]);

  const getLimits = () => {
    return TIER_LIMITS[subscriptionTier] || TIER_LIMITS[SUBSCRIPTION_TIERS.GUEST];
  };

  const canPerformAction = (action) => {
    const limits = getLimits();
    const today = new Date().toDateString();
    const pluralAction = getPluralKey(action);

    if (usageStats.date !== today) {
      setUsageStats({ date: today, assessments: 0, stories: 0, games: 0, aiQuestions: 0 });
    }

    switch (action) {
      case 'assessment':
      case 'story':
      case 'game':
        if (subscriptionTier === SUBSCRIPTION_TIERS.GUEST) {
            // Capitalize first letter for guest usage keys (e.g. totalStories)
            const guestKey = `total${pluralAction.charAt(0).toUpperCase() + pluralAction.slice(1)}`;
            return guestUsage[guestKey] < limits[`${pluralAction}Total`];
        }
        return limits[`${pluralAction}PerDay`] === -1 || usageStats[pluralAction] < limits[`${pluralAction}PerDay`];

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

  const trackUsage = (action) => {
    const today = new Date().toDateString();
    const pluralAction = getPluralKey(action);

    if (subscriptionTier === SUBSCRIPTION_TIERS.GUEST) {
      const guestKey = `total${pluralAction.charAt(0).toUpperCase() + pluralAction.slice(1)}`;
      setGuestUsage(prev => ({
        ...prev,
        [guestKey]: (prev[guestKey] || 0) + 1
      }));
    }

    setUsageStats(prev => {
      if (prev.date !== today) {
        return { date: today, [pluralAction]: 1 };
      }
      return { ...prev, [pluralAction]: (prev[pluralAction] || 0) + 1 };
    });
  };

  const getRemainingUsage = (action) => {
    const limits = getLimits();
    const today = new Date().toDateString();
    const pluralAction = getPluralKey(action);

    if (usageStats.date !== today) {
      return limits[`${pluralAction}PerDay`];
    }

    if (subscriptionTier === SUBSCRIPTION_TIERS.GUEST) {
        const guestKey = `total${pluralAction.charAt(0).toUpperCase() + pluralAction.slice(1)}`;
        return Math.max(0, limits[`${pluralAction}Total`] - (guestUsage[guestKey] || 0));
    }

    const limit = limits[`${pluralAction}PerDay`];
    if (limit === -1) return '∞';
    return Math.max(0, limit - (usageStats[pluralAction] || 0));
  };

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

  const getUpgradeMessage = (feature) => {
    const messages = {
      assessment: `You've reached your assessment limit. Upgrade to get unlimited access!`,
      story: `You've used all your free stories. Upgrade for unlimited reading!`,
      game: `Please sign up or log in for a free account to play unlimited games!`, 
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