import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:8082/v1/content-library/worksheets';

/**
 * Worksheet Template API Service
 * Connects to kvs-admin-assessment backend
 */

// Get all templates with optional filters
export const getAllTemplates = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.grade) params.append('grade', filters.grade);
    if (filters.search) params.append('search', filters.search);
    params.append('page', filters.page || 0);
    params.append('size', filters.size || 20);

    const response = await axios.get(`${API_BASE_URL}?${params}`);
    return response.data;
};

// Get template by ID
export const getTemplateById = async (templateId) => {
    const response = await axios.get(`${API_BASE_URL}/${templateId}`);
    return response.data;
};

// Generate template with GPT
export const generateTemplate = async (request) => {
    const response = await axios.post(`${API_BASE_URL}/generate`, request);
    return response.data;
};

// Bulk generate templates
export const bulkGenerateTemplates = async (request) => {
    const response = await axios.post(`${API_BASE_URL}/generate/bulk`, request);
    return response.data;
};

// Regenerate template with improvements
export const regenerateTemplate = async (templateId, improvementNotes) => {
    const response = await axios.post(`${API_BASE_URL}/${templateId}/regenerate`, {
        improvementNotes
    });
    return response.data;
};

// Update template
export const updateTemplate = async (templateId, template) => {
    const response = await axios.put(`${API_BASE_URL}/${templateId}`, template);
    return response.data;
};

// Delete template
export const deleteTemplate = async (templateId) => {
    const response = await axios.delete(`${API_BASE_URL}/${templateId}`);
    return response.data;
};

// Get category statistics
export const getCategoryStatistics = async () => {
    const response = await axios.get(`${API_BASE_URL}/statistics/categories`);
    return response.data;
};

// Get difficulty distribution
export const getDifficultyDistribution = async () => {
    const response = await axios.get(`${API_BASE_URL}/statistics/difficulty`);
    return response.data;
};

// Get grade distribution
export const getGradeDistribution = async () => {
    const response = await axios.get(`${API_BASE_URL}/statistics/grades`);
    return response.data;
};

// Validate template
export const validateTemplate = async (template) => {
    const response = await axios.post(`${API_BASE_URL}/validate`, template);
    return response.data;
};

// Get generation history
export const getGenerationHistory = async (page = 0, size = 20) => {
    const response = await axios.get(`${API_BASE_URL}/history?page=${page}&size=${size}`);
    return response.data;
};

// Preview template (generate sample problems)
export const previewTemplate = async (templateId, count = 5) => {
    const response = await axios.get(`${API_BASE_URL}/${templateId}/preview?count=${count}`);
    return response.data;
};

export default {
    getAllTemplates,
    getTemplateById,
    generateTemplate,
    bulkGenerateTemplates,
    regenerateTemplate,
    updateTemplate,
    deleteTemplate,
    getCategoryStatistics,
    getDifficultyDistribution,
    getGradeDistribution,
    validateTemplate,
    getGenerationHistory,
    previewTemplate
};
