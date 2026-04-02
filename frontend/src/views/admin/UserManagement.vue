<script setup>
import { getApiErrorMessage } from '@/service/apiClient';
import { getAdminUsers, updateAdminUserRole, updateAdminUserStatus } from '@/service/adminApi';
import { onMounted, ref } from 'vue';

const users = ref([]);
const loading = ref(true);
const updating = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');
const pagination = ref(null);
const roleOptions = ['STUDENT', 'TEACHER', 'ADMIN'];
const roleFilterOptions = [
    { label: 'All Roles', value: '' },
    { label: 'STUDENT', value: 'STUDENT' },
    { label: 'TEACHER', value: 'TEACHER' },
    { label: 'ADMIN', value: 'ADMIN' }
];
const statusFilterOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
];

function isUserActive(user) {
    if (typeof user?.isActive === 'boolean') {
        return user.isActive;
    }
    return String(user?.status || '').toUpperCase() === 'ACTIVE';
}

async function loadUsers() {
    try {
        loading.value = true;
        errorMessage.value = '';
        const result = await getAdminUsers({
            role: selectedRole.value,
            status: selectedStatus.value,
            page: 1,
            limit: 50
        });

        const mappedUsers = result?.users || result?.items || [];
        users.value = Array.isArray(mappedUsers) ? mappedUsers : [];

        if (result?.pagination) {
            pagination.value = result.pagination;
        } else if (typeof result?.totalCount === 'number') {
            const pageSize = Number(result?.pageSize) || 50;
            const page = Number(result?.page) || 1;
            const total = Number(result.totalCount) || 0;
            pagination.value = {
                page,
                limit: pageSize,
                total,
                totalPages: Math.max(1, Math.ceil(total / pageSize))
            };
        } else {
            pagination.value = null;
        }
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Khong tai duoc danh sach user.');
    } finally {
        loading.value = false;
    }
}

async function toggleStatus(user) {
    try {
        updating.value = true;
        errorMessage.value = '';
        const active = isUserActive(user);
        await updateAdminUserStatus(user.userId, {
            isActive: !active,
            reason: active ? 'Disabled by admin' : 'Enabled by admin'
        });
        successMessage.value = 'Cap nhat trang thai user thanh cong.';
        await loadUsers();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Cap nhat trang thai user that bai.');
    } finally {
        updating.value = false;
    }
}

async function updateRole(user, role) {
    try {
        updating.value = true;
        errorMessage.value = '';
        await updateAdminUserRole(user.userId, { role });
        successMessage.value = 'Cap nhat role user thanh cong.';
        await loadUsers();
    } catch (error) {
        errorMessage.value = getApiErrorMessage(error, 'Cap nhat role user that bai.');
    } finally {
        updating.value = false;
    }
}

onMounted(() => {
    loadUsers();
});
</script>

<template>
    <div class="card">
        <h2 class="text-2xl font-semibold mb-3">User Management</h2>
        <div class="grid grid-cols-12 gap-3 mb-4">
            <div class="col-span-12 md:col-span-4">
                <Select v-model="selectedRole" :options="roleFilterOptions" optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="col-span-12 md:col-span-4">
                <Select v-model="selectedStatus" :options="statusFilterOptions" optionLabel="label" optionValue="value" class="w-full" />
            </div>
            <div class="col-span-12 md:col-span-4">
                <Button label="Apply Filter" class="w-full" @click="loadUsers" :loading="loading" />
            </div>
        </div>

        <Message v-if="errorMessage" severity="error" class="mb-3">{{ errorMessage }}</Message>
        <Message v-if="successMessage" severity="success" class="mb-3">{{ successMessage }}</Message>

        <DataTable :value="users" :loading="loading" responsiveLayout="scroll">
            <Column field="userCode" header="Code"></Column>
            <Column field="fullName" header="Name"></Column>
            <Column field="email" header="Email"></Column>
            <Column header="Role">
                <template #body="slotProps">
                    <Select :modelValue="slotProps.data.role" :options="roleOptions" @update:modelValue="(newRole) => updateRole(slotProps.data, newRole)" class="w-10rem" :disabled="updating" />
                </template>
            </Column>
            <Column header="Status">
                <template #body="slotProps">
                    <Tag :value="isUserActive(slotProps.data) ? 'Active' : 'Inactive'" :severity="isUserActive(slotProps.data) ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column field="createdAt" header="Created At"></Column>
            <Column field="lastLoginAt" header="Last Login"></Column>
            <Column header="Action">
                <template #body="slotProps">
                    <Button
                        :label="isUserActive(slotProps.data) ? 'Disable' : 'Enable'"
                        :severity="isUserActive(slotProps.data) ? 'danger' : 'success'"
                        text
                        :loading="updating"
                        @click="toggleStatus(slotProps.data)"
                    />
                </template>
            </Column>
        </DataTable>

        <div class="text-sm text-color-secondary mt-3" v-if="pagination">
            Page {{ pagination.page }} / {{ pagination.totalPages }} - Total {{ pagination.total }} users
        </div>
    </div>
</template>
