<script setup>
import { resolveSessionUser } from '@/mock/auth';
import { getApiErrorMessage } from '@/service/apiClient';
import { getClassQuizzes, getCourseDetail, getStudentCertificates, issueStudentCertificate } from '@/service/studentApi';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const course = ref(null);
const errorMessage = ref('');
const classQuizzes = ref([]);
const classQuizzesLoaded = ref(false);
const quizListLoading = ref(false);
const selectedClassId = ref('');
const detailDialogVisible = ref(false);
const detailTitle = ref('');
const detailValue = ref('');
const issuingCertificate = ref(false);
const issueMessage = ref('');
const waitingDialogVisible = ref(false);
const waitingForCertificate = ref(false);
const pollingAttempt = ref(0);
const waitingMessage = ref('Dang tao chung chi. He thong se tu dong kiem tra ket qua moi 5 giay...');

let pollTimerId = null;
let pollingActive = false;

function shortenMiddle(value, head = 10, tail = 8) {
    const text = value == null ? '' : String(value);
    if (!text) {
        return '-';
    }
    if (text.length <= head + tail + 3) {
        return text;
    }
    return `${text.slice(0, head)}...${text.slice(-tail)}`;
}

function openDetail(title, value) {
    detailTitle.value = title;
    detailValue.value = value == null || value === '' ? '-' : String(value);
    detailDialogVisible.value = true;
}

const normalizedQuizzes = computed(() => {
    const source = classQuizzesLoaded.value ? classQuizzes.value : Array.isArray(course.value?.quizzes) ? course.value.quizzes : [];

    return source.map((quiz) => ({
        quizId: quiz.quizId || quiz.id || '',
        quizName: quiz.title || quiz.quizName || quiz.name || '',
        duration: Number(quiz.timeLimit ?? quiz.duration ?? 0),
        passingScore: quiz.passingScore,
        score: quiz.score,
        maxScore: quiz.maxScore,
        status: normalizeQuizStatus(quiz.studentStatus || quiz.status)
    }));
});

const classOptions = computed(() => {
    const source = Array.isArray(course.value?.classes) ? course.value.classes : [];
    return source
        .filter((item) => item?.classId)
        .map((item) => ({
            classId: item.classId,
            className: item.className || item.classCode || item.classId,
            progress: Number(item.progress ?? 0),
            status: item.status || ''
        }));
});

const selectedClassSummary = computed(() => {
    return classOptions.value.find((item) => item.classId === selectedClassId.value) || null;
});

const effectiveClassId = computed(() => {
    return selectedClassId.value || classOptions.value[0]?.classId || course.value?.classId || '';
});

const courseProgress = computed(() => {
    if (selectedClassSummary.value) {
        return selectedClassSummary.value.progress;
    }
    return Number(course.value?.progress ?? 0);
});

function normalizeQuizStatus(status) {
    const normalizedUpper = String(status || '')
        .trim()
        .toUpperCase();

    if (['NOT_STARTED', 'ATTEMPTED', 'PASSED', 'FAILED', 'LOCKED'].includes(normalizedUpper)) {
        return normalizedUpper;
    }

    const normalizedLower = String(status || '')
        .trim()
        .toLowerCase();

    if (normalizedLower === 'completed') {
        return 'PASSED';
    }
    if (normalizedLower === 'pending') {
        return 'NOT_STARTED';
    }
    if (normalizedLower === 'attempted') {
        return 'ATTEMPTED';
    }
    if (normalizedLower === 'locked') {
        return 'LOCKED';
    }
    if (normalizedLower === 'failed') {
        return 'FAILED';
    }
    return 'NOT_STARTED';
}

