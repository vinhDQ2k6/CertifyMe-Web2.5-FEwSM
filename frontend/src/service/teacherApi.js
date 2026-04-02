import { apiRequest } from './apiClient';

export function getPublicCourses() {
    return apiRequest('/api/courses');
}

export function getTeacherClasses(teacherId) {
    return apiRequest(`/api/teacher/${teacherId}/classes`);
}

export function getClassDetail(classId) {
    return apiRequest(`/api/classes/${classId}`);
}

export function getClassStudents(classId, params = {}) {
    return apiRequest(`/api/classes/${classId}/students`, {
        query: {
            status: params.status,
            sort: params.sort,
            order: params.order
        }
    });
}

export function searchStudents(keyword) {
    return apiRequest('/api/users/search/students', {
        query: {
            q: keyword
        },
        keepEmptyQueryKeys: ['q']
    });
}

export function createClass(payload) {
    return apiRequest('/api/classes', {
        method: 'POST',
        body: payload
    });
}

export function updateClass(classId, payload) {
    return apiRequest(`/api/classes/${classId}`, {
        method: 'PUT',
        body: payload
    });
}

export function getClassQuizzes(classId) {
    return apiRequest(`/api/classes/${classId}/quizzes`);
}

export function getQuizDetail(quizId) {
    return apiRequest(`/api/quizzes/${quizId}`);
}

export function createQuiz(payload) {
    return apiRequest('/api/quizzes', {
        method: 'POST',
        body: payload
    });
}

export function updateQuiz(quizId, payload) {
    return apiRequest(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        body: payload
    });
}

export function deleteQuiz(quizId) {
    return apiRequest(`/api/quizzes/${quizId}`, {
        method: 'DELETE'
    });
}

export function getQuizSubmissions(quizId) {
    return apiRequest(`/api/quizzes/${quizId}/submissions`);
}

export function createEnrollment(payload) {
    return apiRequest('/api/enrollments', {
        method: 'POST',
        body: payload
    });
}

export function deleteEnrollment(enrollmentId) {
    return apiRequest(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE'
    });
}
