<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { createQuiz, deleteQuiz, getClassQuizzes, getQuizDetail, updateQuiz } from '@/service/teacherApi';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const quizzes = ref([]);
const loading = ref(true);
const busy = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const quizDialog = ref(false);
const editQuizId = ref(null);
const formError = ref('');

function createDefaultQuestion(index = 1) {
    return {
        localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        questionText: '',
        questionType: 'multiple_choice',
        correctOptionId: 'A',
        options: [
            { optionId: 'A', optionText: '' },
            { optionId: 'B', optionText: '' },
            { optionId: 'C', optionText: '' },
            { optionId: 'D', optionText: '' }
        ],
        order: index
    };
}

function createDefaultForm() {
    return {
        quizName: '',
        duration: 30,
        passingScore: 5,
        maxScore: 10,
        questions: [createDefaultQuestion(1)]
    };
}

const form = ref({
    quizName: '',
    duration: 30,
    passingScore: 5,
    maxScore: 10,
    questions: [createDefaultQuestion(1)]
});

async function loadQuizzes() {
    try {
        quizzes.value = await getClassQuizzes(route.params.classId);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc danh sach quiz.');
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    await loadQuizzes();
});

function openCreateDialog() {
    editQuizId.value = null;
    formError.value = '';
    form.value = createDefaultForm();
    quizDialog.value = true;
}

function mapQuestionForForm(question, index) {
    const optionsFromObject = ['A', 'B', 'C', 'D']
        .filter((id) => typeof question?.[`option${id}`] === 'string')
        .map((id) => ({ optionId: id, optionText: question[`option${id}`] }));

    const optionsFromArray = Array.isArray(question?.options)
        ? question.options.map((opt, optionIndex) => ({
              optionId: opt.optionId || String.fromCharCode(65 + optionIndex),
                            optionText: opt.optionText || '',
                            isCorrect: Boolean(opt.isCorrect)
          }))
        : [];

    const normalizedOptionsSource = optionsFromArray.length ? optionsFromArray : optionsFromObject;
    const normalizedOptions = ['A', 'B', 'C', 'D'].map((id, optionIndex) => {
        const matched = normalizedOptionsSource.find((opt) => String(opt.optionId).toUpperCase() === id);
        return {
            optionId: id,
            optionText: matched?.optionText || ''
        };
    });

    const explicitCorrectOption = optionsFromArray.find((opt) => opt.isCorrect)?.optionId;

    return {
        localId: `${Date.now()}-${index}`,
        questionText: question?.questionText || '',
        questionType: question?.questionType || 'multiple_choice',
        correctOptionId: explicitCorrectOption || 'A',
        options: normalizedOptions,
        order: index + 1
    };
}

async function openEditDialog(row) {
    editQuizId.value = row.quizId;
    formError.value = '';

    try {
        busy.value = true;
        const detail = await getQuizDetail(row.quizId);
        const questions = Array.isArray(detail?.questions) && detail.questions.length ? detail.questions : [];

        form.value = {
            quizName: detail?.quizName || row.quizName || '',
            duration: Number(detail?.duration ?? row.duration ?? 30),
            passingScore: Number(detail?.passingScore ?? row.passingScore ?? 5),
            maxScore: Number(detail?.maxScore ?? row.maxScore ?? 10),
            questions: questions.length ? questions.map((question, index) => mapQuestionForForm(question, index)) : [createDefaultQuestion(1)]
        };
        quizDialog.value = true;
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc chi tiet quiz de chinh sua.');
    } finally {
        busy.value = false;
    }
}

function buildQuizPayload() {
    const normalizedQuestions = form.value.questions.map((question) => ({
        questionText: question.questionText.trim(),
        questionType: question.questionType || 'multiple_choice',
        options: question.options.map((option) => ({
            optionId: option.optionId,
            optionText: option.optionText.trim(),
            isCorrect: option.optionId === question.correctOptionId
        }))
    }));

    return {
        classId: route.params.classId,
        quizName: form.value.quizName.trim(),
        duration: Number(form.value.duration),
        passingScore: Number(form.value.passingScore),
        maxScore: Number(form.value.maxScore),
        questions: normalizedQuestions
    };
}

function addQuestion() {
    form.value.questions.push(createDefaultQuestion(form.value.questions.length + 1));
}

function removeQuestion(index) {
    if (form.value.questions.length === 1) {
        return;
    }
    form.value.questions.splice(index, 1);
}

function validateForm() {
    if (!form.value.quizName?.trim()) {
        return 'Vui long nhap ten quiz.';
    }

    if (!Number.isFinite(Number(form.value.duration)) || Number(form.value.duration) <= 0) {
        return 'Duration phai la so lon hon 0.';
    }

    if (!Number.isFinite(Number(form.value.passingScore)) || Number(form.value.passingScore) < 0) {
        return 'Passing score khong hop le.';
    }

    if (!Number.isFinite(Number(form.value.maxScore)) || Number(form.value.maxScore) <= 0) {
        return 'Max score phai la so lon hon 0.';
    }

    if (!Array.isArray(form.value.questions) || form.value.questions.length === 0) {
        return 'Quiz phai co it nhat 1 cau hoi.';
    }

    for (let i = 0; i < form.value.questions.length; i += 1) {
        const question = form.value.questions[i];
        const questionNo = i + 1;

        if (!question.questionText?.trim()) {
            return `Cau hoi ${questionNo} chua co noi dung.`;
        }

        if (!question.correctOptionId) {
            return `Cau hoi ${questionNo} chua chon dap an dung.`;
        }

        for (const option of question.options) {
            if (!option.optionText?.trim()) {
                return `Cau hoi ${questionNo} co dap an trong.`;
            }
        }
    }

    return '';
}

