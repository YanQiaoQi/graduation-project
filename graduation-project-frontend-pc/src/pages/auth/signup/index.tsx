import Container from '@/components/Container';
import { Form } from 'antd';
import { useCallback } from 'react';
import AuthLayout from '../components/authLayout';
import FormItem from '../components/FormItem/index';

// 登录
function SignupPage() {
    const onFinish = useCallback((values) => {
        console.log(values);
    }, []);

    return (
        <AuthLayout title="欢迎注册" footerLeft="login">
            <Form onFinish={onFinish} style={{ width: '100%' }}>
                <FormItem.Email />
                <FormItem.Password confirm />
                <FormItem.Captcha />
                <FormItem.Submit>注册</FormItem.Submit>
            </Form>
        </AuthLayout>
    );
}

export default SignupPage;
