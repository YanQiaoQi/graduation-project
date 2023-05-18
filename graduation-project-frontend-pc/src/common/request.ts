import request from 'umi-request';
import { navigateTo } from './utils';

request.interceptors.request.use((url, options) => {
    // auth 不做处理
    if (
        /^.*\/v2\/user\/signup.*/.test(url) ||
        /^.*\/v2\/user\/login\/.*/.test(url) ||
        /^.*\/v2\/user\/captcha\/.*/.test(url)
    ) {
        return {
            url,
            options,
        };
    }

    // 非 auth 不传 token
    const token = localStorage.getItem(`token`);
    if (!token) {
        navigateTo('/auth/login');
        return {
            url,
            options,
        };
    }
    // 非 auth 传 token
    const jwt = `Bearer ${token}`;
    return {
        url,
        options: {
            ...options,
            headers: {
                Authorization: jwt,
            },
        },
    };
});

request.interceptors.response.use(async (res) => {
    try {
        const { status } = await res.clone().json();
        if (status === 401) {
            navigateTo('/auth/login');
        }
    } catch {}
    return res;
});

export default request;
