import { useCallback } from 'react';
import { Form, Tabs } from 'antd';
import AuthLayout from '../components/authLayout';
import FormItem from '../components/FormItem';
import request from '../../../common/request';
import { AUTH_URL } from '@/constant/url';

function LoginPage() {
    const onPwdSignup = useCallback((values) => {
        request.post(AUTH_URL.loginByPwd, { data: values }).then((res) => {
            console.log(res);
        });
    }, []);

    const onCaptchaSignup = useCallback((values) => {
        request.post(AUTH_URL.loginByCaptcha, { data: values }).then((res) => {
            console.log(res);
        });
    }, []);

    return (
        <AuthLayout title="欢迎登录" footerLeft="signup" footerRight="resetPwd">
            <Tabs>
                <Tabs.TabPane tab="密码登录" key="password">
                    <Form onFinish={onPwdSignup}>
                        <FormItem.Email />
                        <FormItem.Password />
                        <FormItem.Submit>登录</FormItem.Submit>
                    </Form>
                </Tabs.TabPane>
                <Tabs.TabPane tab="验证登录" key="captcha">
                    <Form onFinish={onCaptchaSignup}>
                        <FormItem.Email />
                        <FormItem.Captcha />
                        <FormItem.Submit>登录</FormItem.Submit>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        </AuthLayout>
    );
}

export default LoginPage;
