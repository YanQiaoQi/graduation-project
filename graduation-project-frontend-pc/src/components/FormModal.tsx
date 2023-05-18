import { Modal as AntdModal, Form } from 'antd';
import FormItem from '@/components/FormItem';
import { FormInstance } from 'antd/es/form/Form';
import { ReactNode } from 'react';

interface FormModalPrps {
    form: FormInstance;
    formChildren?: ReactNode;
    title?: string;
}

function FormModal<T>({
    form,
    formChildren,
    title = '请输入密码',
}: FormModalPrps) {
    return () =>
        new Promise((resolve, reject) => {
            AntdModal.confirm({
                title,
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
                        {formChildren ?? <FormItem.Input.Password />}
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
