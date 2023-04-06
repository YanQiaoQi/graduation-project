import { Form, Button } from 'antd';
import { ReactNode } from 'react';
import styles from './index.less';

interface FormItemSubmitProps {
    children: ReactNode;
}

export function FormItemSubmit({ children }: FormItemSubmitProps) {
    return (
        <Form.Item>
            <Button
                type="primary"
                htmlType="submit"
                className={styles['form-item-input']}
            >
                {children}
            </Button>
        </Form.Item>
    );
}
