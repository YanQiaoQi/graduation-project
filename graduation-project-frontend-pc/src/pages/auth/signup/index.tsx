import { Form } from 'antd';
import { useCallback } from 'react';
import AuthLayout from '../components/authLayout';
import FormItem from '../../../components/FormItem/index';
import { MessageWrapper, navigateTo } from '@/common/utils';
import { signup } from '@/service/user';

// 注册
function SignupPage() {
    const onFinish = useCallback((values: any) => {
        MessageWrapper(signup(values))
            .then(({ token }) => {
                localStorage.setItem(`token`, token!);
                navigateTo('/auth/login');
            })
            .catch((e) => {
                console.log(`${e.message}`);
            });
    }, []);

    return (
        <AuthLayout title="欢迎注册" footerLeft="login">
            <Form onFinish={onFinish} style={{ width: '100%' }}>
                <FormItem.Input.Email />
                <FormItem.Input.Password confirm />
                <FormItem.Input.Captcha />
                <FormItem.Submit>注册</FormItem.Submit>
            </Form>
        </AuthLayout>
    );
}

export default SignupPage;
