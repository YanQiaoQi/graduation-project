import { useMemo, ReactNode, useCallback } from 'react';
import { Table } from 'antd';
import { ENCRYPTION } from '@/common/constant';
import {
    Evidence,
    Encryption,
    EvidenceFieldEncryptionMap,
} from '@/common/type';
import { format } from '@/common/utils';
import EditableCell from './editableCell';
import EncryptedCell from './encryptedCell';

export type RenderColumn<T = any> = (
    value: T,
    record: T,
    index: number,
) => ReactNode;

export type Action<T = any> = {
    columnEncryption?: RenderColumn<T>;
    data?: RenderColumn<T>;
};

interface CertificateTableProps {
    editable?: boolean;
    editingKey?: string;
    loading?: boolean;
    columnEncryption?: EvidenceFieldEncryptionMap;
    data?: Evidence[];
    getClear: (encryption: Encryption, value: string) => () => Promise<any>;
    action?: Action;
}

function CertificateTable({
    editingKey,
    editable = false,
    loading,
    columnEncryption,
    data,
    action,
    getClear,
}: CertificateTableProps) {
    const renderContent =
        (dataIndex: keyof Evidence) =>
        (render: Function) =>
        (value: string, record: Evidence, index: number) => {
            const encryption = (columnEncryption?.[dataIndex] ??
                'clear') as Encryption;
            const isEncrypted = encryption !== 'clear';
            // 列加密
            if (index === 0) {
                return ENCRYPTION.VALUE_TO_LABEL[encryption];
            }
            // 已加密：显示密文
            if (isEncrypted) {
                return (
                    <EncryptedCell
                        timeout={5000}
                        dataIndex={dataIndex}
                        getClear={getClear(encryption, value)}
                    >
                        {value}
                    </EncryptedCell>
                );
            }
            // 未加密：显示格式化数据
            else {
                return render(value, record, index);
            }
        };

    const renderAction: RenderColumn = useCallback(
        (value, record, index) => {
            const renderFunction: keyof Action =
                index === 0 ? 'columnEncryption' : 'data';
            return action?.[renderFunction]?.(value, record, index);
        },
        [action],
    );

    const pageSize = useMemo(() => 10, []);

    const columns = [
        {
            title: '证据名称',
            dataIndex: 'name',
            key: 'name',
            editable: editable,
        },
        {
            title: '证据类型',
            dataIndex: 'type',
            key: 'type',
            editable: editable,
        },
        {
            title: '加密类型',
            dataIndex: 'encryption',
            key: 'encryption',
            editable: editable,
        },
        {
            title: '证据格式',
            dataIndex: 'extension',
            key: 'extension',
            editable: editable,
        },
        {
            title: '存储空间',
            dataIndex: 'size',
            key: 'size',
            editable: editable,
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            editable: editable,
        },
        {
            title: '私有',
            dataIndex: 'isPrivate',
            key: 'isPrivate',
            render: (value: 0 | 1, record: Evidence, index: number) => {
                // 列加密
                if (index === 0) {
                    return ENCRYPTION.VALUE_TO_LABEL.clear;
                }
                return value ? '是' : '否';
            },
        },
        {
            title: '状态',
            dataIndex: 'isDelete',
            key: 'isDelete',
            render: (value: 0 | 1, record: Evidence, index: number) => {
                // 列加密
                if (index === 0) {
                    return ENCRYPTION.VALUE_TO_LABEL.clear;
                }
                return value ? '已删除' : '在线';
            },
        },
        {
            title: '备注',
            dataIndex: 'description',
            key: 'description',
            editable: editable,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: renderAction,
        },
    ];

    const mergedColumns = columns?.map((col) => {
        const dataIndex = col.dataIndex as keyof Evidence;
        return {
            render: renderContent(dataIndex)(format(dataIndex)),
            ...col,
            onCell: (record: Evidence, index?: number) => ({
                record,
                dataIndex,
                title: dataIndex,
                index,
                editable: col.editable,
                editing: record.name === editingKey,
            }),
        };
    });

    const mergedData = useMemo(() => {
        if (!columnEncryption) return data;
        const res: (Evidence | EvidenceFieldEncryptionMap)[] = [
            columnEncryption,
        ];
        data?.forEach((item) => {
            res.push(item);
            if (res.length % pageSize === 0) {
                res.push(columnEncryption);
            }
        });
        return res;
    }, [data, columnEncryption]);

    return (
        <Table
            rowKey={'id'}
            loading={loading}
            // @ts-ignore
            columns={mergedColumns}
            dataSource={mergedData}
            components={{
                body: {
                    cell: EditableCell,
                },
            }}
            pagination={{ pageSize }}
        />
    );
}

export default CertificateTable;
