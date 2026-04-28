import AppLayout from '@/layout/AppLayout.vue';
import { getDefaultRouteByRole, getSession } from '@/mock/auth';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '',
                    name: 'home',
                    redirect: () => {
                        const session = getSession();
                        return session ? getDefaultRouteByRole(session.role) : '/auth/login';
                    }
                },
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/blocks/free',
                    name: 'blocks',
                    meta: {
                        breadcrumb: ['Prime Blocks', 'Free Blocks']
                    },
                    component: () => import('@/views/utilities/Blocks.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/start/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                },
                {
                    path: '/student/dashboard',
                    name: 'studentDashboard',
                    component: () => import('@/views/student/StudentDashboard.vue'),
                    meta: { requiresAuth: true, roles: ['STUDENT'] }
                },
                {
                    path: '/student/course/:courseId',
                    name: 'courseDetail',
                    component: () => import('@/views/student/CourseDetail.vue'),
                    meta: { requiresAuth: true, roles: ['STUDENT'] }
                },
                {
                    path: '/student/quiz/:quizId',
                    name: 'quizDetail',
                    component: () => import('@/views/student/QuizDetail.vue'),
                    meta: { requiresAuth: true, roles: ['STUDENT'] }
                },
                {
                    path: '/student/quiz/:quizId/result',
                    name: 'quizResult',
                    component: () => import('@/views/student/QuizResult.vue'),
                    meta: { requiresAuth: true, roles: ['STUDENT'] }
                },
                {
                    path: '/student/certificates',
                    name: 'myCertificates',
                    component: () => import('@/views/student/MyCertificates.vue'),
                    meta: { requiresAuth: true, roles: ['STUDENT'] }
                },
                {
                    path: '/student/certificates/:certificateId',
                    name: 'studentCertificateDetail',
                    component: () => import('@/views/student/CertificateDetail.vue'),
                    meta: { requiresAuth: true, roles: ['STUDENT'] }
                },
                {
                    path: '/teacher/classes',
                    name: 'teacherClasses',
                    component: () => import('@/views/teacher/TeacherClasses.vue'),
                    meta: { requiresAuth: true, roles: ['TEACHER'] }
                },
                {
                    path: '/teacher/classes/:classId',
                    name: 'teacherClassDetail',
                    component: () => import('@/views/teacher/ClassDetail.vue'),
                    meta: { requiresAuth: true, roles: ['TEACHER'] }
                },
                {
                    path: '/teacher/classes/:classId/students',
                    name: 'classStudents',
                    component: () => import('@/views/teacher/ClassStudents.vue'),
                    meta: { requiresAuth: true, roles: ['TEACHER'] }
                },
                {
                    path: '/teacher/classes/:classId/quizzes',
                    name: 'quizManagement',
                    component: () => import('@/views/teacher/QuizManagement.vue'),
                    meta: { requiresAuth: true, roles: ['TEACHER'] }
                },
                {
                    path: '/teacher/quizzes/:quizId/submissions',
                    name: 'quizSubmissions',
                    component: () => import('@/views/teacher/QuizSubmissions.vue'),
                    meta: { requiresAuth: true, roles: ['TEACHER'] }
                },
                {
                    path: '/admin/certificates',
                    name: 'certificateOverview',
                    component: () => import('@/views/admin/CertificateOverview.vue'),
                    meta: { requiresAuth: true, roles: ['ADMIN'] }
                },
                {
                    path: '/admin/certificates/search',
                    name: 'certificateSearch',
                    component: () => import('@/views/admin/CertificateSearch.vue'),
                    meta: { requiresAuth: true, roles: ['ADMIN'] }
                },
                {
                    path: '/admin/certificates/:certificateId',
                    name: 'certificateDetail',
                    component: () => import('@/views/admin/CertificateDetail.vue'),
                    meta: { requiresAuth: true, roles: ['ADMIN'] }
                },
                {
                    path: '/admin/users',
                    name: 'userManagement',
                    component: () => import('@/views/admin/UserManagement.vue'),
                    meta: { requiresAuth: true, roles: ['ADMIN'] }
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: { guestOnly: true }
        },
        {
            path: '/oauth2/redirect',
            name: 'oauthCallback',
            component: () => import('@/views/pages/auth/OAuthCallback.vue'),
            meta: { guestOnly: true }
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        {
            path: '/public/certificate-verification',
            name: 'certificateVerification',
            component: () => import('@/views/pages/public/CertificateVerification.vue'),
            meta: { guestOnly: true }
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/pages/notfound'
        }
    ]
});

router.beforeEach((to) => {
    const session = getSession();

    if (to.meta.requiresAuth && !session) {
        return '/auth/login';
    }

    if (to.meta.guestOnly && session) {
        return getDefaultRouteByRole(session.role);
    }

    if (to.meta.roles && session && !to.meta.roles.includes(session.role)) {
        return '/auth/access';
    }

    if (to.path === '/' && session) {
        return getDefaultRouteByRole(session.role);
    }

    return true;
});

export default router;
