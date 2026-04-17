<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { resolveSessionUser } from '@/mock/auth';
import { getCertificateDetail, revokeCertificate, verifyCertificate } from '@/service/adminApi';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const cert = ref(null);
const loading = ref(true);
const busy = ref(false);
const verifyBusy = ref(false);
const errorMessage = ref('');
const actionMessage = ref('');
const revokeReason = ref('Academic integrity violation');
const verifyResult = ref(null);
const detailDialogVisible = ref(false);
const detailTitle = ref('');
const detailValue = ref('');

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

function displayOrNA(value) {
    if (value === null || value === undefined || String(value).trim() === '') {
        return 'N/A';
    }
    return String(value);
}

function getStatusSeverity(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'issued') {
        return 'success';
    }
    if (normalized === 'revoked') {
        return 'danger';
    }
    return 'warn';
}

async function loadCertificateDetail() {
    cert.value = await getCertificateDetail(route.params.certificateId);
}

onMounted(async () => {
    try {
        await loadCertificateDetail();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc chi tiet chung chi.');
    } finally {
        loading.value = false;
    }
});

async function onVerify() {
    try {
        verifyBusy.value = true;
        errorMessage.value = '';
        const result = await verifyCertificate(route.params.certificateId);
        verifyResult.value = result;
        actionMessage.value = result?.isValid ? 'Verify thanh cong: certificate hop le.' : 'Verify xong: certificate khong hop le.';
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Verify chung chi that bai.');
    } finally {
        verifyBusy.value = false;
    }
}

async function onRevoke() {
    if (!revokeReason.value?.trim()) {
        return;
    }

    const adminUserId = resolveSessionUser()?.userId;
    if (!adminUserId) {
        errorMessage.value = 'Khong tim thay admin session. Vui long dang nhap lai.';
        return;
    }

    try {
        busy.value = true;
        errorMessage.value = '';
        const result = await revokeCertificate(route.params.certificateId, {
            reason: revokeReason.value.trim(),
            revokedBy: adminUserId
        });
        const status = String(result?.status || '').toLowerCase();
        actionMessage.value = status === 'revoked' ? 'Revoke thanh cong.' : 'Da gui yeu cau revoke thanh cong.';
        await loadCertificateDetail();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Revoke chung chi that bai.');
    } finally {
        busy.value = false;
    }
}
</script>

<template>
    <div class="card" v-if="loading"><i class="pi pi-spin pi-spinner mr-2"></i> Dang tai chi tiet cert...</div>

    <div class="card" v-else-if="errorMessage">
        <Message severity="error">{{ errorMessage }}</Message>
    </div>

    <div class="grid grid-cols-12 gap-6" v-else-if="cert">
        <div class="col-span-12 lg:col-span-8">
            <div class="card">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-2xl font-semibold m-0">Certificate {{ cert.certificateId }}</h2>
                    <Tag :value="cert.status" :severity="getStatusSeverity(cert.status)" />
                </div>

                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-12 md:col-span-6"><strong>Student:</strong> {{ cert.studentName }}</div>
                    <div class="col-span-12 md:col-span-6"><strong>Student Code:</strong> {{ cert.studentCode || 'N/A' }}</div>
                    <div class="col-span-12 md:col-span-6"><strong>Class:</strong> {{ cert.className }}</div>
                    <div class="col-span-12 md:col-span-6"><strong>Course:</strong> {{ cert.courseCode }} - {{ cert.courseName }}</div>
                    <div class="col-span-12 md:col-span-6"><strong>Average Score:</strong> {{ cert.averageScore }}</div>
                </div>

                <Divider />
                <h4 class="font-semibold">Quiz Results</h4>
                <DataTable :value="cert.quizResults" responsiveLayout="scroll">
                    <Column field="quizName" header="Quiz"></Column>
                    <Column header="Score">
                        <template #body="slotProps"> {{ slotProps.data.score }}/{{ slotProps.data.maxScore }} </template>
                    </Column>
                    <Column field="completedAt" header="Completed At"></Column>
                </DataTable>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-4">
            <div class="card mb-4">
                <h4 class="font-semibold mb-3">Verify Certificate</h4>
                <Button label="Verify" severity="success" class="w-full" :loading="verifyBusy" @click="onVerify" />
                <div v-if="verifyResult" class="text-sm mt-3">
                    <div class="mb-1"><strong>Valid:</strong> {{ verifyResult.isValid ? 'Yes' : 'No' }}</div>
                    <div class="mb-1"><strong>Verified At:</strong> {{ verifyResult.blockchainVerificationDate || verifyResult.verifiedAt || '-' }}</div>
                    <div class="flex items-center gap-2 min-w-0">
                        <strong>Hash:</strong>
                        <span class="truncate">{{ shortenMiddle(verifyResult.verificationHash) }}</span>
                        <Button
                            icon="pi pi-eye"
                            size="small"
                            text
                            rounded
                            @click="openDetail('Verification Hash', verifyResult.verificationHash)"
                        />
                    </div>
                </div>
            </div>

            <div class="card">
                <h4 class="font-semibold mb-3">Revoke Certificate</h4>
                <Textarea v-model="revokeReason" rows="3" class="w-full mb-3" placeholder="Revoke reason" />
                <Button label="Revoke" severity="danger" class="w-full" :disabled="cert.status === 'revoked'" :loading="busy" @click="onRevoke" />
                <Message v-if="actionMessage" severity="info" class="mt-3">{{ actionMessage }}</Message>
            </div>

            <div class="card mt-4">
                <h4 class="font-semibold mb-3">Blockchain Info</h4>
                <div v-if="cert.blockchainInfo" class="text-sm">
                    <div class="mb-2 flex items-center gap-2 min-w-0">
                        <strong>Tx:</strong>
                        <span class="truncate">{{ shortenMiddle(cert.blockchainInfo.transactionHash) }}</span>
                        <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Transaction Hash', cert.blockchainInfo.transactionHash)" />
                    </div>
                    <div class="mb-2"><strong>Block:</strong> {{ displayOrNA(cert.blockchainInfo.blockNumber) }}</div>
                    <div class="mb-2 flex items-center gap-2 min-w-0">
                        <strong>Contract:</strong>
                        <span class="truncate">{{ shortenMiddle(cert.blockchainInfo.contractAddress) }}</span>
                        <Button icon="pi pi-eye" size="small" text rounded @click="openDetail('Contract Address', cert.blockchainInfo.contractAddress)" />
                    </div>
                    <div><strong>Network:</strong> {{ cert.blockchainInfo.networkName }}</div>
                </div>
                <div v-else class="text-color-secondary">No blockchain data.</div>
            </div>
        </div>

        <Dialog v-model:visible="detailDialogVisible" modal :header="detailTitle" :style="{ width: '70vw', maxWidth: '980px' }">
            <div class="text-sm break-all">{{ detailValue }}</div>
        </Dialog>
    </div>

    <div class="card text-center text-color-secondary" v-else>Khong tim thay certificate.</div>
</template>
