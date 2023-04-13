import { defineConfig } from 'umi';

export default defineConfig({
    nodeModulesTransform: {
        type: 'none',
    },
    routes: [
        { path: '/auth/login', component: '@/pages/auth/login' },
        { path: '/auth/signup', component: '@/pages/auth/signup' },
        { path: '/auth/resetPwd', component: '@/pages/auth/resetPwd' },
        {
            path: '/',
            component: '@/pages/dashboard/index',
            routes: [
                {
                    exact: 'true',
                    path: '/dashboard',
                    redirect: '/dashboard/personal/console',
                },
                {
                    exact: 'true',
                    path: '/dashboard/personal',
                    redirect: '/dashboard/personal/console',
                },
                {
                    exact: 'true',
                    path: '/dashboard/certificates',
                    redirect: '/dashboard/certificates/guide',
                },
                {
                    path: '/dashboard/personal/console',
                    component: '@/pages/dashboard/personal/console',
                },
                {
                    path: '/dashboard/personal/info',
                    component: '@/pages/dashboard/personal/info',
                },
                {
                    path: '/dashboard/certificates/guide',
                    component: '@/pages/dashboard/certificates/guide',
                },
                {
                    path: '/dashboard/certificates/list',
                    component: '@/pages/dashboard/certificates/list',
                },
                {
                    path: '/dashboard/certificates/new',
                    component: '@/pages/dashboard/certificates/new',
                },
            ],
        },
    ],
    fastRefresh: {},
});
