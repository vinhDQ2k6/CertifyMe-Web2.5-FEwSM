const studentCourses = [
    {
        courseId: 'CRS-001',
        courseCode: 'JSA-101',
        courseName: 'JavaScript Fundamentals',
        courseIcon: 'pi pi-code',
        teacherName: 'Tran Minh Khoa',
        progress: 72,
        totalQuizzes: 4,
        completedQuizzes: 3,
        averageScore: 8.1,
        isCompleted: false
    },
    {
        courseId: 'CRS-002',
        courseCode: 'VUE-201',
        courseName: 'Vue 3 Practical UI',
        courseIcon: 'pi pi-desktop',
        teacherName: 'Vo Thanh Linh',
        progress: 100,
        totalQuizzes: 3,
        completedQuizzes: 3,
        averageScore: 9.0,
        isCompleted: true
    }
];

const courseDetails = {
    'CRS-001': {
        courseId: 'CRS-001',
        courseCode: 'JSA-101',
        courseName: 'JavaScript Fundamentals',
        teacherName: 'Tran Minh Khoa',
        progress: 72,
        quizzes: [
            { quizId: 'QZ-001', quizName: 'Variables & Scope', status: 'completed', duration: 20, passingScore: 5 },
            { quizId: 'QZ-002', quizName: 'Functions', status: 'completed', duration: 30, passingScore: 5 },
            { quizId: 'QZ-003', quizName: 'Objects & Arrays', status: 'pending', duration: 35, passingScore: 6 },
            { quizId: 'QZ-004', quizName: 'Async Basics', status: 'pending', duration: 25, passingScore: 6 }
        ],
        certificateSummary: {
            status: 'pending',
            requiredAverage: 7,
            currentAverage: 8.1
        }
    },
    'CRS-002': {
        courseId: 'CRS-002',
        courseCode: 'VUE-201',
        courseName: 'Vue 3 Practical UI',
        teacherName: 'Vo Thanh Linh',
        progress: 100,
        quizzes: [
            { quizId: 'QZ-201', quizName: 'Composition API', status: 'completed', duration: 25, passingScore: 6 },
            { quizId: 'QZ-202', quizName: 'Routing & Guards', status: 'completed', duration: 25, passingScore: 6 },
            { quizId: 'QZ-203', quizName: 'State & Data Flow', status: 'completed', duration: 30, passingScore: 7 }
        ],
        certificateSummary: {
            status: 'issued',
            requiredAverage: 7,
            currentAverage: 9
        }
    }
};

const quizDetails = {
    'QZ-003': {
        quizId: 'QZ-003',
        quizName: 'Objects & Arrays',
        duration: 35,
        passingScore: 6,
        status: 'published',
        questions: [
            {
                questionId: '1',
                questionText: 'Phương thức nào dùng để duyệt từng phần tử của mảng?',
                optionA: 'map',
                optionB: 'reduce',
                optionC: 'forEach',
                optionD: 'find'
            },
            {
                questionId: '2',
                questionText: 'Cú pháp destructuring object đúng là?',
                optionA: 'const [a] = obj',
                optionB: 'const { a } = obj',
                optionC: 'const (a) = obj',
                optionD: 'const <a> = obj'
            }
        ]
    },
    'QZ-004': {
        quizId: 'QZ-004',
        quizName: 'Async Basics',
        duration: 25,
        passingScore: 6,
        status: 'published',
        questions: [
            {
                questionId: '1',
                questionText: 'Promise ở trạng thái nào khi mới khởi tạo?',
                optionA: 'fulfilled',
                optionB: 'pending',
                optionC: 'resolved',
                optionD: 'rejected'
            }
        ]
    }
};

const quizResults = {
    'QZ-003': {
        quizId: 'QZ-003',
        quizTitle: 'Objects & Arrays',
        score: 8,
        maxScore: 10,
        passingScore: 6,
        status: 'PASSED',
        attemptCount: 1,
        submittedAt: '2026-03-21T10:15:00'
    },
    'QZ-004': {
        quizId: 'QZ-004',
        quizTitle: 'Async Basics',
        score: 5,
        maxScore: 10,
        passingScore: 6,
        status: 'FAILED',
        attemptCount: 2,
        submittedAt: '2026-03-21T11:00:00'
    }
};

const studentCertificates = [
    {
        certificateId: 'CERT-001',
        courseName: 'Vue 3 Practical UI',
        courseCode: 'VUE-201',
        issuedAt: '2026-03-15',
        verificationHash: '0x6f8c13ac42d9',
        status: 'issued',
        blockchainInfo: {
            hash: '0x6f8c13ac42d9',
            block: '5031021',
            txHash: '0x9a3c1d9f55cc',
            contract: '0xabc123ff00dd'
        }
    },
    {
        certificateId: 'CERT-002',
        courseName: 'JavaScript Fundamentals',
        courseCode: 'JSA-101',
        issuedAt: null,
        verificationHash: null,
        status: 'pending',
        blockchainInfo: null
    }
];

