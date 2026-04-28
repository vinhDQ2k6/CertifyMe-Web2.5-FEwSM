<script setup>
import { ref, computed } from 'vue';
import { searchStudents, getStudentWithCertificates, verifyCertificate } from '@/service/publicCertificateApi';
import { useRouter } from 'vue-router';

const router = useRouter();

import { useRoute } from 'vue-router';
import { onMounted, watch } from 'vue';

const route = useRoute();
const searchQuery = ref(route.query.search || '');
const selectedStudentCode = ref('');
const isSearching = ref(false);
const isFetchingDetails = ref(false);
const isVerifying = ref(null);
const errorMessage = ref('');
const successMessage = ref('');

const searchResults = ref([]);
const currentStudent = ref(null);
const studentCertificates = ref([]);
const verificationResults = ref({});

const currentTab = ref('search'); // 'search' or 'details'

onMounted(async () => {
    if (route.query.search && route.query.search.trim()) {
        await handleSearch();
    }
});

async function handleSearch() {
    if (!searchQuery.value.trim()) {
        errorMessage.value = 'Vui lòng nhập mã học sinh hoặc tên để tìm kiếm';
        return;
    }

    isSearching.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    try {
        const response = await searchStudents(searchQuery.value, 1, 20);
        searchResults.value = response.items || [];
        
        if (searchResults.value.length === 0) {
            errorMessage.value = 'Không tìm thấy học sinh phù hợp';
        } else {
            successMessage.value = `Tìm thấy ${searchResults.value.length} kết quả`;
        }
    } catch (error) {
        errorMessage.value = error.message || 'Lỗi khi tìm kiếm học sinh';
    } finally {
        isSearching.value = false;
    }
}

async function selectStudent(student) {
    selectedStudentCode.value = student.studentCode;
    isFetchingDetails.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    try {
        const response = await getStudentWithCertificates(student.studentCode);
        currentStudent.value = response.student;
        studentCertificates.value = response.certificates || [];
        currentTab.value = 'details';

        if (studentCertificates.value.length === 0) {
            successMessage.value = 'Học sinh này chưa có chứng chỉ nào';
        } else {
            successMessage.value = `Tìm thấy ${studentCertificates.value.length} chứng chỉ`;
        }
    } catch (error) {
        errorMessage.value = error.message || 'Lỗi khi lấy thông tin học sinh';
        currentTab.value = 'search';
    } finally {
        isFetchingDetails.value = false;
    }
}

async function verifyCert(certificate) {
    const certId = certificate.certificateId;
    isVerifying.value = certId;
    errorMessage.value = '';

    try {
        const result = await verifyCertificate(certId);
        verificationResults.value[certId] = result;
        successMessage.value = `Xác minh chứng chỉ ${certificate.courseCode} thành công`;
    } catch (error) {
        errorMessage.value = error.message || 'Lỗi khi xác minh chứng chỉ';
    } finally {
        isVerifying.value = null;
    }
}

function goBack() {
    currentTab.value = 'search';
    selectedStudentCode.value = '';
    currentStudent.value = null;
    studentCertificates.value = [];
    verificationResults.value = {};
}

