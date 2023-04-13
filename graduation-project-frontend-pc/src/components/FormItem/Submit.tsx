import { Form, Button, FormItemProps } from 'antd';
import { ReactNode } from 'react';

interface FormItemSubmitProps extends FormItemProps {
    block?: boolean;
    children: ReactNode;
}

export function FormItemSubmit({
    block = true,
    children,
    ...restProps
}: FormItemSubmitProps) {
    return (
        <Form.Item {...restProps}>
            <Button block={block} type="primary" htmlType="submit">
                {children}
            </Button>
        </Form.Item>
    );
}
