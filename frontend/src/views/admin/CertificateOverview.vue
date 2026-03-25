<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { getCertificateStats, getRecentCertificates } from '@/service/adminApi';
import { onMounted, ref } from 'vue';

const loading = ref(true);
const stats = ref(null);
const recent = ref([]);
const errorMessage = ref('');

function getStatusSeverity(status) {
    if (status === 'issued') {
        return 'success';
    }
    if (status === 'revoked') {
        return 'danger';
    }
    return 'warn';
}

onMounted(async () => {
    try {
        const [statData, recentData] = await Promise.all([getCertificateStats(), getRecentCertificates({ limit: 10, page: 1 })]);
        stats.value = statData;
        recent.value = recentData?.items || [];
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc thong tin tong quan chung chi.');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12" v-if="loading">
            <div class="card text-color-secondary"><i class="pi pi-spin pi-spinner mr-2"></i> Dang tai dashboard cert...</div>
        </div>

        <div class="col-span-12" v-else-if="errorMessage">
            <Message severity="error">{{ errorMessage }}</Message>
        </div>

        <template v-else-if="stats">
            <div class="col-span-12 md:col-span-4">
                <div class="card">
                    <div class="text-color-secondary">Total Certificates</div>
                    <div class="text-4xl font-bold mt-2">{{ stats.totalCertificates }}</div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-4">
                <div class="card">
                    <div class="text-color-secondary">Issued</div>
                    <div class="text-4xl font-bold mt-2 text-green-500">{{ stats.issuedCertificates }}</div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-4">
                <div class="card">
                    <div class="text-color-secondary">Revoked</div>
                    <div class="text-4xl font-bold mt-2 text-red-500">{{ stats.revokedCertificates }}</div>
                </div>
            </div>

            <div class="col-span-12">
                <div class="card">
                    <div class="flex justify-between mb-3">
                        <h3 class="text-xl font-semibold m-0">Recent Certificates</h3>
                        <Button label="Search" as="router-link" to="/admin/certificates/search" />
                    </div>
                    <DataTable :value="recent" responsiveLayout="scroll">
                        <Column field="certificateId" header="Certificate"></Column>
                        <Column field="studentName" header="Student"></Column>
                        <Column field="className" header="Class"></Column>
                        <Column field="courseCode" header="Course"></Column>
                        <Column field="issuedAt" header="Issued At"></Column>
                        <Column header="Status">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
                            </template>
                        </Column>
                        <Column header="Action">
                            <template #body="slotProps">
                                <Button label="Detail" size="small" as="router-link" :to="`/admin/certificates/${slotProps.data.certificateId}`" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </template>

        <div class="col-span-12" v-else>
            <div class="card text-color-secondary text-center">Khong co du lieu tong quan.</div>
        </div>
    </div>
</template>