function getQuizStatusSeverity(status) {
    if (status === 'PASSED') {
        return 'success';
    }
    if (status === 'FAILED' || status === 'LOCKED') {
        return 'danger';
    }
    if (status === 'ATTEMPTED') {
        return 'info';
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

    if (quiz.status === 'PASSED') {
        return {
            label: 'View Result',
            to: `/student/quiz/${quiz.quizId}/result`,
            disabled: false,
            severity: 'secondary'
        };
    }

    if (quiz.status === 'LOCKED') {
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

const isCourseCompleted = computed(() => {
    const completedByBoolean = typeof course.value?.completed === 'boolean' ? course.value.completed : typeof course.value?.isCompleted === 'boolean' ? course.value.isCompleted : false;
    const total = Number(course.value?.totalQuizzes ?? 0);
    const done = Number(course.value?.completedQuizzes ?? 0);
    const completedByQuizRatio = total > 0 && done >= total;
    const completedByProgress = Number(courseProgress.value ?? 0) >= 100;
    return completedByBoolean || completedByQuizRatio || completedByProgress;
});

const canIssueCertificate = computed(() => {
    return isCourseCompleted.value && !certificateInfo.value && !issuingCertificate.value && !waitingForCertificate.value;
});

const blockDisplay = computed(() => {
    const raw = certificateInfo.value?.blockchainInfo?.block;
    if (raw === null || raw === undefined || String(raw).trim() === '') {
        return 'N/A';
    }
    return String(raw);
});

async function onIssueCertificate() {
    const user = resolveSessionUser();
    const classId = effectiveClassId.value;

    if (!user?.userId) {
        issueMessage.value = 'Khong tim thay student session. Vui long dang nhap lai.';
        return;
    }

    if (!classId) {
        issueMessage.value = 'Thieu classId tu API course detail. Chua the goi issue certificate.';
        return;
    }

    try {
        issuingCertificate.value = true;
        issueMessage.value = '';
        await issueStudentCertificate(user.userId, classId);
        startCertificatePolling(user.userId, classId);
    } catch (error) {
        issueMessage.value = getApiErrorMessage(error, 'Cap chung chi that bai. Vui long thu lai.');
    } finally {
        issuingCertificate.value = false;
    }
}

function clearPollTimer() {
    if (pollTimerId) {
        clearTimeout(pollTimerId);
        pollTimerId = null;
    }
}

function stopCertificatePolling() {
    pollingActive = false;
    clearPollTimer();
    waitingForCertificate.value = false;
    waitingDialogVisible.value = false;
}

function findIssuedCertificate(certificates, classId) {
    if (!Array.isArray(certificates) || !certificates.length) {
        return null;
    }

    return (
        certificates.find((item) => String(item?.classId || '') === String(classId) && String(item?.status || '').toLowerCase() === 'issued') ||
        certificates.find((item) => String(item?.classId || '') === String(classId)) ||
        null
    );
}

async function pollForCertificate(studentId, classId) {
    if (!pollingActive) {
        return;
    }

    pollingAttempt.value += 1;

    try {
        const certificates = await getStudentCertificates(studentId);
        const issuedCertificate = findIssuedCertificate(certificates, classId);

        if (issuedCertificate) {
            if (course.value) {
                course.value = {
                    ...course.value,
                    certificate: issuedCertificate
                };
            }

            issueMessage.value = 'Da lay duoc chung chi. Thong tin chung chi da duoc cap nhat.';
            stopCertificatePolling();
            return;
        }

        waitingMessage.value = `Dang cho cap chung chi... Lan kiem tra #${pollingAttempt.value}.`; 
    } catch (_error) {
        waitingMessage.value = `Tam thoi chua lay duoc chung chi (lan #${pollingAttempt.value}). He thong se thu lai sau 5 giay...`;
    }

    clearPollTimer();
    pollTimerId = setTimeout(() => {
        pollForCertificate(studentId, classId);
    }, 5000);
}

function startCertificatePolling(studentId, classId) {
    stopCertificatePolling();
    pollingActive = true;
    pollingAttempt.value = 0;
    waitingForCertificate.value = true;
    waitingDialogVisible.value = true;
    waitingMessage.value = 'Dang tao chung chi. He thong se tu dong kiem tra ket qua moi 5 giay...';
    pollForCertificate(studentId, classId);
}

async function loadClassQuizzes(classId) {
    if (!classId) {
        classQuizzes.value = [];
        classQuizzesLoaded.value = false;
        return;
    }

    quizListLoading.value = true;
    try {
        const result = await getClassQuizzes(classId);
        classQuizzes.value = Array.isArray(result) ? result : [];
        classQuizzesLoaded.value = true;
    } catch (_error) {
        classQuizzes.value = [];
        classQuizzesLoaded.value = false;
    } finally {
        quizListLoading.value = false;
    }
}

onMounted(async () => {
    try {
        course.value = await getCourseDetail(route.params.courseId);
        selectedClassId.value = classOptions.value[0]?.classId || '';
        if (selectedClassId.value) {
            await loadClassQuizzes(selectedClassId.value);
        }
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc chi tiet khoa hoc.');
    } finally {
        loading.value = false;
    }
});

watch(selectedClassId, async (newClassId, oldClassId) => {
    if (!newClassId || newClassId === oldClassId) {
        return;
    }
    await loadClassQuizzes(newClassId);
});

onUnmounted(() => {
    stopCertificatePolling();
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
                    <ProgressBar :value="courseProgress" class="mb-2" />
                    <div class="text-sm text-color-secondary">Tien do: {{ courseProgress }}%</div>
                    <div class="text-sm text-color-secondary mt-2">
                        Quiz hoan thanh: {{ course.completedQuizzes || 0 }}/{{ course.totalQuizzes || 0 }}
                    </div>
                    <div class="text-sm text-color-secondary mt-1">Diem trung binh: {{ course.averageScore ?? '-' }}</div>
                </div>

                <div class="card mt-4">
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h3 class="text-xl font-semibold m-0">Quiz List</h3>
                        <Select
                            v-if="classOptions.length"
                            v-model="selectedClassId"
                            :options="classOptions"
                            optionLabel="className"
                            optionValue="classId"
                            placeholder="Chon class"
                            class="w-full md:w-18rem"
                        />
                    </div>
                    <div v-if="quizListLoading" class="text-sm text-color-secondary mb-3">
                        <i class="pi pi-spin pi-spinner mr-2"></i>Dang tai danh sach quiz theo class...
                    </div>
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
                        <div class="flex justify-between items-center gap-2 mb-2 min-w-0">
                            <span>Verification Hash</span>
                            <div class="flex items-center gap-2 min-w-0">
                                <strong class="truncate">{{ shortenMiddle(certificateInfo.verificationHash || '-') }}</strong>
                                <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Verification Hash', certificateInfo.verificationHash || '-')" />
                            </div>
                        </div>
                        <div class="text-sm text-color-secondary">Blockchain Info</div>
                        <div class="text-sm mt-1 flex items-center gap-2 min-w-0">
                            <span>Hash: {{ shortenMiddle(certificateInfo.blockchainInfo?.hash || '-') }}</span>
                            <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Blockchain Hash', certificateInfo.blockchainInfo?.hash || '-')" />
                        </div>
                        <div class="text-sm">Block: {{ blockDisplay }}</div>
                        <div class="text-sm flex items-center gap-2 min-w-0">
                            <span>Tx: {{ shortenMiddle(certificateInfo.blockchainInfo?.txHash || '-') }}</span>
                            <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Transaction Hash', certificateInfo.blockchainInfo?.txHash || '-')" />
                        </div>
                        <div class="text-sm mb-4 flex items-center gap-2 min-w-0">
                            <span>Contract: {{ shortenMiddle(certificateInfo.blockchainInfo?.contract || '-') }}</span>
                            <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Contract Address', certificateInfo.blockchainInfo?.contract || '-')" />
                        </div>
                    </div>
                    <div class="text-color-secondary mb-3" v-else>Chua du dieu kien hoac chua co chung chi.</div>
                    <div v-if="!certificateInfo && canIssueCertificate" class="mb-3">
                        <Button
                            label="Issue Certificate"
                            icon="pi pi-send"
                            class="w-full"
                            :loading="issuingCertificate"
                            :disabled="!effectiveClassId"
                            @click="onIssueCertificate"
                        />
                        <small v-if="!effectiveClassId" class="text-orange-500">Khong tim thay classId trong response hien tai.</small>
                    </div>
                    <div v-if="waitingForCertificate" class="mb-3 text-sm text-blue-600">
                        <i class="pi pi-spin pi-spinner mr-2"></i>Dang doi cap chung chi... He thong dang polling du lieu.
                    </div>
                    <Message v-if="issueMessage" class="mb-3" :severity="certificateInfo ? 'success' : 'warn'">{{ issueMessage }}</Message>
                    <Button label="My Certificates" class="w-full" severity="secondary" as="router-link" to="/student/certificates" />
                </div>
            </div>

            <Dialog v-model:visible="detailDialogVisible" modal :header="detailTitle" :style="{ width: '70vw', maxWidth: '980px' }">
                <div class="text-sm break-all">{{ detailValue }}</div>
            </Dialog>

            <Dialog v-model:visible="waitingDialogVisible" modal :closable="false" :draggable="false" :style="{ width: '28rem' }" header="Dang cap chung chi">
                <div class="flex items-start gap-3">
                    <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
                    <div class="text-sm leading-6">
                        <div class="font-semibold mb-1">Vui long cho trong giay lat</div>
                        <div>{{ waitingMessage }}</div>
                        <div class="text-color-secondary mt-2">So lan kiem tra: {{ pollingAttempt }}</div>
                    </div>
                </div>
            </Dialog>
        </template>

        <div class="col-span-12" v-else>
            <div class="card text-center text-color-secondary">Khong tim thay khoa hoc.</div>
        </div>
    </div>
</template>
