<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { createEnrollment, deleteEnrollment, getClassStudents, searchStudents } from '@/service/teacherApi';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const students = ref([]);
const loading = ref(true);
const selectedStatus = ref('');
const sortBy = ref('enrolledAt');
const orderBy = ref('desc');
const searchKeyword = ref('');
const searchedStudents = ref([]);
const selectedStudentId = ref('');
const searching = ref(false);
const busy = ref(false);
const removeBusy = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const normalizedSelectedStudentId = computed(() => (selectedStudentId.value || '').trim().toLowerCase());
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
    if (!normalizedSelectedStudentId.value) {
        return false;
    }
    return existingStudentIdSet.value.has(normalizedSelectedStudentId.value);
});

const studentSearchOptions = computed(() => {
    return (searchedStudents.value || []).map((student) => ({
        ...student,
        optionLabel: `${student.userCode || student.userId} - ${student.fullName || student.email || 'Unknown'}`
    }));
});

const selectedStudent = computed(() => {
    return (searchedStudents.value || []).find((student) => student.userId === selectedStudentId.value) || null;
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

async function onSearchStudents() {
    const keyword = (searchKeyword.value || '').trim();
    if (keyword.length < 2) {
        searchedStudents.value = [];
        selectedStudentId.value = '';
        errorMessage.value = 'Nhap it nhat 2 ky tu de tim hoc vien.';
        return;
    }

    try {
        searching.value = true;
        errorMessage.value = '';
        const result = await searchStudents(keyword);
        searchedStudents.value = Array.isArray(result) ? result : [];
        selectedStudentId.value = '';
        if (!searchedStudents.value.length) {
            successMessage.value = '';
            errorMessage.value = 'Khong tim thay hoc vien phu hop.';
        }
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Tim hoc vien that bai.');
    } finally {
        searching.value = false;
    }
}

async function onAddEnrollment() {
    const studentId = (selectedStudentId.value || '').trim();
    if (!studentId) {
        errorMessage.value = 'Vui long chon hoc vien tu ket qua tim kiem.';
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
        selectedStudentId.value = '';
        searchKeyword.value = '';
        searchedStudents.value = [];
        await loadStudents();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Them enrollment that bai.');
    } finally {
        busy.value = false;
    }
}

async function onRemoveEnrollment(enrollmentId) {
    if (!enrollmentId) {
        errorMessage.value = 'Thieu enrollmentId tu API. Khong the xoa tren dong nay.';
        return;
    }

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
        await loadStudents();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Xoa enrollment that bai.');
    } finally {
        removeBusy.value = false;
    }
}

const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Learning', value: 'LEARNING' },
    { label: 'Passed', value: 'PASSED' }
];

const sortOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Score', value: 'score' },
    { label: 'Date', value: 'date' }
];

const orderOptions = [
    { label: 'Desc', value: 'desc' },
    { label: 'Asc', value: 'asc' }
];

function getEnrollmentStatusSeverity(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'passed') {
        return 'success';
    }
    if (normalized === 'learning') {
        return 'info';
    }
    if (normalized === 'failed') {
        return 'warn';
    }
    if (normalized === 'dropped') {
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
                        label="Remove"
                        severity="danger"
                        size="small"
                        :disabled="!slotProps.data.enrollmentId"
                        :title="slotProps.data.enrollmentId ? 'Remove enrollment' : 'Missing enrollmentId from API'"
                        :loading="removeBusy"
                        @click="onRemoveEnrollment(slotProps.data.enrollmentId)"
                    />
                </template>
            </Column>
        </DataTable>

        <div class="mt-4">
            <h4 class="font-semibold">Add Enrollment</h4>
            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-12 md:col-span-4">
                    <InputText v-model="searchKeyword" class="w-full" placeholder="Search student by code, name, email" @keyup.enter="onSearchStudents" />
                </div>
                <div class="col-span-12 md:col-span-3">
                    <Button label="Search" class="w-full" :loading="searching" @click="onSearchStudents" />
                </div>
                <div class="col-span-12 md:col-span-3">
                    <Select
                        v-model="selectedStudentId"
                        class="w-full"
                        :options="studentSearchOptions"
                        optionLabel="optionLabel"
                        optionValue="userId"
                        placeholder="Select student"
                    />
                </div>
                <div class="col-span-12 md:col-span-2">
                    <InputText class="w-full" :value="route.params.classId" disabled />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-3 mt-2">
                <div class="col-span-12 md:col-span-3 md:col-start-10">
                    <Button label="Add" class="w-full" :loading="busy" :disabled="!selectedStudentId || isDuplicateEnrollment" @click="onAddEnrollment" />
                </div>
            </div>
            <small v-if="selectedStudent && !isDuplicateEnrollment" class="text-color-secondary">
                Selected: {{ selectedStudent.fullName }} ({{ selectedStudent.userCode || selectedStudent.userId }})
            </small>
            <small v-if="isDuplicateEnrollment" class="text-orange-500">Hoc vien da co trong lop, khong the them lai.</small>
        </div>
    </div>
</template>
