import { useMemo, ReactNode, useCallback, useState, useContext } from 'react';
import { Form, Table, Space, Button, TableProps } from 'antd';
import { ENCRYPTION } from '@/common/constant';
import {
    Evidence,
    Encryption,
    EvidenceFieldEncryptionMap,
    Email,
} from '@/common/type';
import { format } from '@/common/utils';
import Cell from './cell';
import { ColumnType } from 'antd/es/table';
import FormModal from '@/components/FormModal';
import { encryptEvidence } from '@/service/evidence';
import { UserContext } from '@/common/contexts';

type DataType = Evidence | EvidenceFieldEncryptionMap;

export type RenderColumn<T = any> = (
    value: T,
    record: T,
    index: number,
) => ReactNode;

export type Action<T = any> = {
    columnEncryption?: RenderColumn<T>;
    data?: RenderColumn<T>;
};

export type GetClearFunc = (
    id: number,
    field: keyof EvidenceFieldEncryptionMap,
) => () => Promise<any>;

export type ExcludeItem = keyof Evidence | 'action';

interface CertificateTableProps extends TableProps<Evidence> {
    apply?: boolean;
    showColumnEncryption?: boolean;
    editable?: boolean;
    columnEncryption?: EvidenceFieldEncryptionMap;
    dataSource?: Evidence[];
    action?: Action;
    getClear?: GetClearFunc;
    getData?: any;
    onEditOk?: any;
    exclude?: ExcludeItem[];
    access?: (keyof EvidenceFieldEncryptionMap | 'download')[];
}

function CertificateTable({
    apply = false,
    showColumnEncryption = true,
    editable = false,
    columnEncryption,
    dataSource,
    action,
    getClear,
    getData,
    exclude,
    pagination,
    access,
    onEditOk: customOnEditOk,
    rowKey,
    components,
    ...restProps
}: CertificateTableProps) {
    const user = useContext(UserContext);
    const [editingKey, setEditingKey] = useState<string>('');
    const form = Form.useFormInstance();
    const authModal = FormModal();
    const onEdit = useCallback(
        (key) => () => {
            form.setFieldsValue(columnEncryption);
            setEditingKey(key ?? '');
        },
        [columnEncryption, form],
    );

    const onEditOk = useCallback(() => {
        authModal().then(() =>
            encryptEvidence(form.getFieldsValue()).then(() => {
                getData();
                setEditingKey('');
            }),
        );
    }, [form]);

    const onEditCancel = useCallback(() => {
        setEditingKey('');
    }, []);

    const renderContent =
        (dataIndex: keyof DataType) =>
        (value: string, record: DataType, index: number) => {
            const encryption = columnEncryption?.[dataIndex] ?? 'clear';
            // 列加密
            if (index === 0 && columnEncryption && showColumnEncryption) {
                return ENCRYPTION.VALUE_TO_LABEL[encryption];
            } else {
                return format(dataIndex)(value);
            }
        };

    const renderAction: RenderColumn<DataType> = useCallback(
        (value, record, index) => {
            if (index !== 0 || !showColumnEncryption) {
                return action?.data?.(value, record, index);
            } else if (columnEncryption && showColumnEncryption) {
                if (editable) {
                    return record.name === editingKey ? (
                        // 正在修改
                        <Space size="middle">
                            <Button type="link" size="small" onClick={onEditOk}>
                                确认
                            </Button>
                            <Button
                                type="link"
                                size="small"
                                onClick={onEditCancel}
                            >
                                取消
                            </Button>
                        </Space>
                    ) : (
                        // 未修改
                        <Button
                            type="link"
                            size="small"
                            onClick={onEdit(record.name)}
                        >
                            修改
                        </Button>
                    );
                }
            }
            return;
        },
        [action, editingKey, showColumnEncryption],
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
            title: '备注',
            dataIndex: 'description',
            key: 'description',
            editable: editable,
        },
        {
            title: '私有',
            dataIndex: 'isPrivate',
            key: 'isPrivate',
            render: (value: 0 | 1, record: DataType, index: number) => {
                // 列加密
                if (index === 0) {
                    return;
                }
                return value ? '是' : '否';
            },
        },
        {
            title: '状态',
            dataIndex: 'isDelete',
            key: 'isDelete',
            render: (value: 0 | 1, record: DataType, index: number) => {
                // 列加密
                if (index === 0) {
                    return;
                }
                return value ? '已删除' : '在线';
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: renderAction,
        },
    ];

    const mergedColumns = columns
        .filter((col) => !exclude?.includes(col.key as ExcludeItem))
        ?.map((col) => {
            const dataIndex = col.dataIndex as keyof DataType;
            const encryption = columnEncryption?.[dataIndex] ?? 'clear';
            const creator = dataSource?.[0].creatorId;

            const isEncrypted = encryption !== 'clear';
            const hasAccess =
                (access && access.includes(dataIndex)) ||
                creator === user.email;
            return {
                render: renderContent(dataIndex),
                ...col,
                onCell: (record: Evidence, index?: number) => ({
                    record,
                    dataIndex,
                    title: dataIndex,
                    index,
                    editable: col.editable,
                    disabled: !hasAccess && !apply,
                    isEncrypted,
                    editing: record.name === editingKey,
                    getClear: getClear?.(record.id, dataIndex),
                    showColumnEncryption,
                }),
            };
        });

    const mergedData = useMemo(() => {
        if (!showColumnEncryption || !columnEncryption || pagination)
            return dataSource;
        const res: DataType[] = [columnEncryption];
        dataSource?.forEach((item) => {
            res.push(item);
            if (res.length % pageSize === 0) {
                res.push(columnEncryption);
            }
        });
        return res;
    }, [dataSource, columnEncryption, showColumnEncryption]);

    return (
        <Table
            rowKey="createTime"
            //@ts-ignore
            columns={mergedColumns}
            dataSource={mergedData}
            components={{
                body: {
                    cell: Cell,
                },
            }}
            pagination={pagination ?? { pageSize }}
            {...restProps}
        />
    );
}

export default CertificateTable;