const teacherClasses = [
    {
        classId: 'CLS-001',
        classCode: 'SD18303',
        courseName: 'JavaScript Fundamentals',
        courseId: 'CRS-001',
        teacherName: 'Tran Minh Khoa',
        studentCount: 28,
        quizCount: 4,
        status: 'active',
        startDate: '2026-02-01',
        endDate: '2026-06-01',
        description: 'Lop JavaScript buoi sang'
    },
    {
        classId: 'CLS-002',
        classCode: 'SD18304',
        courseName: 'Vue 3 Practical UI',
        courseId: 'CRS-002',
        teacherName: 'Tran Minh Khoa',
        studentCount: 22,
        quizCount: 3,
        status: 'upcoming',
        startDate: '2026-04-10',
        endDate: '2026-08-10',
        description: 'Lop Vue buoi toi'
    }
];

const classStudents = {
    'CLS-001': [
        {
            enrollmentId: 'ENR-001',
            studentId: 'stu-001',
            fullName: 'Nguyen Bao An',
            email: 'student@certifyme.dev',
            avatarUrl: '/demo/images/avatar/amyelsner.png',
            completedQuizzes: 3,
            totalQuizzes: 4,
            averageScore: 8.1,
            status: 'active',
            enrolledAt: '2026-02-01'
        },
        {
            enrollmentId: 'ENR-002',
            studentId: 'stu-002',
            fullName: 'Pham Gia Huy',
            email: 'huy@certifyme.dev',
            avatarUrl: '/demo/images/avatar/xuxuefeng.png',
            completedQuizzes: 2,
            totalQuizzes: 4,
            averageScore: 6.4,
            status: 'active',
            enrolledAt: '2026-02-01'
        }
    ]
};

const classQuizzes = {
    'CLS-001': [
        { quizId: 'QZ-001', quizName: 'Variables & Scope', duration: 20, passingScore: 5, status: 'published' },
        { quizId: 'QZ-002', quizName: 'Functions', duration: 30, passingScore: 5, status: 'published' },
        { quizId: 'QZ-003', quizName: 'Objects & Arrays', duration: 35, passingScore: 6, status: 'published' }
    ]
};

const quizSubmissions = {
    'QZ-003': [
        {
            submissionId: 'SUB-001',
            studentId: 'stu-001',
            studentName: 'Nguyen Bao An',
            studentEmail: 'student@certifyme.dev',
            score: 8,
            maxScore: 10,
            passed: true,
            submittedAt: '2026-03-21T10:15:00'
        },
        {
            submissionId: 'SUB-002',
            studentId: 'stu-002',
            studentName: 'Pham Gia Huy',
            studentEmail: 'huy@certifyme.dev',
            score: 5,
            maxScore: 10,
            passed: false,
            submittedAt: '2026-03-21T10:22:00'
        }
    ]
};

const adminCertificates = [
    {
        certificateId: 'CERT-001',
        studentId: 'stu-001',
        studentName: 'Nguyen Bao An',
        classId: 'CLS-002',
        className: 'SD18304',
        courseCode: 'VUE-201',
        courseName: 'Vue 3 Practical UI',
        averageScore: 9,
        issuedAt: '2026-03-15T00:00:00Z',
        status: 'issued',
        verificationHash: '0x6f8c13ac42d9',
        blockchainInfo: {
            transactionHash: '0x9a3c1d9f55cc',
            blockNumber: 5031021,
            contractAddress: '0xabc123ff00dd',
            networkName: 'Ethereum Mainnet',
            explorerUrl: 'https://etherscan.io/tx/0x9a3c1d9f55cc'
        },
        quizResults: [
            { quizId: 'QZ-201', quizName: 'Composition API', score: 9, maxScore: 10, completedAt: '2026-03-02' },
            { quizId: 'QZ-202', quizName: 'Routing & Guards', score: 9, maxScore: 10, completedAt: '2026-03-07' }
        ]
    },
    {
        certificateId: 'CERT-009',
        studentId: 'stu-009',
        studentName: 'Dang Hoang Nam',
        classId: 'CLS-001',
        className: 'SD18303',
        courseCode: 'JSA-101',
        courseName: 'JavaScript Fundamentals',
        averageScore: 5.2,
        issuedAt: null,
        status: 'pending',
        verificationHash: null,
        blockchainInfo: null,
        quizResults: []
    }
];

