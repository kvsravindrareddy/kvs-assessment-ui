const CONFIG = {
    development: {
        GATEWAY_URL: 'http://localhost:9000',
        // All requests now go through gateway
        EVALUATION_BASE_URL: 'http://localhost:9000',
        ADMIN_BASE_URL: 'http://localhost:9000',
        ADMIN_QUESTIONS_URL: 'http://localhost:9000/v1/questions',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9000',
        ASSESSMENT_BASE_URL: 'http://localhost:9000',
        ADMIN_SUPPORT_BASE_URL: 'http://localhost:9000'
    },
    staging: {
        GATEWAY_URL: 'http://localhost:9000',
        EVALUATION_BASE_URL: 'http://localhost:9000',
        ADMIN_BASE_URL: 'http://localhost:9000',
        ADMIN_QUESTIONS_URL: 'http://localhost:9000/v1/questions',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9000',
        ASSESSMENT_BASE_URL: 'http://localhost:9000',
        ADMIN_SUPPORT_BASE_URL: 'http://localhost:9000'
    },
    production: {
        GATEWAY_URL: 'http://localhost:9000',
        EVALUATION_BASE_URL: 'http://localhost:9000',
        ADMIN_BASE_URL: 'http://localhost:9000',
        ADMIN_QUESTIONS_URL: 'http://localhost:9000/v1/questions',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9000',
        ASSESSMENT_BASE_URL: 'http://localhost:9000',
        ADMIN_SUPPORT_BASE_URL: 'http://localhost:9000'
    }
};

// Helper function to get current environment config
export const getConfig = () => {
    const env = process.env.REACT_APP_ENV || 'development';
    return CONFIG[env] || CONFIG.development;
};

export default CONFIG;