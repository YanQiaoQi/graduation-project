import { useCallback } from 'react';
import { Table, TableProps, Button } from 'antd';
import { ENCRYPTION_ITEMS_MAP, URL } from '@/common/constant';
import FormItem from '@/components/FormItem';
import request from '@/common/request';
import { DataType } from '.';

interface EditableCellProps<T = any> extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    index: number;
    record: T;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    index,
    dataIndex,
    title,
    record,
    children,
    ...restProps
}) => {
    const encryptionStyle = index === 0 ? { backgroundColor: '#fafafa' } : {};
    return (
        <td {...restProps} style={encryptionStyle}>
            {editing ? (
                <FormItem.Select
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                    items={ENCRYPTION_ITEMS_MAP.text}
                />
            ) : (
                children
            )}
        </td>
    );
};

interface EditableTableProps extends TableProps<DataType> {
    columnEncryption: any;
    keyProp: keyof DataType;
    editingKey: string;
}

const valueToLabel: Record<string, string> = {
    clear: '明文',
};

function EditableTable({
    columns,
    keyProp,
    editingKey,
    columnEncryption,
    ...restProps
}: EditableTableProps) {
    const onCell = useCallback(
        (dataIndex: string, editable: boolean) =>
            (record: DataType, index?: number) => ({
                record,
                dataIndex,
                title: dataIndex,
                index,
                editing: record[keyProp] === editingKey && editable,
            }),
        [editingKey],
    );

    const format =
        (dataIndex: keyof typeof columnEncryption, render: any) =>
        (value: string, record: DataType, index: number) => {
            if (dataIndex === 'action') return render(value, record, index);
            const isEncrypted = columnEncryption[dataIndex] !== 'clear';
            // 列加密选择
            if (index === 0) {
                return valueToLabel[value] ?? value;
            }

            // 已加密：显示密文
            if (isEncrypted) {
                return (
                    <>
                        {value}
                        <Button
                            type="ghost"
                            onClick={() => {
                                request
                                    .get(
                                        `${URL.CERTIFICATE}/decrypt/${
                                            columnEncryption[dataIndex]
                                        }/${encodeURIComponent(value)}`,
                                    )
                                    .then((res) => {
                                        console.log(res);
                                    });
                            }}
                        >
                            解密
                        </Button>
                    </>
                );
            }
            // 未加密：显示格式化数据
            else {
                return render(value, record, index);
            }
        };

    const mergedColumns = columns?.map((col) => {
        // 数据列
        // 1. 处理 render
        if (col.hasOwnProperty('render')) {
            col.render = format(col.key!, col.render);
        } else {
            col.render = format(col.key!, (value: any) => value);
        }
        // 2. 处理 onCell
        //@ts-ignore
        col.onCell = onCell(col.key as string, col?.editable);
        return col;
    });

    return (
        <Table
            columns={mergedColumns}
            components={{
                body: {
                    cell: EditableCell,
                },
            }}
            {...restProps}
        />
    );
}

export default EditableTable;
