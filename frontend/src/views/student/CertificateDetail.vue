<script setup>
import { resolveSessionUser } from '@/mock/auth';
import { getApiErrorMessage } from '@/service/apiClient';
import { getStudentCertificates } from '@/service/studentApi';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const cert = ref(null);
const errorMessage = ref('');

onMounted(async () => {
    try {
        const user = resolveSessionUser();
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
                    <div class="col-span-12 md:col-span-6"><strong>Verification Hash:</strong> {{ cert.verificationHash || 'N/A' }}</div>
                </div>

                <Divider />
                <h4 class="font-semibold mb-2">Certificate Preview (Mockup)</h4>
                <div class="p-4 border-2 border-dashed surface-border border-round bg-surface-50 dark:bg-surface-900">
                    <div class="text-center">
                        <div class="text-xl font-semibold mb-2">Certificate of Completion</div>
                        <div class="text-color-secondary mb-3">This certifies that</div>
                        <div class="text-2xl font-bold mb-3">Nguyen Bao An</div>
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
                    <div class="mb-2"><strong>Tx Hash:</strong> {{ cert.blockchainInfo.txHash }}</div>
                    <div class="mb-2"><strong>Block:</strong> {{ cert.blockchainInfo.block }}</div>
                    <div><strong>Contract:</strong> {{ cert.blockchainInfo.contract }}</div>
                </div>
                <div v-else class="text-color-secondary">No blockchain data.</div>
            </div>

            <div class="mt-3">
                <Button label="Back to My Certificates" as="router-link" to="/student/certificates" severity="secondary" class="w-full" />
            </div>
        </div>
    </div>

    <div class="card text-center text-color-secondary" v-else>Khong tim thay certificate.</div>
</template>