const adminUsers = [
    { userId: 'stu-001', fullName: 'Nguyen Bao An', email: 'student@certifyme.dev', role: 'STUDENT', isActive: true },
    { userId: 'tea-001', fullName: 'Tran Minh Khoa', email: 'teacher@certifyme.dev', role: 'TEACHER', isActive: true },
    { userId: 'adm-001', fullName: 'Le Thu Ha', email: 'admin@certifyme.dev', role: 'ADMIN', isActive: true }
];

function withDelay(data, timeout = 200) {
    return new Promise((resolve) => {
        window.setTimeout(() => resolve(structuredClone(data)), timeout);
    });
}

export function fetchStudentCourses() {
    return withDelay(studentCourses);
}

export function fetchCourseDetail(courseId) {
    return withDelay(courseDetails[courseId] || null);
}

export function fetchQuizDetail(quizId) {
    return withDelay(quizDetails[quizId] || null);
}

export function submitQuiz(quizId) {
    return withDelay(quizResults[quizId] || quizResults['QZ-003']);
}

export function fetchQuizResult(quizId) {
    return withDelay(quizResults[quizId] || null);
}

export function fetchStudentCertificates() {
    return withDelay(studentCertificates);
}

export function fetchStudentCertificateDetail(certificateId) {
    return withDelay(studentCertificates.find((item) => item.certificateId === certificateId) || null);
}

export function fetchTeacherClasses() {
    return withDelay(teacherClasses);
}

export function createMockClass(payload) {
    const newClass = {
        classId: `CLS-${String(teacherClasses.length + 1).padStart(3, '0')}`,
        classCode: payload.classCode,
        courseName: payload.courseName,
        courseId: payload.courseId || payload.courseName,
        teacherName: 'Tran Minh Khoa',
        studentCount: 0,
        quizCount: 0,
        status: 'upcoming',
        startDate: payload.startDate,
        endDate: payload.endDate,
        description: payload.description || ''
    };

    teacherClasses.unshift(newClass);
    return withDelay(newClass);
}

export function fetchClassDetail(classId) {
    return withDelay(teacherClasses.find((item) => item.classId === classId) || null);
}

export function fetchClassStudents(classId) {
    return withDelay(classStudents[classId] || []);
}

export function fetchClassQuizzes(classId) {
    return withDelay(classQuizzes[classId] || []);
}

export function fetchQuizSubmissions(quizId) {
    return withDelay(quizSubmissions[quizId] || []);
}

export function fetchCertificateStats() {
    const issued = adminCertificates.filter((item) => item.status === 'issued').length;
    const revoked = adminCertificates.filter((item) => item.status === 'revoked').length;

    return withDelay({
        totalCertificates: adminCertificates.length,
        issuedCertificates: issued,
        revokedCertificates: revoked,
        certificatesThisMonth: issued,
        certificatesThisYear: adminCertificates.length
    });
}

export function fetchRecentCertificates() {
    return withDelay({
        items: adminCertificates,
        pagination: { page: 1, limit: 10, total: adminCertificates.length }
    });
}

export function searchCertificates(keyword = '', status = '') {
    const lowerKeyword = keyword.trim().toLowerCase();
    const filtered = adminCertificates.filter((item) => {
        const matchedKeyword = !lowerKeyword || item.certificateId.toLowerCase().includes(lowerKeyword) || item.studentName.toLowerCase().includes(lowerKeyword) || item.courseName.toLowerCase().includes(lowerKeyword);
        const matchedStatus = !status || item.status === status;
        return matchedKeyword && matchedStatus;
    });

    return withDelay({
        items: filtered,
        pagination: { page: 1, limit: 10, total: filtered.length }
    });
}

export function fetchCertificateDetail(certificateId) {
    return withDelay(adminCertificates.find((item) => item.certificateId === certificateId) || null);
}

export function mockRevokeCertificate(certificateId, reason) {
    const item = adminCertificates.find((cert) => cert.certificateId === certificateId);
    if (item) {
        item.status = 'revoked';
    }

    return withDelay({
        certificateId,
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        revokedByUserId: 'adm-001',
        reason
    });
}

export function fetchAdminUsers() {
    return withDelay(adminUsers);
}

export function updateMockUserStatus(userId, isActive) {
    const user = adminUsers.find((item) => item.userId === userId);
    if (user) {
        user.isActive = isActive;
    }
    return withDelay(user || null);
}

export function updateMockUserRole(userId, role) {
    const user = adminUsers.find((item) => item.userId === userId);
    if (user) {
        user.role = role;
    }
    return withDelay(user || null);
}
