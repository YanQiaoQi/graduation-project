import { useState, useCallback } from 'react';
import { Space, Form, Button } from 'antd';
import { Evidence, EvidenceFieldEncryptionMap } from '@/common/type';
import FormModal from '../../../../components/FormModal';
import Table, { GetClearFunc } from '../../components/CertificateTable/index';
import {
    decryptEvidence,
    deleteEvidence,
    downloadEvidence,
    encryptEvidence,
    updateEvidence,
} from '@/service/evidence';

interface CertificateTableProps {
    loading: boolean;
    columnEncryption?: EvidenceFieldEncryptionMap;
    dataSource?: Evidence[];
    getData: Function;
}

function CertificateTable({
    loading,
    columnEncryption,
    dataSource,
    getData,
}: CertificateTableProps) {
    const authModal = FormModal();
    console.log(columnEncryption);
    
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

    const onDecryptEvidence = useCallback<GetClearFunc>(
        (id, field) => async () => {
            return authModal().then(() => decryptEvidence(id, field));
        },
        [],
    );

    const action = {
        data: (_: any, record: Evidence) => {
            // 数据展示行
            const { name, extension, id, isDelete } = record;
            return (
                <Space size="middle">
                    <Button
                        disabled={Boolean(record.isDelete)}
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
        <Form>
            <Table
                loading={loading}
                columnEncryption={columnEncryption}
                dataSource={dataSource}
                getClear={onDecryptEvidence}
                action={action}
                editable
                getData={getData}
            />
        </Form>
    );
}

export default CertificateTable;
