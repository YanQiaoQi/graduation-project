import { Form, FormItemProps, Input } from 'antd';
import { useMemo } from 'react';
import styles from '../index.less';

export function FormItemEmail(props: FormItemProps) {
    const { name = 'email', rules: customRules = [], ...restProps } = props;
    const rules = useMemo(
        () => [
            {
                required: true,
                message: '请输入您的邮箱',
            },
            {
                pattern:
                    /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/,
                message: '请输入正确格式的邮箱',
            },
            ...customRules,
        ],
        [customRules],
    );
    return (
        <Form.Item name={'email'} rules={rules} {...restProps}>
            <Input
                className={styles['form-item-input']}
                placeholder="请输入邮箱"
            />
        </Form.Item>
    );
}
