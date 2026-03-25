<script setup>
import { resolveSessionUser } from '@/mock/auth';
import { getApiErrorMessage } from '@/service/apiClient';
import { createClass, getPublicCourses, getTeacherClasses } from '@/service/teacherApi';
import { onMounted, ref } from 'vue';

const loading = ref(true);
const classes = ref([]);
const createDialog = ref(false);
const creating = ref(false);
const createSuccess = ref('');
const errorMessage = ref('');
const formError = ref('');
const courses = ref([]);
const form = ref({
    classCode: '',
    courseId: '',
    startDate: '',
    endDate: '',
    description: ''
});

function getClassStatusSeverity(status) {
    if (status === 'active') {
        return 'success';
    }
    if (status === 'completed') {
        return 'info';
    }
    if (status === 'canceled') {
        return 'danger';
    }
    return 'secondary';
}

async function loadClasses() {
    try {
        const user = resolveSessionUser();
        if (!user?.userId) {
            throw new Error('Khong tim thay teacher session. Vui long dang nhap lai.');
        }

        classes.value = await getTeacherClasses(user.userId);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc danh sach lop.');
    } finally {
        loading.value = false;
    }
}

async function loadCourses() {
    try {
        courses.value = await getPublicCourses();
    } catch (_error) {
        courses.value = [];
    }
}

onMounted(async () => {
    await Promise.all([loadClasses(), loadCourses()]);
});

function openCreateClassDialog() {
    formError.value = '';
    createDialog.value = true;
}

function validateCreateClassForm() {
    if (!form.value.classCode?.trim()) {
        return 'Class code khong duoc de trong.';
    }
    if (!form.value.courseId) {
        return 'Vui long chon course hop le.';
    }
    if (!form.value.startDate || !form.value.endDate) {
        return 'Vui long chon day du ngay bat dau va ket thuc.';
    }
    if (new Date(form.value.endDate) < new Date(form.value.startDate)) {
        return 'Ngay ket thuc phai lon hon hoac bang ngay bat dau.';
    }
    return '';
}

async function onCreateClass() {
    formError.value = '';
    const validationMessage = validateCreateClassForm();
    if (validationMessage) {
        formError.value = validationMessage;
        return;
    }

    try {
        const user = resolveSessionUser();
        if (!user?.userId) {
            throw new Error('Khong tim thay teacher session. Vui long dang nhap lai.');
        }

        creating.value = true;
        errorMessage.value = '';
        await createClass({
            classCode: form.value.classCode.trim(),
            courseId: form.value.courseId,
            teacherId: user.userId,
            startDate: form.value.startDate,
            endDate: form.value.endDate,
            description: form.value.description
        });

        await loadClasses();
        createDialog.value = false;
        createSuccess.value = 'Tao class thanh cong.';
        form.value = {
            classCode: '',
            courseId: '',
            startDate: '',
            endDate: '',
            description: ''
        };
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Tao class that bai.');
    } finally {
        creating.value = false;
    };
}
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-3">
            <h2 class="text-2xl font-semibold m-0">Teacher Classes</h2>
            <Button label="Create Class" icon="pi pi-plus" @click="openCreateClassDialog" />
        </div>
        <p class="text-color-secondary mb-4">Quan ly danh sach lop, truy cap nhanh sang hoc vien va quiz.</p>
        <Message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</Message>
        <Message v-if="createSuccess" severity="success" class="mb-4">{{ createSuccess }}</Message>

        <DataTable :value="classes" :loading="loading" responsiveLayout="scroll">
            <Column field="classCode" header="Class Code"></Column>
            <Column field="courseName" header="Course"></Column>
            <Column field="teacherName" header="Teacher"></Column>
            <Column field="studentCount" header="Students"></Column>
            <Column field="quizCount" header="Quizzes"></Column>
            <Column field="startDate" header="Start"></Column>
            <Column field="endDate" header="End"></Column>
            <Column header="Status">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getClassStatusSeverity(slotProps.data.status)" />
                </template>
            </Column>
            <Column header="Action">
                <template #body="slotProps">
                    <Button size="small" label="Detail" as="router-link" :to="`/teacher/classes/${slotProps.data.classId}`" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="createDialog" modal header="Create Class" :style="{ width: '34rem' }">
            <Message v-if="formError" severity="warn" class="mb-3">{{ formError }}</Message>

            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">Class Code</label>
                    <InputText v-model="form.classCode" class="w-full" placeholder="SD18310" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">Course ID</label>
                    <Select
                        v-model="form.courseId"
                        :options="courses"
                        optionLabel="courseName"
                        optionValue="courseId"
                        class="w-full"
                        placeholder="Select course"
                    />
                    <small v-if="form.courseId" class="text-color-secondary">Selected: {{ form.courseId }}</small>
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">Start Date</label>
                    <InputText v-model="form.startDate" type="date" class="w-full" />
                </div>
                <div class="col-span-12 md:col-span-6">
                    <label class="block mb-2">End Date</label>
                    <InputText v-model="form.endDate" type="date" class="w-full" />
                </div>
                <div class="col-span-12">
                    <label class="block mb-2">Description</label>
                    <Textarea v-model="form.description" rows="3" class="w-full" placeholder="Mo ta lop hoc" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" severity="secondary" text @click="createDialog = false" />
                <Button label="Create" :loading="creating" @click="onCreateClass" />
            </template>
        </Dialog>
    </div>
</template>
