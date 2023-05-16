import { useMemo, ReactNode, useCallback } from 'react';
import { Table } from 'antd';
import { ENCRYPTION } from '@/common/constant';
import { Certificate, Encryption } from '@/common/type';
import { format } from '@/common/utils';
import EditableCell from './editableCell';
import EncryptedCell from './encryptedCell';

type RenderColumn = (
    value: any,
    record: Certificate,
    index: number,
) => ReactNode;

export type Action = {
    columnEncryption?: RenderColumn;
    data?: RenderColumn;
};

interface CertificateTableProps {
    loading?: boolean;
    data: Certificate[];

    renderAction?: RenderColumn;
}

function SimpleCertificateTable({
    loading,
    data,
    renderAction,
}: CertificateTableProps) {
    const renderContent =
        (dataIndex: keyof Certificate) =>
        (render: Function) =>
        (value: string, record: Certificate, index: number) => {
            return render(value, record, index);
        };

    const pageSize = useMemo(() => 10, []);

    const columns = [
        {
            title: '证据名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '证据类型',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: '加密类型',
            dataIndex: 'encryption',
            key: 'encryption',
        },
        {
            title: '证据格式',
            dataIndex: 'extension',
            key: 'extension',
        },
        {
            title: '存储空间',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
        },
        {
            title: '备注',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: renderAction,
        },
    ];

    const mergedColumns = columns?.map((col) => {
        const dataIndex = col.dataIndex as keyof Certificate;
        return {
            render: renderContent(dataIndex)(format(dataIndex)),
            ...col,
        };
    });

    return (
        <Table
            rowKey={'created'}
            loading={loading}
            columns={mergedColumns}
            dataSource={data}
            pagination={{ pageSize }}
        />
    );
}

export default SimpleCertificateTable;
