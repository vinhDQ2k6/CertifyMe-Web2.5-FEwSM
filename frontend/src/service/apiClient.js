import { clearSession, getSession } from '@/mock/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function buildUrl(path, query, keepEmptyQueryKeys = []) {
    const url = new URL(path, API_BASE_URL);
    const keepEmpty = new Set(keepEmptyQueryKeys);

    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            const shouldKeepEmpty = value === '' && keepEmpty.has(key);
            if (value !== undefined && value !== null && (value !== '' || shouldKeepEmpty)) {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.toString();
}

function createApiError({ status, payload, fallbackMessage }) {
    const message = payload?.error || payload?.message || fallbackMessage;
    const error = new Error(message);
    error.status = status;
    error.payload = payload;
    return error;
}

export function getApiErrorMessage(error, fallbackMessage) {
    if (!error) {
        return fallbackMessage;
    }
    if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }
    if (error.status === 403) {
        return 'Ban khong co quyen thuc hien thao tac nay.';
    }
    if (error.status === 404) {
        return 'Khong tim thay du lieu.';
    }
    if (error.status >= 500) {
        return 'He thong dang loi. Vui long thu lai sau.';
    }
    return fallbackMessage;
}

export async function apiRequest(path, { method = 'GET', body, query, keepEmptyQueryKeys = [] } = {}) {
    const session = getSession();
    const token = session?.token;

    const response = await fetch(buildUrl(path, query, keepEmptyQueryKeys), {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (_error) {
        payload = null;
    }

    if (response.status === 401) {
        clearSession();
        window.location.href = '/auth/login';
        throw createApiError({
            status: 401,
            payload,
            fallbackMessage: 'Unauthorized'
        });
    }

    if (!response.ok) {
        throw createApiError({
            status: response.status,
            payload,
            fallbackMessage: `Request failed: ${response.status}`
        });
    }

    if (!payload?.success) {
        throw createApiError({
            status: response.status,
            payload,
            fallbackMessage: 'API Error'
        });
    }

    return payload.data;
}
