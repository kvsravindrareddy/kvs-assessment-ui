const CONFIG = {
    development: {
        EVALUATION_BASE_URL: 'http://localhost:9004',
        ADMIN_BASE_URL: 'http://localhost:9003',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9005'
    },
    staging: {
        EVALUATION_BASE_URL: 'http://localhost:9004',
        ADMIN_BASE_URL: 'http://localhost:9003',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9005'
    },
    production: {
        EVALUATION_BASE_URL: 'http://localhost:9004',
        ADMIN_BASE_URL: 'http://localhost:9003',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9005'
    }
};

export default CONFIG;