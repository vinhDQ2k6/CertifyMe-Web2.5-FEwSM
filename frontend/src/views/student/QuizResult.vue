<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { getQuizResult } from '@/service/studentApi';
import { computed } from 'vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const result = ref(null);
const errorMessage = ref('');

const normalizedStatus = computed(() => String(result.value?.status || '').trim().toLowerCase());
const isPassed = computed(() => normalizedStatus.value === 'passed');

onMounted(async () => {
    try {
        result.value = await getQuizResult(route.params.quizId);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc ket qua quiz.');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="card" v-if="loading"><i class="pi pi-spin pi-spinner mr-2"></i> Dang tai ket qua...</div>

    <div class="card" v-else-if="errorMessage">
        <Message severity="error">{{ errorMessage }}</Message>
    </div>

    <div class="card" v-else-if="result">
        <h2 class="text-2xl font-semibold mb-3">Quiz Result</h2>
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
                <div class="p-4 border surface-border border-round">
                    <div class="text-color-secondary mb-1">Quiz</div>
                    <div class="font-semibold">{{ result.quizTitle }}</div>
                </div>
            </div>
            <div class="col-span-12 md:col-span-6">
                <div class="p-4 border surface-border border-round">
                    <div class="text-color-secondary mb-1">Status</div>
                    <Tag :value="result.status" :severity="isPassed ? 'success' : 'danger'" />
                </div>
            </div>
        </div>

        <div class="mt-4 text-lg">
            Score: <strong>{{ result.score }}/{{ result.maxScore }}</strong> (Passing: {{ result.passingScore }})
        </div>
        <div class="text-color-secondary mt-2">Submitted at: {{ result.submittedAt }}</div>

        <div class="mt-4 flex gap-2">
            <Button label="Retry Quiz" severity="contrast" as="router-link" :to="`/student/quiz/${route.params.quizId}`" />
            <Button label="Back to Dashboard" as="router-link" to="/student/dashboard" />
            <Button label="My Certificates" severity="secondary" as="router-link" to="/student/certificates" />
        </div>
    </div>

    <div class="card text-center text-color-secondary" v-else>Khong tim thay ket qua quiz.</div>
</template>
