import { useCallback } from 'react';
import { Form, message, Tabs } from 'antd';
import AuthLayout from '../components/authLayout';
import FormItem from '../../../components/FormItem';
import { URL } from '@/common/constant';
import { MessageWrapper, navigateTo, showMessage } from '@/common/utils';
import request from '@/common/request';

function LoginPage() {
    const onSignup = useCallback(
        (url: string) => (values: any) => {
            MessageWrapper(request.post(url, { data: values }))
                .then(({ token }) => {
                    localStorage.setItem(`token`, token!);
                    navigateTo('/dashboard/personal/console');
                })
                .catch((e) => {
                    console.log(`${e.message}`);
                });
        },
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
