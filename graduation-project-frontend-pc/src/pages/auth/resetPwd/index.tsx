import { useState, useCallback, useMemo } from 'react';
import { Steps, Form, Button } from 'antd';
import AuthLayout from '../components/authLayout';
import FormItem from '../components/FormItem';
import request from '../../../common/request';
import { AUTH_URL } from '@/constant/url';
import Container from '@/components/Container';

interface ResetPwdProps {}

function ResetPwd({}: ResetPwdProps) {
    const [current, setCurrent] = useState(0);

    const nextStep = useCallback((values) => {
        setCurrent(1);
    }, []);

    const resetPwd = useCallback((values) => {
        request.post(AUTH_URL.resetPwd, {});
    }, []);

    const items = useMemo(
        () => [
            <Form onFinish={nextStep}>
                <FormItem.Email />
                <FormItem.Captcha />
                <FormItem.Submit>下一步</FormItem.Submit>
            </Form>,
            <Form onFinish={resetPwd}>
                <FormItem.Password confirm />
                <FormItem.Submit>确认</FormItem.Submit>
            </Form>,
        ],
        [],
    );

    return (
        <AuthLayout title="重置密码" footerLeft="signup" footerRight="login">
            <Steps
                current={current}
                // @ts-ignore
                items={[{ title: '确认邮箱' }, { title: '更新密码' }]}
                style={{ marginBottom: 24 }}
            />
            <Container>{items[current]}</Container>
        </AuthLayout>
    );
}

export default ResetPwd;
