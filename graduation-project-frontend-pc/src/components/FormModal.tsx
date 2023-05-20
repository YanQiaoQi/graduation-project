import { Modal as AntdModal, Form } from 'antd';
import FormItem from '@/components/FormItem';
import { ReactNode } from 'react';

function FormModal<T>(FormItems?: ReactNode) {
    const [form] = Form.useForm();
    return () =>
        new Promise<T>((resolve, reject) => {
            AntdModal.confirm({
                title: '请输入以下信息',
                centered: true,
                content: (
                    <Form
                        layout="horizontal"
                        form={form}
                        onFinish={(value) => {
                            resolve(value);
                            form.resetFields();
                        }}
                        style={{ marginTop: 12, marginBottom: -16 }}
                    >
                        {FormItems ?? <FormItem.Input.Password />}
                    </Form>
                ),
                onOk: async () => {
                    return form.validateFields().then(() => {
                        form.submit();
                    });
                },
            });
        });
}

export default FormModal;
