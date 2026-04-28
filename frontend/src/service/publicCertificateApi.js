import { apiRequest } from './apiClient';

/**
 * Search students by code or name
 * @param {string} q - Search query
 * @param {number} page - Page number (default 1)
 * @param {number} limit - Items per page (default 20)
 */
export async function searchStudents(q = '', page = 1, limit = 20) {
    return apiRequest('/api/public/students/search', {
        method: 'GET',
        query: { q, page, limit }
    });
}

/**
 * Get student details and their certificates
 * @param {string} studentCode - Student code
 */
export async function getStudentWithCertificates(studentCode) {
    return apiRequest(`/api/public/students/${studentCode}`, {
        method: 'GET'
    });
}

/**
 * Verify a certificate on blockchain
 * @param {string} certificateId - Certificate ID to verify
 */
export async function verifyCertificate(certificateId) {
    return apiRequest(`/api/public/certificates/${certificateId}/verify`, {
        method: 'GET'
    });
}
