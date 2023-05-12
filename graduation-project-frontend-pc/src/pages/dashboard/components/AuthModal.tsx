import { Modal as AntdModal, Form, message } from 'antd';
import FormItem from '@/components/FormItem';
import { FormInstance } from 'antd/es/form/Form';
import { showMessage } from '@/common/utils';

function AuthModal(form: FormInstance) {
    return (onfulfilled: (value: unknown) => any) =>
        new Promise((resolve, reject) => {
            AntdModal.confirm({
                title: '请输入密码',
                centered: true,
                content: (
                    <Form
                        layout="vertical"
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
                        <FormItem.Input.Password />
                    </Form>
                ),
                onOk: async () => {
                    return form.validateFields().then(() => {
                        form.submit();
                    });
                },
            });
        })
            .then(onfulfilled)
            .then(showMessage);
}

export default AuthModal;
