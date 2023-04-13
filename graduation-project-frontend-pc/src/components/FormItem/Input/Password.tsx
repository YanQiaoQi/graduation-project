import { Form, Input } from 'antd';
import { Fragment, useMemo } from 'react';
import styles from '../index.less';

interface FormItemPwdProps {
    confirm?: boolean;
}

export function FormItemPwd({ confirm }: FormItemPwdProps) {
    const pwdRules = useMemo(
        () => [
            {
                required: true,
                message: '请输入您的密码',
            },
            {
                min: 8,
                message: '8 ~ 20个字符',
            },
            {
                max: 20,
                message: '8 ~ 20个字符',
            },
            {
                pattern:
                    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$_!%*#?&])[A-Za-z\d_$`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]{8,20}$$/,
                message: '必须包含字母，数字，特殊字符',
            },
        ],
        [],
    );

    const confirmPwdRules = useMemo(
        () => [
            {
                required: true,
                message: '请确认您的密码',
            },
            // @ts-ignore
            ({ getFieldValue }) => ({
                validator(_: any, value: string) {
                    console.log(getFieldValue('password'));

                    if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('您的密码前后输入不一致!'));
                },
            }),
        ],
        [],
    );

    return (
        <Fragment>
            <Form.Item name="password" rules={pwdRules}>
                <Input.Password
                    className={styles['form-item-input']}
                    placeholder="请输入密码"
                    autoComplete="off"
                />
            </Form.Item>
            {confirm && (
                <Form.Item
                    name="confirm"
                    rules={confirmPwdRules}
                    dependencies={['password']}
                >
                    <Input.Password
                        className={styles['form-item-input']}
                        placeholder="请再次输入密码"
                        autoComplete="off"
                    />
                </Form.Item>
            )}
        </Fragment>
    );
}
