import { ReactNode } from 'react';
import { Modal as AntdModal, Form } from 'antd';
import FormItem from '@/components/FormItem';
import request from '@/common/request';
import { URL } from '@/common/constant';
import { MessageWrapper } from '@/common/utils';

function FormModal<T>(FormItems?: ReactNode) {
    const [form] = Form.useForm();
    return () =>
        new Promise<T>((resolve, reject) => {
            AntdModal.confirm({
                title: '请输入以下信息',
                centered: true,
                content: (
                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={(value) => {
                            if (!FormItems) {
                                console.log(value);

                               
                                    request.post(`${URL.USER}/check`, {
                                        data: value,
                                    })
                                
                                    .then(() => {
                                        resolve(value);
                                    })
                                    .finally(() => {
                                        form.resetFields();
                                    });
                                return;
                            }
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
