<script setup>
import { resolveSessionUser } from '@/mock/auth';
import { getApiErrorMessage } from '@/service/apiClient';
import { getQuizDetail, getQuizResult, submitStudentQuiz } from '@/service/studentApi';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const submitting = ref(false);
const quiz = ref(null);
const answers = ref({});
const errorMessage = ref('');
const existingResult = ref(null);
const remainingSeconds = ref(0);
let countdownInterval = null;

const timerLabel = computed(() => {
    const total = Math.max(0, remainingSeconds.value);
    const minutes = Math.floor(total / 60)
        .toString()
        .padStart(2, '0');
    const seconds = (total % 60)
        .toString()
        .padStart(2, '0');
    return `${minutes}:${seconds}`;
});

const canSubmitQuiz = computed(() => {
    if (!quiz.value) {
        return false;
    }
    if (String(quiz.value.status || '').toLowerCase() === 'closed') {
        return false;
    }
    if (remainingSeconds.value <= 0) {
        return false;
    }
    return true;
});

function clearTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function startTimer(durationMinutes) {
    clearTimer();

    const minutes = Number(durationMinutes) || 0;
    remainingSeconds.value = Math.max(0, Math.floor(minutes * 60));

    if (remainingSeconds.value <= 0) {
        return;
    }

    countdownInterval = setInterval(() => {
        if (remainingSeconds.value <= 0) {
            clearTimer();
            return;
        }

        remainingSeconds.value -= 1;

        if (remainingSeconds.value <= 0) {
            clearTimer();
            errorMessage.value = 'Da het thoi gian lam bai. Vui long nop bai.';
        }
    }, 1000);
}

function normalizeQuestion(question) {
    const optionsArray = Array.isArray(question?.options) ? question.options : [];

    const normalizedOptions = optionsArray
        .map((item) => {
            const optionId = item?.id || item?.optionId;
            const optionText = item?.text || item?.optionText;
            if (!optionId || !optionText) {
                return null;
            }
            return {
                id: String(optionId),
                text: String(optionText)
            };
        })
        .filter(Boolean);

    if (!normalizedOptions.length) {
        const fallbackOptions = ['A', 'B', 'C', 'D']
            .map((optionId) => {
                const optionText = question?.[`option${optionId}`];
                if (!optionText) {
                    return null;
                }
                return {
                    id: optionId,
                    text: optionText
                };
            })
            .filter(Boolean);
        normalizedOptions.push(...fallbackOptions);
    }

    return {
        ...question,
        questionText: question?.text || question?.questionText || '',
        questionType: question?.type || question?.questionType || 'MULTIPLE_CHOICE',
        options: normalizedOptions
    };
}

function normalizeQuiz(rawQuiz) {
    if (!rawQuiz) {
        return null;
    }

    return {
        ...rawQuiz,
        title: rawQuiz?.title || rawQuiz?.quizName || 'Quiz',
        timeLimit: rawQuiz?.timeLimit ?? rawQuiz?.duration ?? 0,
        questions: Array.isArray(rawQuiz.questions) ? rawQuiz.questions.map(normalizeQuestion) : []
    };
}

onMounted(async () => {
    try {
        const detail = await getQuizDetail(route.params.quizId);
        quiz.value = normalizeQuiz(detail);

        try {
            existingResult.value = await getQuizResult(route.params.quizId);
        } catch (_error) {
            existingResult.value = null;
        }

        startTimer(quiz.value?.timeLimit);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc bai quiz.');
    } finally {
        loading.value = false;
    }
});

onUnmounted(() => {
    clearTimer();
});

async function onSubmit() {
    if (!canSubmitQuiz.value) {
        return;
    }

    try {
        const user = resolveSessionUser();
        if (!user?.userId) {
            throw new Error('Khong tim thay student session. Vui long dang nhap lai.');
        }

        submitting.value = true;
        await submitStudentQuiz(route.params.quizId, user.userId, answers.value);
        router.push(`/student/quiz/${route.params.quizId}/result`);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Nop bai that bai.');
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <div class="card" v-if="loading"><i class="pi pi-spin pi-spinner mr-2"></i> Dang tai de quiz...</div>

    <div class="card" v-else-if="errorMessage">
        <Message severity="error">{{ errorMessage }}</Message>
    </div>

    <div class="grid grid-cols-12 gap-6" v-else-if="quiz">
        <div class="col-span-12">
            <div class="card">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-semibold mb-1">{{ quiz.title }}</h2>
                        <p class="text-color-secondary m-0">Duration: {{ quiz.timeLimit }} minutes | Passing score: {{ quiz.passingScore }}</p>
                    </div>
                    <Tag :value="`Timer ${timerLabel}`" :severity="remainingSeconds > 0 ? 'info' : 'danger'" />
                </div>
            </div>
        </div>

        <div class="col-span-12" v-if="existingResult">
            <Message severity="info">
                Ban da co ket qua truoc do. Ban van co the lam lai quiz, va co the xem ket qua hien tai.
            </Message>
        </div>

        <div class="col-span-12" v-for="question in quiz.questions" :key="question.questionId">
            <div class="card">
                <h4 class="font-semibold">Cau {{ question.questionId }}. {{ question.questionText }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div v-for="option in question.options" :key="option.id" class="p-field-radiobutton">
                        <RadioButton v-model="answers[question.questionId]" :inputId="`${question.questionId}-${option.id}`" :value="option.id" />
                        <label class="ml-2" :for="`${question.questionId}-${option.id}`">{{ option.id }}. {{ option.text }}</label>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-span-12">
            <div class="flex gap-2 flex-wrap">
                <Button
                    :label="existingResult ? 'Submit Again' : 'Submit Quiz'"
                    :loading="submitting"
                    :disabled="!canSubmitQuiz"
                    @click="onSubmit"
                />
                <Button
                    v-if="existingResult"
                    label="View Result"
                    severity="secondary"
                    as="router-link"
                    :to="`/student/quiz/${route.params.quizId}/result`"
                />
            </div>
        </div>
    </div>

    <div class="card text-center text-color-secondary" v-else>Quiz khong ton tai.</div>
</template>
