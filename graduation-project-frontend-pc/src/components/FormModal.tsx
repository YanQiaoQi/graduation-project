import { Modal as AntdModal, Form, message } from 'antd';
import FormItem from '@/components/FormItem';
import { FormInstance } from 'antd/es/form/Form';
import { showMessage } from '@/common/utils';
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
    return (onfulfilled: (value: T) => any) =>
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
                            message.open({
                                type: 'loading',
                                content: '',
                            });
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
        })
            // @ts-ignore
            .then(onfulfilled)
            .then(showMessage);
}

export default FormModal;
