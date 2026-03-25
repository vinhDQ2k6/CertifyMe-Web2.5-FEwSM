<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { getCourseDetail } from '@/service/studentApi';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const course = ref(null);
const errorMessage = ref('');

const normalizedQuizzes = computed(() => {
    const source = Array.isArray(course.value?.quizzes) ? course.value.quizzes : [];

    return source.map((quiz) => ({
        quizId: quiz.quizId || quiz.id || '',
        quizName: quiz.quizName || quiz.name || '',
        duration: quiz.duration,
        passingScore: quiz.passingScore,
        score: quiz.score,
        maxScore: quiz.maxScore,
        status: quiz.status || 'pending'
    }));
});

function getQuizStatusSeverity(status) {
    if (status === 'completed') {
        return 'success';
    }
    if (status === 'locked') {
        return 'danger';
    }
    return 'warn';
}

function getQuizAction(quiz) {
    if (!quiz?.quizId) {
        return {
            label: 'Unavailable',
            to: null,
            disabled: true,
            severity: 'secondary'
        };
    }

    if (quiz.status === 'completed') {
        return {
            label: 'View Result',
            to: `/student/quiz/${quiz.quizId}/result`,
            disabled: false,
            severity: 'secondary'
        };
    }

    if (quiz.status === 'locked') {
        return {
            label: 'Locked',
            to: null,
            disabled: true,
            severity: 'contrast'
        };
    }

    return {
        label: 'Do Quiz',
        to: `/student/quiz/${quiz.quizId}`,
        disabled: false,
        severity: 'primary'
    };
}

const certificateInfo = computed(() => course.value?.certificate || null);

onMounted(async () => {
    try {
        course.value = await getCourseDetail(route.params.courseId);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc chi tiet khoa hoc.');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12" v-if="loading">
            <div class="card text-center text-color-secondary"><i class="pi pi-spin pi-spinner mr-2"></i>Dang tai chi tiet khoa hoc...</div>
        </div>

        <div class="col-span-12" v-else-if="errorMessage">
            <Message severity="error">{{ errorMessage }}</Message>
        </div>

        <template v-else-if="course">
            <div class="col-span-12 lg:col-span-8">
                <div class="card">
                    <div class="text-sm text-color-secondary">{{ course.courseCode }}</div>
                    <h2 class="text-2xl font-semibold mt-1 mb-2">{{ course.courseName }}</h2>
                    <p class="text-color-secondary">Giang vien: {{ course.teacherName }}</p>
                    <ProgressBar :value="course.progress || 0" class="mb-2" />
                    <div class="text-sm text-color-secondary">Tien do: {{ course.progress || 0 }}%</div>
                    <div class="text-sm text-color-secondary mt-2">
                        Quiz hoan thanh: {{ course.completedQuizzes || 0 }}/{{ course.totalQuizzes || 0 }}
                    </div>
                    <div class="text-sm text-color-secondary mt-1">Diem trung binh: {{ course.averageScore ?? '-' }}</div>
                </div>

                <div class="card mt-4">
                    <h3 class="text-xl font-semibold mb-3">Quiz List</h3>
                    <DataTable :value="normalizedQuizzes" responsiveLayout="scroll">
                        <Column field="quizName" header="Quiz"></Column>
                        <Column header="Score">
                            <template #body="slotProps">
                                <span v-if="slotProps.data.score !== null && slotProps.data.score !== undefined">
                                    {{ slotProps.data.score }}/{{ slotProps.data.maxScore ?? 10 }}
                                </span>
                                <span v-else>-</span>
                            </template>
                        </Column>
                        <Column header="Status">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.status" :severity="getQuizStatusSeverity(slotProps.data.status)" />
                            </template>
                        </Column>
                        <Column header="Action">
                            <template #body="slotProps">
                                <Button
                                    size="small"
                                    :label="getQuizAction(slotProps.data).label"
                                    :severity="getQuizAction(slotProps.data).severity"
                                    :disabled="getQuizAction(slotProps.data).disabled"
                                    :as="getQuizAction(slotProps.data).to ? 'router-link' : undefined"
                                    :to="getQuizAction(slotProps.data).to || undefined"
                                />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <div class="card">
                    <h3 class="text-xl font-semibold mb-3">Certificate Summary</h3>
                    <div v-if="certificateInfo">
                        <div class="flex justify-between mb-2">
                            <span>Verification Hash</span>
                            <strong>{{ certificateInfo.verificationHash || '-' }}</strong>
                        </div>
                        <div class="text-sm text-color-secondary">Blockchain Info</div>
                        <div class="text-sm mt-1">Hash: {{ certificateInfo.blockchainInfo?.hash || '-' }}</div>
                        <div class="text-sm">Block: {{ certificateInfo.blockchainInfo?.block || '-' }}</div>
                        <div class="text-sm">Tx: {{ certificateInfo.blockchainInfo?.txHash || '-' }}</div>
                        <div class="text-sm mb-4">Contract: {{ certificateInfo.blockchainInfo?.contract || '-' }}</div>
                    </div>
                    <div class="text-color-secondary mb-4" v-else>Chua du dieu kien hoac chua co chung chi.</div>
                    <Button label="My Certificates" class="w-full" severity="secondary" as="router-link" to="/student/certificates" />
                </div>
            </div>
        </template>

        <div class="col-span-12" v-else>
            <div class="card text-center text-color-secondary">Khong tim thay khoa hoc.</div>
        </div>
    </div>
</template>
