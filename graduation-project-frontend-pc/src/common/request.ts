import request from 'umi-request';

request.interceptors.request.use((url, options) => {
    const token = `Bearer ${localStorage.getItem('token')}`;
    if (!token) {
        return {
            url,
            options: options,
        };
    }
    return {
        url,
        options: {
            ...options,
            headers: {
                Authorization: token,
            },
        },
    };
});

// request.use((ctx, next) => {
//     if()
//     ctx.req.options
// });

// request.interceptors.request.use(())

export default request;
