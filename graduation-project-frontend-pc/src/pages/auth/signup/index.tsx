import { Form } from 'antd';
import { useCallback } from 'react';
import AuthLayout from '../components/authLayout';
import FormItem from '../../../components/FormItem/index';
import { URL } from '@/common/constant';
import { onAuthFormFinish } from '@/common/utils';

// 注册
function SignupPage() {
    const onFinish = useCallback(
        onAuthFormFinish(URL.AUTH.signup, '/auth/login'),
        [],
    );

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
