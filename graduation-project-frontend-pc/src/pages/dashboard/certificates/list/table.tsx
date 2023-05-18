import { useState, useCallback } from 'react';
import { Space, Form, Button } from 'antd';
import { downloadFileByBlob } from '@/common/utils';
import { URL } from '@/common/constant';
import request from '@/common/request';
import {
    Evidence,
    ColumnEncryption,
    Encryption,
    EvidenceFieldEncryptionMap,
} from '@/common/type';
import FormModal from '../../../../components/FormModal';
import Table from '../../components/CertificateTable/index';
import {
    deleteEvidence,
    downloadEvidence,
    updateEvidence,
} from '@/service/evidence';

interface CertificateTableProps {
    loading: boolean;
    columnEncryption?: EvidenceFieldEncryptionMap;
    data?: Evidence[];
    getData: Function;
}

function CertificateTable({
    loading,
    columnEncryption,
    data,
    getData,
}: CertificateTableProps) {
    const [editingKey, setEditingKey] = useState<string>('');

    const [form] = Form.useForm();

    const [modalForm] = Form.useForm();

    const authModal = FormModal({ form: modalForm });

    const deleteCertificate = useCallback(
        (id) => () => {
            authModal().then(() =>
                deleteEvidence(id).then(() => {
                    getData();
                }),
            );
        },
        [],
    );
    const restoreCertificate = useCallback(
        (id) => () => {
            authModal().then(() =>
                updateEvidence(id, {
                    isDelete: 0,
                }).then(() => {
                    getData();
                }),
            );
        },
        [],
    );
    const dowloadCertificate = useCallback(
        (id: number, name: string) => () => {
            authModal().then(() => downloadEvidence(id, name));
        },
        [],
    );

    const onEdit = useCallback(
        (record: Partial<Evidence>) => () => {
            form.setFieldsValue(columnEncryption);
            setEditingKey(record.name ?? '');
        },
        [columnEncryption],
    );

    const onEditOk = useCallback(() => {
        authModal().then((res) =>
            request
                .post(`${URL.CERTIFICATE}/encrypt`, {
                    data: form.getFieldsValue(),
                })
                .then((res) => {
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
            return authModal().then((res) => {
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
        columnEncryption: (value: any, record: Evidence, index: number) => {
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
        data: (_: any, record: Evidence) => {
            // 数据展示行
            const { name, extension, id, isDelete } = record;
            return (
                <Space size="middle">
                    <Button
                        type="link"
                        size="small"
                        onClick={dowloadCertificate(id, `${name}.${extension}`)}
                    >
                        下载
                    </Button>
                    {isDelete ? (
                        <Button
                            type="link"
                            size="small"
                            onClick={restoreCertificate(id)}
                        >
                            恢复
                        </Button>
                    ) : (
                        <Button
                            type="link"
                            size="small"
                            danger
                            onClick={deleteCertificate(id)}
                        >
                            删除
                        </Button>
                    )}
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
