<script setup>
import { getSession } from '@/mock/auth';
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = computed(() => {
    const role = getSession()?.role;

    if (role === 'STUDENT') {
        return [
            {
                label: 'Student',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/student/dashboard' },
                    { label: 'My Certificates', icon: 'pi pi-fw pi-id-card', to: '/student/certificates' }
                ]
            }
        ];
    }

    if (role === 'TEACHER') {
        return [
            {
                label: 'Teacher',
                items: [{ label: 'Classes', icon: 'pi pi-fw pi-users', to: '/teacher/classes' }]
            }
        ];
    }

    if (role === 'ADMIN') {
        return [
            {
                label: 'Admin',
                items: [
                    { label: 'Certificate Overview', icon: 'pi pi-fw pi-chart-line', to: '/admin/certificates' },
                    { label: 'Certificate Search', icon: 'pi pi-fw pi-search', to: '/admin/certificates/search' },
                    { label: 'User Management', icon: 'pi pi-fw pi-users', to: '/admin/users' }
                ]
            }
        ];
    }

    return [
        {
            label: 'Authentication',
            items: [{ label: 'Login', icon: 'pi pi-fw pi-sign-in', to: '/auth/login' }]
        }
    ];
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
