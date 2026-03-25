<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { getQuizSubmissions } from '@/service/teacherApi';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const submissions = ref([]);
const loading = ref(true);
const errorMessage = ref('');

onMounted(async () => {
    try {
        submissions.value = await getQuizSubmissions(route.params.quizId);
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc submissions.');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="card">
        <h2 class="text-2xl font-semibold mb-3">Quiz Submissions</h2>
        <Message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</Message>
        <DataTable :value="submissions" :loading="loading" responsiveLayout="scroll">
            <Column field="studentName" header="Student"></Column>
            <Column field="studentEmail" header="Email"></Column>
            <Column header="Score">
                <template #body="slotProps">
                    <span v-if="slotProps.data.score !== null && slotProps.data.score !== undefined">
                        {{ slotProps.data.score }}/{{ slotProps.data.maxScore ?? '-' }}
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column header="Result">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.passed ? 'PASSED' : 'FAILED'" :severity="slotProps.data.passed ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column field="submittedAt" header="Submitted At"></Column>
        </DataTable>
    </div>
</template>
