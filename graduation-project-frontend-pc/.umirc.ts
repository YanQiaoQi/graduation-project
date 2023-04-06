import { defineConfig } from 'umi';

export default defineConfig({
    nodeModulesTransform: {
        type: 'none',
    },
    routes: [
        { path: '/auth/login', component: '@/pages/auth/login' },
        { path: '/auth/signup', component: '@/pages/auth/signup' },
        { path: '/auth/resetPwd', component: '@/pages/auth/resetPwd' },
    ],
    fastRefresh: {},
});
