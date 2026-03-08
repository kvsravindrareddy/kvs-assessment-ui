import axios from 'axios';

export const setupAxiosInterceptors = () => {
    // Request Interceptor: Attach the token to every outgoing request
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response Interceptor: Catch 401s and Force Logout!
    axios.interceptors.response.use(
        (response) => {
            // Any status code within the range of 2xx causes this function to trigger
            return response;
        },
        (error) => {
            // Any status codes outside the range of 2xx cause this function to trigger
            if (error.response && error.response.status === 401) {
                console.warn("🔒 Session invalidated by Admin or token expired. Redirecting to login...");
                
                // 1. Destroy the dead token and user data
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userEmail');
                
                // 2. Instantly redirect them to the login page!
                // Using window.location.href ensures a full page reload to clear React state perfectly
                window.location.href = '/'; 
                
                // Note: If you have a dedicated '/login' route you can use window.location.href = '/login';
                // But looking at your App.js, your Login is a modal component, so kicking them to '/' 
                // ensures they see the public home page and have to click Login again.
            }
            
            return Promise.reject(error);
        }
    );
};