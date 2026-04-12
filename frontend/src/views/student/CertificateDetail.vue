<script setup>
import { resolveSessionUser } from '@/mock/auth';
import { getApiErrorMessage } from '@/service/apiClient';
import { getStudentCertificates } from '@/service/studentApi';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const cert = ref(null);
const errorMessage = ref('');
const detailDialogVisible = ref(false);
const detailTitle = ref('');
const detailValue = ref('');
const sessionUser = ref(null);

const previewStudentName = computed(() => {
    return sessionUser.value?.fullName || cert.value?.studentName || 'Student';
});

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

onMounted(async () => {
    try {
        const user = resolveSessionUser();
        sessionUser.value = user || null;
        if (!user?.userId) {
            throw new Error('Khong tim thay student session. Vui long dang nhap lai.');
        }

        const certificates = await getStudentCertificates(user.userId);
        cert.value = certificates.find((item) => item.certificateId === route.params.certificateId) || null;
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc chi tiet chung chi.');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="card" v-if="loading"><i class="pi pi-spin pi-spinner mr-2"></i> Dang tai certificate detail...</div>

    <div class="card" v-else-if="errorMessage">
        <Message severity="error">{{ errorMessage }}</Message>
    </div>

    <div class="grid grid-cols-12 gap-6" v-else-if="cert">
        <div class="col-span-12 lg:col-span-8">
            <div class="card">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-2xl font-semibold m-0">Certificate {{ cert.certificateId }}</h2>
                    <Tag :value="cert.status" :severity="cert.status === 'issued' ? 'success' : cert.status === 'revoked' ? 'danger' : 'warn'" />
                </div>

                <div class="grid grid-cols-12 gap-3 text-sm">
                    <div class="col-span-12 md:col-span-6"><strong>Course:</strong> {{ cert.courseName }}</div>
                    <div class="col-span-12 md:col-span-6"><strong>Course Code:</strong> {{ cert.courseCode }}</div>
                    <div class="col-span-12 md:col-span-6"><strong>Issued At:</strong> {{ cert.issuedAt || 'Not issued yet' }}</div>
                    <div class="col-span-12 md:col-span-6 flex items-center gap-2 min-w-0">
                        <strong>Verification Hash:</strong>
                        <span class="truncate">{{ shortenMiddle(cert.verificationHash || 'N/A') }}</span>
                        <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Verification Hash', cert.verificationHash || 'N/A')" />
                    </div>
                </div>

                <Divider />
                <h4 class="font-semibold mb-2">Certificate Preview (Mockup)</h4>
                <div class="p-4 border-2 border-dashed surface-border border-round bg-surface-50 dark:bg-surface-900">
                    <div class="text-center">
                        <div class="text-xl font-semibold mb-2">Certificate of Completion</div>
                        <div class="text-color-secondary mb-3">This certifies that</div>
                        <div class="text-2xl font-bold mb-3">{{ previewStudentName }}</div>
                        <div class="mb-2">has successfully completed</div>
                        <div class="text-xl font-semibold mb-4">{{ cert.courseName }}</div>
                        <div class="text-sm text-color-secondary">Certificate ID: {{ cert.certificateId }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-4">
            <div class="card">
                <h4 class="font-semibold mb-3">Blockchain Info</h4>
                <div v-if="cert.blockchainInfo" class="text-sm">
                    <div class="mb-2 flex items-center gap-2 min-w-0">
                        <strong>Tx Hash:</strong>
                        <span class="truncate">{{ shortenMiddle(cert.blockchainInfo.txHash) }}</span>
                        <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Transaction Hash', cert.blockchainInfo.txHash)" />
                    </div>
                    <div class="mb-2"><strong>Block:</strong> {{ cert.blockchainInfo.block }}</div>
                    <div class="flex items-center gap-2 min-w-0">
                        <strong>Contract:</strong>
                        <span class="truncate">{{ shortenMiddle(cert.blockchainInfo.contract) }}</span>
                        <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Contract Address', cert.blockchainInfo.contract)" />
                    </div>
                </div>
                <div v-else class="text-color-secondary">No blockchain data.</div>
            </div>

            <div class="mt-3">
                <Button label="Back to My Certificates" as="router-link" to="/student/certificates" severity="secondary" class="w-full" />
            </div>
        </div>

        <Dialog v-model:visible="detailDialogVisible" modal :header="detailTitle" :style="{ width: '70vw', maxWidth: '980px' }">
            <div class="text-sm break-all">{{ detailValue }}</div>
        </Dialog>
    </div>

    <div class="card text-center text-color-secondary" v-else>Khong tim thay certificate.</div>
</template>
