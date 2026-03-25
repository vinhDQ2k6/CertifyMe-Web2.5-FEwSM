<script setup>
import { finalizeOAuthSession, getDefaultRouteByRole } from '@/mock/auth';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const errorMessage = ref('');

onMounted(() => {
    handleCallback();
});

async function handleCallback() {
    const error = route.query.error;
    const token = route.query.token;
    const role = route.query.role;
    const redirect = route.query.redirect;

    if (error) {
        errorMessage.value = 'Dang nhap that bai. Vui long thu lai.';
        return;
    }

    if (!token) {
        errorMessage.value = 'Thieu thong tin xac thuc callback.';
        return;
    }

    try {
        const session = await finalizeOAuthSession({
            token,
            roleHint: role,
            redirectHint: redirect
        });

        router.replace(getDefaultRouteByRole(session.role));
    } catch (_error) {
        errorMessage.value = 'Khong lay duoc thong tin nguoi dung tu /api/auth/me.';
        return;
    }
}
</script>

<template>
    <div class="card max-w-2xl mx-auto mt-10">
        <h3 class="text-xl font-semibold mb-3">OAuth Callback</h3>
        <div v-if="errorMessage" class="p-3 border-round bg-red-50 text-red-600">
            {{ errorMessage }}
        </div>
        <div v-else class="flex align-items-center gap-2 text-color-secondary">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Dang xac nhan dang nhap...</span>
        </div>
        <Button v-if="errorMessage" label="Quay ve Login" class="mt-4" as="router-link" to="/auth/login" />
    </div>
</template>
