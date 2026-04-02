<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { getClassDetail, updateClass } from '@/service/teacherApi';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const classDetail = ref(null);
const loading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const updateDialog = ref(false);
const updating = ref(false);
const formError = ref('');
const form = ref({
    classCode: '',
    startDate: '',
    endDate: ''
});

function getClassStatusSeverity(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active') {
        return 'success';
    }
    if (normalized === 'completed') {
        return 'info';
    }
    if (normalized === 'canceled') {
        return 'danger';
    }
    return 'secondary';
}

onMounted(async () => {
    try {
        classDetail.value = await getClassDetail(route.params.classId);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc thong tin lop.');
    } finally {
        loading.value = false;
    }
});

function openUpdateDialog() {
    if (!classDetail.value) {
        return;
    }

    formError.value = '';
    form.value = {
        classCode: classDetail.value.classCode || '',
        startDate: classDetail.value.startDate || '',
        endDate: classDetail.value.endDate || ''
    };
    updateDialog.value = true;
}

function validateUpdateForm() {
    if (!form.value.classCode?.trim()) {
        return 'Class code khong duoc de trong.';
    }
    if (!form.value.startDate || !form.value.endDate) {
        return 'Vui long chon day du ngay bat dau va ket thuc.';
    }
    if (new Date(form.value.endDate) < new Date(form.value.startDate)) {
        return 'Ngay ket thuc phai lon hon hoac bang ngay bat dau.';
    }
    return '';
}

async function onUpdateClass() {
    const validationMessage = validateUpdateForm();
    formError.value = validationMessage;
    if (validationMessage) {
        return;
    }

    try {
        updating.value = true;
        errorMessage.value = '';
        successMessage.value = '';

        await updateClass(route.params.classId, {
            classCode: form.value.classCode.trim(),
            startDate: form.value.startDate,
            endDate: form.value.endDate
        });

        classDetail.value = await getClassDetail(route.params.classId);
        successMessage.value = 'Cap nhat class thanh cong.';
        updateDialog.value = false;
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Cap nhat class that bai.');
    } finally {
        updating.value = false;
    }
}
</script>

<template>
    <div class="card" v-if="loading"><i class="pi pi-spin pi-spinner mr-2"></i> Dang tai thong tin lop...</div>

    <div class="card" v-else-if="errorMessage">
        <Message severity="error">{{ errorMessage }}</Message>
    </div>

    <div class="grid grid-cols-12 gap-6" v-else-if="classDetail">
        <div class="col-span-12 lg:col-span-8">
            <div class="card">
                <div class="text-sm text-color-secondary">{{ classDetail.classCode }}</div>
                <h2 class="text-2xl font-semibold mb-2">{{ classDetail.courseName }}</h2>
                <p class="text-color-secondary">{{ classDetail.description || 'Khong co mo ta lop hoc.' }}</p>
                <div class="mb-3">
                    <Tag :value="classDetail.status" :severity="getClassStatusSeverity(classDetail.status)" />
                </div>
                <Message v-if="successMessage" severity="success" class="mb-3">{{ successMessage }}</Message>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div><strong>Course ID:</strong> {{ classDetail.courseId }}</div>
                    <div><strong>Teacher:</strong> {{ classDetail.teacherName }}</div>
                    <div><strong>Start:</strong> {{ classDetail.startDate }}</div>
                    <div><strong>End:</strong> {{ classDetail.endDate }}</div>
                    <div><strong>Students:</strong> {{ classDetail.studentCount }}</div>
                    <div><strong>Quizzes:</strong> {{ classDetail.quizCount }}</div>
                </div>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-4">
            <div class="card">
                <h4 class="font-semibold mb-3">Class Actions</h4>
                <div class="flex flex-column gap-2">
                    <Button label="Update Class" icon="pi pi-pencil" severity="contrast" @click="openUpdateDialog" />
                    <Button label="Class Students" as="router-link" :to="`/teacher/classes/${classDetail.classId}/students`" />
                    <Button label="Quiz Management" severity="secondary" as="router-link" :to="`/teacher/classes/${classDetail.classId}/quizzes`" />
                </div>
            </div>
        </div>

        <Dialog v-model:visible="updateDialog" modal header="Update Class" :style="{ width: '34rem' }">
            <Message v-if="formError" severity="warn" class="mb-3">{{ formError }}</Message>
            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-12">
                    <label class="block mb-2">Class Code</label>
                    <InputText v-model="form.classCode" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">Start Date</label>
                    <InputText v-model="form.startDate" type="date" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">End Date</label>
                    <InputText v-model="form.endDate" type="date" class="w-full" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" severity="secondary" text @click="updateDialog = false" />
                <Button label="Save" :loading="updating" @click="onUpdateClass" />
            </template>
        </Dialog>
    </div>

    <div class="card text-center text-color-secondary" v-else>Khong tim thay lop hoc.</div>
</template>
