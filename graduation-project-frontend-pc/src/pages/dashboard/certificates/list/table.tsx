import { useState, useCallback } from 'react';
import { Space, Form, Button } from 'antd';
import { downloadFileByBlob } from '@/common/utils';
import { URL } from '@/common/constant';
import request from '@/common/request';
import { Certificate, ColumnEncryption, Encryption } from '@/common/type';
import FormModal from '../../../../components/FormModal';
import Table from '../../components/CertificateTable/index';

interface CertificateTableProps {
    loading: boolean;
    columnEncryption: ColumnEncryption;
    setColumnEncryption: Function;
    data: Certificate[];
    getData: Function;
    setData: Function;
}

function CertificateTable({
    loading,
    columnEncryption,
    setColumnEncryption,
    data,
    getData,
    setData,
}: CertificateTableProps) {
    const [editingKey, setEditingKey] = useState<string>('');

    const [form] = Form.useForm();

    const [modalForm] = Form.useForm();

    const authModal = FormModal({ form: modalForm });

    const deleteCertificate = useCallback(
        (index) => () => {
            authModal((res) =>
                request
                    .delete(`${URL.CERTIFICATE}/${index}`, {
                        data: res,
                    })
                    .then((res) => {
                        if (res.code === 1) {
                            getData();
                        }
                        return res;
                    }),
            );
        },
        [],
    );

    const dowloadCertificate = useCallback(
        (index: number, name: string) => () => {
            authModal((res) =>
                request
                    .get(`${URL.CERTIFICATE}/download/${index}`, {
                        responseType: 'blob',
                        data: res,
                    })
                    .then((res) => {
                        downloadFileByBlob(res, name);
                    })
                    .catch((e) => {
                        console.log(e);
                    }),
            );
        },
        [],
    );

    const onEdit = useCallback(
        (record: Partial<Certificate>) => () => {
            form.setFieldsValue(columnEncryption);
            setEditingKey(record.name ?? '');
        },
        [columnEncryption],
    );

    const onEditOk = useCallback(() => {
        authModal((res) =>
            request
                .post(`${URL.CERTIFICATE}/encrypt`, {
                    data: form.getFieldsValue(),
                })
                .then((res) => {
                    setData(res.data.certificates);
                    setColumnEncryption(res.data.columnEncryption);
                    setEditingKey('');
                }),
        );
    }, []);

    const onEditCancel = useCallback(() => {
        setEditingKey('');
    }, []);

    const onDecrypt = useCallback(
        (encryption: Encryption, value: string) => () => {
            const cipher = encodeURIComponent(value);
            return authModal((res) => {
                return request.post(
                    `${URL.CERTIFICATE}/decrypt/${encryption}/${cipher}`,
                    {
                        data: res,
                    },
                );
            });
        },
        [columnEncryption],
    );

    const action = {
        columnEncryption: (value: any, record: Certificate, index: number) => {
            // 正在修改
            if (record.name === editingKey) {
                return (
                    <Space size="middle">
                        <Button type="link" size="small" onClick={onEditOk}>
                            确认
                        </Button>
                        <Button type="link" size="small" onClick={onEditCancel}>
                            取消
                        </Button>
                    </Space>
                );
            }
            // 未修改
            else {
                return (
                    <Button type="link" size="small" onClick={onEdit(record)}>
                        修改
                    </Button>
                );
            }
        },
        data: (value: any, record: Certificate, index: number) => {
            // 数据展示行
            const { name, extension, encryption } = record;
            const originalName = `${name}.${extension}`;
            return (
                <Space size="middle">
                    <Button
                        type="link"
                        size="small"
                        onClick={dowloadCertificate(index - 1, originalName)}
                    >
                        下载
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        onClick={deleteCertificate(index - 1)}
                    >
                        删除
                    </Button>
                </Space>
            );
        },
    };

    return (
        <Form form={form}>
            <Table
                loading={loading}
                editable
                editingKey={editingKey}
                columnEncryption={columnEncryption}
                data={data}
                getClear={onDecrypt}
                action={action}
            />
        </Form>
    );
}

export default CertificateTable;
