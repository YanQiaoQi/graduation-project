import { useCallback, useMemo, useState } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import request from '../../../../common/request';
import { AUTH_URL } from '@/constant/url';
import styles from './index.less';

interface props {
    interval?: number;
}

export function FormItemCaptcha({ interval = 60 }: props) {
    const [num, setNum] = useState(interval);
    const [isPending, setIsPending] = useState(false);
    const formInstance = Form.useFormInstance();

    const countdown = useCallback((callback?: Function) => {
        const id = setInterval(() => {
            setNum((prev) => {
                const next = prev - 1;
                if (next === 0) {
                    callback?.();
                    clearInterval(id);
                    return interval;
                }
                return next;
            });
        }, 1000);
    }, []);

    const getCaptcha = useCallback(() => {
        formInstance.validateFields(['email']).then(() => {
            setIsPending(true);
            countdown(() => setIsPending(false));
            const email = formInstance.getFieldValue('email');
            request.post(AUTH_URL.captcha, { data: { email } });
        });
    }, [formInstance]);

    const rules = useMemo(
        () => [
            {
                required: true,
                message: '请输入邮箱验证码',
            },
            {
                len: 6,
                message: '六位邮箱验证码',
            },
        ],
        [],
    );

    return (
        <Form.Item name="captcha" rules={rules}>
            <Row gutter={8}>
                <Col span={12}>
                    <Input
                        className={styles['form-item-input']}
                        placeholder="请输入邮箱验证码"
                    />
                </Col>
                <Col span={12}>
                    <Button
                        className={styles['form-item-input']}
                        onClick={getCaptcha}
                        disabled={isPending}
                    >
                        {isPending ? `${num}s` : '获取验证码'}
                    </Button>
                </Col>
            </Row>
        </Form.Item>
    );
}
