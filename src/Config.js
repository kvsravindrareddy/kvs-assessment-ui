const CONFIG = {
    development: {
        GATEWAY_URL: 'http://localhost:9000',
        EVALUATION_BASE_URL: 'http://localhost:9004',
        ADMIN_BASE_URL: 'http://localhost:9003',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9005',
        ASSESSMENT_BASE_URL: 'http://localhost:9002',
        ADMIN_SUPPORT_BASE_URL: 'http://localhost:9008'
    },
    staging: {
        GATEWAY_URL: 'http://localhost:9000',
        EVALUATION_BASE_URL: 'http://localhost:9004',
        ADMIN_BASE_URL: 'http://localhost:9003',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9005',
        ASSESSMENT_BASE_URL: 'http://localhost:9002',
        ADMIN_SUPPORT_BASE_URL: 'http://localhost:9008'
    },
    production: {
        GATEWAY_URL: 'http://localhost:9000',
        EVALUATION_BASE_URL: 'http://localhost:9004',
        ADMIN_BASE_URL: 'http://localhost:9003',
        AI_ASSESSMENT_BASE_URL: 'http://localhost:9005',
        ASSESSMENT_BASE_URL: 'http://localhost:9002',
        ADMIN_SUPPORT_BASE_URL: 'http://localhost:9008'
    }
};

export default CONFIG;