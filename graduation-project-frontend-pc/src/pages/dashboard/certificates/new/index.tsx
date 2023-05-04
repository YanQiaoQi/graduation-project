import { useState, useEffect, useCallback } from 'react';
import { Form, Card } from 'antd';
import FormItem from '@/components/FormItem';
import Container from '@/components/Container';
import request from '@/common/request';
import {
    CertificateType,
    CERTIFICATE,
    URL,
    ENCRYPTION_ITEMS_MAP,
} from '@/common/constant';
import { getFormData, navigateTo, showMessage } from '@/common/utils';

function CertificatesNewPage() {
    const [form] = Form.useForm();
    const fileType = Form.useWatch<CertificateType>('type', form);

    useEffect(() => {
        form.setFieldsValue({
            encryption: undefined,
            file: undefined,
        });
    }, [fileType]);

    const onFormFinish = useCallback((values) => {
        console.log(values);
        request
            .post(URL.CERTIFICATE, {
                data: getFormData(values),
            })
            .then(showMessage)
            .then(() => {
                navigateTo('/dashboard/certificates/list');
            });
    }, []);

    return (
        <Card title="新建证据">
            <Container direction="column" align="center">
                <Form
                    form={form}
                    labelAlign="right"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 14 }}
                    style={{ maxWidth: 800, minWidth: 800 }}
                    onFinish={onFormFinish}
                >
                    <FormItem.Select
                        required
                        label="证据类型"
                        name="type"
                        items={CERTIFICATE.ITEMS}
                    />
                    <FormItem.Select
                        required
                        label="加密类型"
                        name="encryption"
                        // @ts-ignore
                        items={ENCRYPTION_ITEMS_MAP[fileType] ?? []}
                    />
                    <FormItem.Input
                        required
                        label="证据描述"
                        name="description"
                    />
                    <FormItem.Upload
                        requiredMessage="请上传您的证据"
                        label="证据上传"
                        name="file"
                        type={fileType}
                        maxCount={5}
                    />
                    <FormItem.Submit
                        required
                        wrapperCol={{ offset: 5, span: 14 }}
                    >
                        确认
                    </FormItem.Submit>
                </Form>
            </Container>
        </Card>
    );
}

export default CertificatesNewPage;