async function onSaveQuiz() {
    formError.value = '';
    const validationMessage = validateForm();
    if (validationMessage) {
        formError.value = validationMessage;
        return;
    }

    try {
        busy.value = true;
        if (editQuizId.value) {
            await updateQuiz(editQuizId.value, buildQuizPayload());
            successMessage.value = 'Cap nhat quiz thanh cong.';
        } else {
            await createQuiz(buildQuizPayload());
            successMessage.value = 'Tao quiz thanh cong.';
        }
        quizDialog.value = false;
        await loadQuizzes();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Luu quiz that bai.');
    } finally {
        busy.value = false;
    }
}

async function onDeleteQuiz(row) {
    if (row?.status === 'closed') {
        errorMessage.value = 'Quiz da dong khong the xoa them.';
        return;
    }

    if (!window.confirm(`Xoa quiz ${row.quizName}?`)) {
        return;
    }

    try {
        busy.value = true;
        await deleteQuiz(row.quizId);
        successMessage.value = 'Xoa quiz thanh cong.';
        await loadQuizzes();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Xoa quiz that bai.');
    } finally {
        busy.value = false;
    }
}
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold m-0">Quiz Management</h2>
            <Button label="Create Quiz" icon="pi pi-plus" @click="openCreateDialog" />
        </div>

        <Message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</Message>
        <Message v-if="successMessage" severity="success" class="mb-3">{{ successMessage }}</Message>

        <DataTable :value="quizzes" :loading="loading" responsiveLayout="scroll">
            <Column field="quizName" header="Quiz"></Column>
            <Column field="duration" header="Duration"></Column>
            <Column field="passingScore" header="Pass Score"></Column>
            <Column field="maxScore" header="Max Score"></Column>
            <Column field="status" header="Status"></Column>
            <Column header="Actions">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button label="Edit" size="small" text :disabled="slotProps.data.status === 'closed'" @click="openEditDialog(slotProps.data)" />
                        <Button
                            label="Delete"
                            size="small"
                            text
                            severity="danger"
                            :disabled="slotProps.data.status === 'closed'"
                            :loading="busy"
                            @click="onDeleteQuiz(slotProps.data)"
                        />
                        <Button label="Submissions" size="small" as="router-link" :to="`/teacher/quizzes/${slotProps.data.quizId}/submissions`" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="quizDialog" modal :header="editQuizId ? 'Edit Quiz' : 'Create Quiz'" :style="{ width: '56rem' }">
            <Message v-if="formError" severity="warn" class="mb-3">{{ formError }}</Message>

            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-12">
                    <label class="block mb-2">Quiz Name</label>
                    <InputText v-model="form.quizName" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">Duration (minutes)</label>
                    <InputText v-model="form.duration" type="number" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">Passing Score</label>
                    <InputText v-model="form.passingScore" type="number" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">Max Score</label>
                    <InputText v-model="form.maxScore" type="number" class="w-full" />
                </div>

                <div class="col-span-12 flex justify-between items-center mt-2">
                    <h4 class="m-0 font-semibold">Questions</h4>
                    <Button label="Add Question" icon="pi pi-plus" size="small" text @click="addQuestion" />
                </div>

                <div class="col-span-12" v-for="(question, questionIndex) in form.questions" :key="question.localId">
                    <div class="border border-round surface-border p-3">
                        <div class="flex justify-between items-center mb-3">
                            <strong>Question {{ questionIndex + 1 }}</strong>
                            <Button
                                label="Remove"
                                size="small"
                                text
                                severity="danger"
                                :disabled="form.questions.length === 1"
                                @click="removeQuestion(questionIndex)"
                            />
                        </div>

                        <div class="mb-3">
                            <label class="block mb-2">Question Text</label>
                            <Textarea v-model="question.questionText" rows="2" class="w-full" />
                        </div>

                        <div class="grid grid-cols-12 gap-3">
                            <div class="col-span-12 md:col-span-6" v-for="option in question.options" :key="`${question.localId}-${option.optionId}`">
                                <label class="block mb-2">Option {{ option.optionId }}</label>
                                <InputText v-model="option.optionText" class="w-full" />
                            </div>
                        </div>

                        <div class="mt-3">
                            <label class="block mb-2">Correct Option</label>
                            <div class="flex gap-4 flex-wrap">
                                <div v-for="option in question.options" :key="`${question.localId}-correct-${option.optionId}`" class="flex items-center gap-2">
                                    <RadioButton v-model="question.correctOptionId" :inputId="`${question.localId}-correct-${option.optionId}`" :value="option.optionId" />
                                    <label :for="`${question.localId}-correct-${option.optionId}`">{{ option.optionId }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" text @click="quizDialog = false" />
                <Button label="Save" :loading="busy" @click="onSaveQuiz" />
            </template>
        </Dialog>
    </div>
</template>
