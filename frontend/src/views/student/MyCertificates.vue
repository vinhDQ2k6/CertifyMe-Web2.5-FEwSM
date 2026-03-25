<script setup>
import { resolveSessionUser } from '@/mock/auth';
import { getApiErrorMessage } from '@/service/apiClient';
import { getStudentCertificates } from '@/service/studentApi';
import { onMounted, ref } from 'vue';

const loading = ref(true);
const certificates = ref([]);
const errorMessage = ref('');

onMounted(async () => {
    try {
        const user = resolveSessionUser();
        if (!user?.userId) {
            throw new Error('Khong tim thay student session. Vui long dang nhap lai.');
        }

        certificates.value = await getStudentCertificates(user.userId);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc danh sach chung chi.');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="card">
        <h2 class="text-2xl font-semibold mb-3">My Certificates</h2>
        <p class="text-color-secondary mb-4">Danh sach chung chi va thong tin verify.</p>

        <div v-if="loading" class="text-color-secondary"><i class="pi pi-spin pi-spinner mr-2"></i> Dang tai chung chi...</div>

        <Message v-else-if="errorMessage" severity="error">{{ errorMessage }}</Message>

        <div v-else-if="!certificates.length" class="card text-center text-color-secondary">Chua co chung chi nao.</div>

        <DataTable v-else :value="certificates" responsiveLayout="scroll">
            <Column field="certificateId" header="Certificate ID"></Column>
            <Column field="courseName" header="Course"></Column>
            <Column field="courseCode" header="Course Code"></Column>
            <Column field="issuedAt" header="Issued At"></Column>
            <Column header="Status">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'issued' ? 'success' : slotProps.data.status === 'revoked' ? 'danger' : 'warn'" />
                </template>
            </Column>
            <Column header="Blockchain">
                <template #body="slotProps">
                    <span v-if="slotProps.data.blockchainInfo">{{ slotProps.data.blockchainInfo.txHash }}</span>
                    <span v-else class="text-color-secondary">No on-chain data</span>
                </template>
            </Column>
            <Column header="Action">
                <template #body="slotProps">
                    <Button size="small" label="Detail" as="router-link" :to="`/student/certificates/${slotProps.data.certificateId}`" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
