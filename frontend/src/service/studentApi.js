import { apiRequest } from './apiClient';

export function getStudentCourses(studentId) {
    return apiRequest(`/api/student/${studentId}/courses`);
}

export function getCourseDetail(courseId) {
    return apiRequest(`/api/courses/${courseId}`);
}

export function getClassQuizzes(classId) {
    return apiRequest(`/api/classes/${classId}/quizzes`);
}

export function getQuizDetail(quizId) {
    return apiRequest(`/api/quizzes/${quizId}`);
}

export function submitStudentQuiz(quizId, studentId, answersMap) {
    const answers = Object.entries(answersMap)
        .filter(([, selectedOption]) => Boolean(selectedOption))
        .map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption
        }));

    return apiRequest(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: {
            studentId,
            answers
        }
    });
}

export function getQuizResult(quizId) {
    return apiRequest(`/api/quizzes/${quizId}/result`);
}

export function getStudentCertificates(studentId) {
    return apiRequest(`/api/student/${studentId}/certificates`);
}

export function issueStudentCertificate(studentId, classId) {
    return apiRequest(`/api/student/${studentId}/classes/${classId}/certificates/issue`, {
        method: 'POST'
    });
}
