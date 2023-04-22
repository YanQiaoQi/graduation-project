import { useCallback } from 'react';
import { Form, Tabs } from 'antd';
import AuthLayout from '../components/authLayout';
import FormItem from '../../../components/FormItem';
import { URL } from '@/common/constant';
import { onAuthFormFinish } from '@/common/utils';

function LoginPage() {
    const onSignup = useCallback(
        (url: string) =>
            onAuthFormFinish(url, '/console', ({ token }) => {
                console.log(token);

                localStorage.setItem('token', token!);
            }),
        [],
    );

    return (
        <AuthLayout title="欢迎登录" footerLeft="signup" footerRight="resetPwd">
            <Tabs>
                <Tabs.TabPane tab="密码登录" key="password">
                    <Form onFinish={onSignup(URL.AUTH.loginByPwd)}>
                        <FormItem.Input.Email />
                        <FormItem.Input.Password />
                        <FormItem.Submit>登录</FormItem.Submit>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="验证登录" key="captcha">
                    <Form onFinish={onSignup(URL.AUTH.loginByCaptcha)}>
                        <FormItem.Input.Email />
                        <FormItem.Input.Captcha />
                        <FormItem.Submit>登录</FormItem.Submit>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        </AuthLayout>
    );
}

export default LoginPage;
