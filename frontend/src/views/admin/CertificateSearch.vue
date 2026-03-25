<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { searchCertificates } from '@/service/adminApi';
import { onMounted, ref } from 'vue';

const keyword = ref('');
const status = ref('');
const loading = ref(false);
const items = ref([]);
const errorMessage = ref('');
const pagination = ref(null);

const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Issued', value: 'issued' },
    { label: 'Revoked', value: 'revoked' }
];

async function runSearch() {
    try {
        loading.value = true;
        errorMessage.value = '';
        const result = await searchCertificates({
            q: keyword.value.trim(),
            status: status.value,
            limit: 50
        });
        items.value = result?.items || [];
        pagination.value = result?.pagination || null;
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tim kiem duoc chung chi.');
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    runSearch();
});
</script>

<template>
    <div class="card">
        <h2 class="text-2xl font-semibold mb-3">Certificate Search</h2>
        <div class="grid grid-cols-12 gap-3 mb-4">
            <div class="col-span-12 md:col-span-7">
                <InputText v-model="keyword" class="w-full" placeholder="Search by cert id, student, course" />
            </div>
            <div class="col-span-12 md:col-span-3">
                <Select v-model="status" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="col-span-12 md:col-span-2">
                <Button label="Search" class="w-full" @click="runSearch" :loading="loading" />
            </div>
        </div>

        <Message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</Message>

        <DataTable :value="items" responsiveLayout="scroll" :loading="loading">
            <Column field="certificateId" header="Certificate"></Column>
            <Column field="studentName" header="Student"></Column>
            <Column field="className" header="Class"></Column>
            <Column field="courseCode" header="Course"></Column>
            <Column field="issuedAt" header="Issued At"></Column>
            <Column header="Status">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'issued' ? 'success' : slotProps.data.status === 'revoked' ? 'danger' : 'warn'" />
                </template>
            </Column>
            <Column header="Action">
                <template #body="slotProps">
                    <Button label="Detail" size="small" as="router-link" :to="`/admin/certificates/${slotProps.data.certificateId}`" />
                </template>
            </Column>
        </DataTable>

        <div class="text-sm text-color-secondary mt-3" v-if="pagination">
            Page {{ pagination.page }} / {{ pagination.totalPages }} - Total {{ pagination.total }} items
        </div>
    </div>
</template>
