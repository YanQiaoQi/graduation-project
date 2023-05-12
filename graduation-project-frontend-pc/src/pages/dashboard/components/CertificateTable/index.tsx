import { useMemo, ReactNode, useCallback } from 'react';
import { Table } from 'antd';
import { ENCRYPTION } from '@/common/constant';
import { Certificate, Encryption } from '@/common/type';
import { format } from '@/common/utils';
import EditableCell from './EditableCell';
import EncryptedCell from './EncryptedCell';

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
    editable?: boolean;
    editingKey?: string;
    loading?: boolean;
    columnEncryption: any;
    data: Certificate[];
    getClear: (encryption: Encryption, value: string) => () => Promise<any>;
    action?: Action;
    renderAction?: RenderColumn;
}

function CertificateTable({
    editingKey,
    editable = false,
    loading,
    columnEncryption,
    data,
    action,
    renderAction: customRenderAction,
    getClear,
}: CertificateTableProps) {
    const renderContent =
        (dataIndex: keyof Certificate) =>
        (render: Function) =>
        (value: string, record: Certificate, index: number) => {
            const isEncrypted = columnEncryption[dataIndex] !== 'clear';
            // 列加密
            if (index === 0) {
                return ENCRYPTION.VALUE_TO_LABEL[value];
            }
            // 已加密：显示密文
            if (isEncrypted) {
                return (
                    <EncryptedCell
                        timeout={5000}
                        dataIndex={dataIndex}
                        // @ts-ignore
                        getClear={getClear(columnEncryption[dataIndex], value)}
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
            dataIndex: 'created',
            key: 'created',
            editable: editable,
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
            render: customRenderAction ?? renderAction,
        },
    ];

    const mergedColumns = columns?.map((col) => {
        const dataIndex = col.dataIndex as keyof Certificate;
        return {
            render: renderContent(dataIndex)(format(dataIndex)),
            ...col,
            onCell: (record: Certificate, index?: number) => ({
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
        const res: Certificate[] = [columnEncryption];
        data.forEach((item) => {
            res.push(item);
            if (res.length % pageSize === 0) {
                res.push(columnEncryption);
            }
        });
        return res;
    }, [data, columnEncryption]);

    return (
        <Table
            rowKey={'created'}
            loading={loading}
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