function getVerificationStatusBadge(status) {
    const statusMap = {
        'confirmed': { label: 'Xác minh thành công', severity: 'success' },
        'revoked': { label: 'Bị thu hồi', severity: 'warning' },
        'mismatch': { label: 'Không khớp', severity: 'danger' }
    };
    return statusMap[status] || { label: 'Không xác định', severity: 'info' };
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
</script>

<template>
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950 py-8 px-4">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-0 mb-2">
                    Xác Minh Chứng Chỉ
                </h1>
                <p class="text-muted-color">Tìm kiếm và xác minh chứng chỉ học sinh trên blockchain</p>
            </div>

            <!-- Messages -->
            <div v-if="errorMessage" class="mb-4">
                <Message severity="error">{{ errorMessage }}</Message>
            </div>
            <div v-if="successMessage" class="mb-4">
                <Message severity="success">{{ successMessage }}</Message>
            </div>

            <!-- Search Tab -->
            <div v-if="currentTab === 'search'" class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow-md p-8">
                <div class="mb-6">
                    <label for="search" class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
                        Tìm kiếm học sinh
                    </label>
                    <div class="flex gap-2">
                        <InputGroup class="flex-1">
                            <InputText
                                id="search"
                                v-model="searchQuery"
                                placeholder="Nhập mã học sinh hoặc tên..."
                                @keyup.enter="handleSearch"
                                class="w-full"
                            />
                        </InputGroup>
                        <Button
                            icon="pi pi-search"
                            label="Tìm kiếm"
                            @click="handleSearch"
                            :loading="isSearching"
                        />
                    </div>
                </div>

                <!-- Search Results -->
                <div v-if="searchResults.length > 0" class="mt-6">
                    <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">
                        Kết quả tìm kiếm
                    </h3>
                    <div class="grid gap-3">
                        <div
                            v-for="student in searchResults"
                            :key="student.studentId"
                            class="p-4 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                            @click="selectStudent(student)"
                        >
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-semibold text-surface-900 dark:text-surface-0">
                                        {{ student.studentName }}
                                    </p>
                                    <p class="text-sm text-muted-color">
                                        Mã học sinh: {{ student.studentCode }}
                                    </p>
                                </div>
                                <i class="pi pi-chevron-right text-muted-color"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Details Tab -->
            <div v-if="currentTab === 'details' && currentStudent" class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow-md p-8">
                <!-- Student Info -->
                <div class="mb-8 pb-6 border-b border-surface-200 dark:border-surface-700">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
                                {{ currentStudent.studentName }}
                            </h2>
                            <p class="text-muted-color">
                                Mã học sinh: {{ currentStudent.studentCode }}
                            </p>
                        </div>
                        <Button
                            icon="pi pi-arrow-left"
                            label="Quay lại"
                            severity="secondary"
                            @click="goBack"
                            :loading="isFetchingDetails"
                        />
                    </div>
                </div>

                <!-- Certificates List -->
                <div v-if="studentCertificates.length > 0">
                    <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-4">
                        Chứng chỉ ({{ studentCertificates.length }})
                    </h3>
                    <div class="grid gap-4">
                        <div
                            v-for="cert in studentCertificates"
                            :key="cert.certificateId"
                            class="border border-surface-200 dark:border-surface-700 rounded-lg p-4"
                        >
                            <div class="mb-4">
                                <div class="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 class="text-lg font-semibold text-surface-900 dark:text-surface-0">
                                            {{ cert.courseName }}
                                        </h4>
                                        <p class="text-sm text-muted-color">
                                            Mã khóa học: {{ cert.courseCode }}
                                        </p>
                                    </div>
                                    <Tag
                                        v-if="verificationResults[cert.certificateId]"
                                        :value="getVerificationStatusBadge(verificationResults[cert.certificateId].verificationStatus).label"
                                        :severity="getVerificationStatusBadge(verificationResults[cert.certificateId].verificationStatus).severity"
                                    />
                                </div>

                                <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                        <span class="text-muted-color">Lớp:</span>
                                        <p class="font-medium text-surface-900 dark:text-surface-0">{{ cert.classCode }}</p>
                                    </div>
                                    <div>
                                        <span class="text-muted-color">Ngày cấp:</span>
                                        <p class="font-medium text-surface-900 dark:text-surface-0">{{ formatDate(cert.issuedAt) }}</p>
                                    </div>
                                </div>

                                <div class="text-xs text-muted-color mb-3">
                                    <p>ID: {{ cert.certificateId }}</p>
                                </div>
                            </div>

                            <!-- Verification Details -->
                            <div v-if="verificationResults[cert.certificateId]" class="mb-4 p-3 bg-surface-50 dark:bg-surface-800 rounded-md text-sm">
                                <div class="mb-2">
                                    <span class="text-muted-color">Xác minh Hash:</span>
                                    <p class="font-mono text-xs break-all text-surface-700 dark:text-surface-200">
                                        {{ verificationResults[cert.certificateId].verificationHash }}
                                    </p>
                                </div>
                                <div class="mb-2" v-if="verificationResults[cert.certificateId].blockchainInfo">
                                    <span class="text-muted-color">Mạng blockchain:</span>
                                    <p class="text-surface-900 dark:text-surface-0">
                                        {{ verificationResults[cert.certificateId].blockchainInfo.networkName }}
                                    </p>
                                </div>
                                <div v-if="verificationResults[cert.certificateId].blockchainInfo?.explorerUrl">
                                    <a
                                        :href="verificationResults[cert.certificateId].blockchainInfo.explorerUrl"
                                        target="_blank"
                                        class="text-primary hover:text-primary-600 text-xs"
                                    >
                                        Xem trên Blockchain Explorer
                                        <i class="pi pi-external-link ml-1"></i>
                                    </a>
                                </div>
                            </div>

                            <!-- Verify Button -->
                            <Button
                                v-if="!verificationResults[cert.certificateId]"
                                icon="pi pi-check"
                                label="Xác minh chứng chỉ"
                                @click="verifyCert(cert)"
                                :loading="isVerifying === cert.certificateId"
                                class="w-full"
                            />
                            <Button
                                v-else
                                icon="pi pi-check-circle"
                                label="Đã xác minh"
                                severity="success"
                                class="w-full"
                                disabled
                            />
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-muted-color">
                    <p>Học sinh này chưa có chứng chỉ nào</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
