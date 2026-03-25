import { apiRequest } from './apiClient';

export function getCertificateStats() {
    return apiRequest('/api/admin/certificates/stats');
}

export function getRecentCertificates({ limit = 10, page = 1 } = {}) {
    return apiRequest('/api/certificates/recent', {
        query: { limit, page }
    });
}

export function searchCertificates({ q = '', status = '', limit = 20 } = {}) {
    return apiRequest('/api/certificates/search', {
        query: {
            q,
            status,
            limit
        },
        keepEmptyQueryKeys: ['q']
    });
}

export function getCertificateDetail(certificateId) {
    return apiRequest(`/api/certificates/${certificateId}`);
}

export function revokeCertificate(certificateId, payload) {
    return apiRequest(`/api/certificates/${certificateId}/revoke`, {
        method: 'POST',
        body: payload
    });
}

export function verifyCertificate(certificateId) {
    return apiRequest(`/api/certificates/${certificateId}/verify`, {
        method: 'POST'
    });
}

export function getAdminUsers({ role = '', status = '', page = 1, limit = 20 } = {}) {
    return apiRequest('/api/admin/users', {
        query: {
            role,
            status,
            page,
            limit
        }
    });
}

export function updateAdminUserStatus(userId, payload) {
    return apiRequest(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: payload
    });
}

export function updateAdminUserRole(userId, payload) {
    return apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: payload
    });
}
