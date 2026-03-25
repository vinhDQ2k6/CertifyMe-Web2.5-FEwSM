const SESSION_KEY = 'certifyme_session';

function getApiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
}

export const roleHomeMap = {
    STUDENT: '/student/dashboard',
    TEACHER: '/teacher/classes',
    ADMIN: '/admin/certificates'
};

export function getDefaultRouteByRole(role) {
    return roleHomeMap[role] || '/auth/login';
}

export function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!parsed?.role || !parsed?.token) {
            return null;
        }
        return parsed;
    } catch (_error) {
        return null;
    }
}

export function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

export function buildGoogleOAuthUrl() {
    return `${getApiBaseUrl()}/oauth2/authorization/google`;
}

export function resolveSessionUser() {
    const session = getSession();
    return session?.user || null;
}

export async function fetchAuthMe(token) {
    const authToken = token || getSession()?.token;
    if (!authToken) {
        throw new Error('Missing token');
    }

    const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
        }
    });

    const payload = await response.json();

    if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || payload?.message || 'Cannot get user profile');
    }

    return payload.data;
}

export async function finalizeOAuthSession({ token, roleHint, redirectHint }) {
    const me = await fetchAuthMe(token);
    const role = me?.role || roleHint;

    if (!role) {
        throw new Error('Cannot resolve role');
    }

    const session = {
        token,
        role,
        user: me,
        redirectHint: redirectHint || null
    };

    setSession(session);
    return session;
}

export async function performLogout() {
    const session = getSession();

    try {
        if (session?.token) {
            await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.token}`
                }
            });
        }
    } finally {
        clearSession();
    }
}
