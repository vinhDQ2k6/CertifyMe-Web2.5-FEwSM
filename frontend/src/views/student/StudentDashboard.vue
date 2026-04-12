<script setup>
import { resolveSessionUser } from '@/mock/auth';
import { getApiErrorMessage } from '@/service/apiClient';
import { getStudentCourses } from '@/service/studentApi';
import { computed, onMounted, ref } from 'vue';

const loading = ref(true);
const courses = ref([]);
const errorMessage = ref('');

const normalizedCourses = computed(() => {
    const source = Array.isArray(courses.value) ? courses.value : [];
    return source.map((course) => {
        const primaryClass = Array.isArray(course.classes) ? course.classes[0] || null : null;
        const totalQuizzes = Number(course.totalQuizzes ?? primaryClass?.totalQuizzes ?? 0);
        const completedQuizzes = Number(course.completedQuizzes ?? primaryClass?.completedQuizzes ?? 0);
        const progress = Number(course.progress ?? primaryClass?.progress ?? 0);
        const classStatus = String(primaryClass?.status || '').toUpperCase();

        const completedByBoolean = typeof course.completed === 'boolean' ? course.completed : typeof course.isCompleted === 'boolean' ? course.isCompleted : false;
        const completedByQuizRatio = totalQuizzes > 0 && completedQuizzes >= totalQuizzes;
        const completedByProgress = progress >= 100;
        const completedByStatus = classStatus.includes('PASS') || classStatus.includes('COMPLETE');

        return {
            primaryClass,
            courseId: course.courseId,
            courseCode: course.courseCode || '-',
            courseName: course.courseName || 'Untitled Course',
            teacherName: course.teacherName || '-',
            progress,
            totalQuizzes,
            completedQuizzes,
            averageScore: course.averageScore ?? '-',
            isCompleted: completedByBoolean || completedByQuizRatio || completedByProgress || completedByStatus
        };
    });
});

onMounted(async () => {
    try {
        const user = resolveSessionUser();
        if (!user?.userId) {
            throw new Error('Khong tim thay student session. Vui long dang nhap lai.');
        }

        courses.value = await getStudentCourses(user.userId);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc danh sach khoa hoc.');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12">
            <div class="card">
                <h2 class="text-2xl font-semibold mb-2">Student Dashboard</h2>
                <p class="text-color-secondary m-0">Theo doi tien do hoc tap va vao nhanh tung khoa hoc.</p>
            </div>
        </div>

        <div class="col-span-12" v-if="loading">
            <div class="card text-center text-color-secondary">
                <i class="pi pi-spin pi-spinner mr-2"></i>
                Dang tai khoa hoc...
            </div>
        </div>

        <div class="col-span-12" v-else-if="errorMessage">
            <Message severity="error">{{ errorMessage }}</Message>
        </div>

        <div class="col-span-12" v-else-if="!normalizedCourses.length">
            <div class="card text-center text-color-secondary">Ban chua co khoa hoc nao.</div>
        </div>

        <div class="col-span-12 md:col-span-6 xl:col-span-4" v-else v-for="course in normalizedCourses" :key="course.courseId">
            <div class="card h-full">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="text-sm text-color-secondary">{{ course.courseCode }}</div>
                        <div class="text-xl font-semibold">{{ course.courseName }}</div>
                    </div>
                    <Tag :severity="course.isCompleted ? 'success' : 'warn'" :value="course.isCompleted ? 'Completed' : 'In Progress'" />
                </div>

                <div class="text-sm mb-2">
                    Teacher: <strong>{{ course.teacherName }}</strong>
                </div>
                <ProgressBar :value="course.progress" class="mb-3" />
                <div class="flex justify-between text-sm text-color-secondary mb-4">
                    <span>{{ course.completedQuizzes }}/{{ course.totalQuizzes }} passed quizzes</span>
                    <span>Avg {{ course.averageScore }}</span>
                </div>
                <Button label="Vao course" class="w-full" as="router-link" :to="`/student/course/${course.courseId}`" />
            </div>
        </div>
    </div>
</template>
