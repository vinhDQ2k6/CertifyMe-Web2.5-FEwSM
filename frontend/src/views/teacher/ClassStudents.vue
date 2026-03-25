<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { createEnrollment, deleteEnrollment, getClassStudents } from '@/service/teacherApi';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const students = ref([]);
const loading = ref(true);
const selectedStatus = ref('');
const sortBy = ref('enrolledAt');
const orderBy = ref('desc');
const enrollStudentId = ref('');
const removeEnrollmentId = ref('');
const busy = ref(false);
const removeBusy = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const normalizedEnrollStudentId = computed(() => (enrollStudentId.value || '').trim().toLowerCase());
const existingStudentIdSet = computed(() => {
    const set = new Set();
    for (const student of students.value || []) {
        if (student?.studentId) {
            set.add(String(student.studentId).trim().toLowerCase());
        }
    }
    return set;
});
const isDuplicateEnrollment = computed(() => {
    if (!normalizedEnrollStudentId.value) {
        return false;
    }
    return existingStudentIdSet.value.has(normalizedEnrollStudentId.value);
});

async function loadStudents() {
    try {
        errorMessage.value = '';
        students.value = await getClassStudents(route.params.classId, {
            status: selectedStatus.value,
            sort: sortBy.value,
            order: orderBy.value
        });
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc danh sach hoc vien.');
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    await loadStudents();
});

async function onAddEnrollment() {
    const studentId = (enrollStudentId.value || '').trim();
    if (!studentId) {
        return;
    }

    if (isDuplicateEnrollment.value) {
        errorMessage.value = 'Student nay da ton tai trong danh sach lop.';
        return;
    }

    try {
        busy.value = true;
        errorMessage.value = '';
        successMessage.value = '';
        await createEnrollment({
            studentId,
            classId: route.params.classId
        });
        successMessage.value = 'Them enrollment thanh cong.';
        enrollStudentId.value = '';
        await loadStudents();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Them enrollment that bai.');
    } finally {
        busy.value = false;
    }
}

async function onRemoveEnrollment(enrollmentId) {
    const parsedEnrollmentId = Number(enrollmentId);
    if (!Number.isInteger(parsedEnrollmentId) || parsedEnrollmentId <= 0) {
        errorMessage.value = 'Enrollment ID khong hop le de xoa.';
        return;
    }

    try {
        removeBusy.value = true;
        errorMessage.value = '';
        successMessage.value = '';
        await deleteEnrollment(parsedEnrollmentId);
        successMessage.value = 'Xoa enrollment thanh cong.';
        removeEnrollmentId.value = '';
        await loadStudents();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Xoa enrollment that bai.');
    } finally {
        removeBusy.value = false;
    }
}

const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Learning', value: 'learning' },
    { label: 'Passed', value: 'passed' },
    { label: 'Failed', value: 'failed' },
    { label: 'Dropped', value: 'dropped' }
];

const sortOptions = [
    { label: 'Enrolled At', value: 'enrolledAt' },
    { label: 'Average Score', value: 'averageScore' },
    { label: 'Full Name', value: 'fullName' }
];

const orderOptions = [
    { label: 'Desc', value: 'desc' },
    { label: 'Asc', value: 'asc' }
];

function getEnrollmentStatusSeverity(status) {
    if (status === 'passed') {
        return 'success';
    }
    if (status === 'learning') {
        return 'info';
    }
    if (status === 'failed') {
        return 'warn';
    }
    if (status === 'dropped') {
        return 'danger';
    }
    return 'secondary';
}
</script>

<template>
    <div class="card">
        <div class="flex flex-wrap gap-2 justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold m-0">Class Students</h2>
            <div class="flex gap-2 flex-wrap">
                <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Filter status" class="w-12rem" />
                <Select v-model="sortBy" :options="sortOptions" optionLabel="label" optionValue="value" class="w-12rem" />
                <Select v-model="orderBy" :options="orderOptions" optionLabel="label" optionValue="value" class="w-9rem" />
                <Button label="Apply" size="small" @click="loadStudents" />
            </div>
        </div>

        <Message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</Message>
        <Message v-if="successMessage" severity="success" class="mb-3">{{ successMessage }}</Message>

        <DataTable :value="students" :loading="loading" responsiveLayout="scroll">
            <Column field="studentId" header="Student ID"></Column>
            <Column field="fullName" header="Student"></Column>
            <Column field="email" header="Email"></Column>
            <Column header="Progress">
                <template #body="slotProps">
                    {{ slotProps.data.completedQuizzes || 0 }}/{{ slotProps.data.totalQuizzes || 0 }}
                </template>
            </Column>
            <Column field="averageScore" header="Average Score"></Column>
            <Column header="Status">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="getEnrollmentStatusSeverity(slotProps.data.status)" />
                </template>
            </Column>
            <Column field="enrolledAt" header="Enrolled At"></Column>
            <Column header="Action">
                <template #body="slotProps">
                    <Button
                        v-if="slotProps.data.enrollmentId"
                        label="Remove"
                        severity="danger"
                        size="small"
                        :loading="removeBusy"
                        @click="onRemoveEnrollment(slotProps.data.enrollmentId)"
                    />
                    <span v-else class="text-color-secondary text-sm">N/A</span>
                </template>
            </Column>
        </DataTable>

        <div class="mt-4">
            <h4 class="font-semibold">Add Enrollment</h4>
            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-12 md:col-span-5">
                    <InputText v-model="enrollStudentId" class="w-full" placeholder="Student ID" />
                </div>
                <div class="col-span-12 md:col-span-5">
                    <InputText class="w-full" :value="route.params.classId" disabled />
                </div>
                <div class="col-span-12 md:col-span-2">
                    <Button label="Add" class="w-full" :loading="busy" :disabled="isDuplicateEnrollment" @click="onAddEnrollment" />
                </div>
            </div>
            <small v-if="isDuplicateEnrollment" class="text-orange-500">Student ID da co trong lop, khong the them lai.</small>
        </div>

        <div class="mt-4">
            <h4 class="font-semibold">Remove Enrollment by Enrollment ID</h4>
            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-12 md:col-span-10">
                    <InputText v-model="removeEnrollmentId" class="w-full" placeholder="Enrollment ID (so nguyen)" />
                </div>
                <div class="col-span-12 md:col-span-2">
                    <Button
                        label="Remove"
                        severity="danger"
                        class="w-full"
                        :loading="removeBusy"
                        @click="onRemoveEnrollment(removeEnrollmentId)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
