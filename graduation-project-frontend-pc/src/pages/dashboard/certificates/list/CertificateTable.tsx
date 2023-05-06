import { useState, useCallback, FC } from 'react';
import { Space, Form, Button, Popconfirm, Table, Tooltip, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { downloadFileByBlob, formatByte, showMessage } from '@/common/utils';
import {
    CERTIFICATE,
    URL,
    CertificateType,
    ENCRYPTION_ITEMS_MAP,
} from '@/common/constant';
import request from '@/common/request';
import dayjs from 'dayjs';
import { DataType, Encryption } from '.';
import FormItem from '@/components/FormItem';
import Container from '@/components/Container';

const valueToLabel: Record<string, string> = {
    clear: '明文',
};

interface EditableCellProps<T = any> extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    index: number;
    record: T;
    editable: boolean;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    index,
    dataIndex,
    title,
    record,
    children,
    editable,
    ...restProps
}) => {
    const encryptionStyle = index === 0 ? { backgroundColor: '#fafafa' } : {};
    return (
        <td {...restProps} style={encryptionStyle}>
            {editing && editable ? (
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

interface EncryptedCellProps {
    dataIndex: keyof DataType;
    timeout?: number;
    children: string;
    onClick: () => Promise<any>;
}

const EncryptedCell: FC<EncryptedCellProps> = ({
    dataIndex,
    timeout = 3000,
    children,
    onClick,
}) => {
    const cipher = `${children?.substring?.(0, 5)}...`;

    const [content, setContent] = useState(cipher);

    const [isDecrypted, setIsDecrypted] = useState(false);

    const mergedOnClick = useCallback(() => {
        setIsDecrypted(true);
        onClick().then(({ data }) => {
            setContent(format(dataIndex)(data));
            setTimeout(() => {
                setIsDecrypted(false);
                setContent(cipher);
            }, timeout);
        });
    }, [onClick]);

    return (
        <Container>
            <Tooltip title={content}>{content}</Tooltip>
            <Button
                type="link"
                icon={<EyeOutlined />}
                disabled={isDecrypted}
                onClick={mergedOnClick}
            />
        </Container>
    );
};

function format(type: keyof DataType) {
    switch (type) {
        case 'created': {
            return (value: string) =>
                dayjs(Number(value)).format('YYYY-MM-DD HH:mm:ss');
        }
        case 'type': {
            return (value: CertificateType) => CERTIFICATE.TYPE_TO_TEXT[value];
        }
        case 'size': {
            return (value: string) => formatByte(parseInt(value));
        }
        default: {
            return (value: any) => value;
        }
    }
}

interface CertificateTableProps {
    data: DataType[];
    getData: Function;
    onChange: Function;
}

function CertificateTable({ data, getData, onChange }: CertificateTableProps) {
    const [editingKey, setEditingKey] = useState<string>('');

    const [form] = Form.useForm();

    const columnEncryption = data[0];

    const deleteCertificate = useCallback(
        (index) => () => {
            request
                .delete(`${URL.CERTIFICATE}/${index}`)
                .then(showMessage)
                .then(({ code }) => {
                    if (code === 1) {
                        getData();
                    }
                });
        },
        [],
    );

    const dowloadCertificate = useCallback(
        (index: number, name: string, encryption: Encryption) => () => {
            request
                .get(`${URL.CERTIFICATE}/${encryption}/${index}`, {
                    responseType: 'blob',
                })
                .then((res) => {
                    downloadFileByBlob(res, name);
                })
                .catch((e) => {
                    console.log(e);
                });
        },
        [],
    );

    const onEdit = useCallback(
        (record: Partial<DataType>) => () => {
            form.setFieldsValue(data[0]);
            setEditingKey(record.name ?? '');
        },
        [data],
    );

    const onEditOk = useCallback(() => {
        request
            .post(`${URL.CERTIFICATE}/encrypt`, {
                data: form.getFieldsValue(),
            })
            .then((res) => {
                onChange(res.data);
                setEditingKey('');
            });
    }, []);

    const onEditCancel = useCallback(() => {
        setEditingKey('');
    }, []);

    const onDecrypt = useCallback(
        (dataIndex: keyof DataType, value: string) => () => {
            const encryption = columnEncryption[dataIndex];
            const cipher = encodeURIComponent(value);
            return request.get(
                `${URL.CERTIFICATE}/decrypt/${encryption}/${cipher}`,
            );
        },
        [columnEncryption],
    );

    const renderContent =
        (dataIndex: keyof DataType) =>
        (render: Function) =>
        (value: string, record: DataType, index: number) => {
            const isEncrypted = columnEncryption[dataIndex] !== 'clear';
            // 列加密选择
            if (index === 0) {
                return valueToLabel[value] ?? value;
            }

            // 已加密：显示密文
            if (isEncrypted) {
                return (
                    <EncryptedCell
                        dataIndex={dataIndex}
                        onClick={onDecrypt(dataIndex, value)}
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

    const columns = [
        {
            title: '证据名称',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            editable: true,
        },
        {
            title: '证据类型',
            dataIndex: 'type',
            key: 'type',
            ellipsis: true,
            editable: true,
        },
        {
            title: '加密类型',
            dataIndex: 'encryption',
            key: 'encryption',
            ellipsis: true,
            editable: true,
        },
        {
            title: '证据格式',
            dataIndex: 'extension',
            key: 'extension',
            ellipsis: true,
            editable: true,
        },
        {
            title: '存储空间',
            dataIndex: 'size',
            key: 'size',
            ellipsis: true,
            editable: true,
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            // ellipsis: true,
            editable: true,
        },
        {
            title: '备注',
            dataIndex: 'description',
            key: 'description',
            // ellipsis: true,
            editable: true,
        },
        {
            title: '操作',
            key: 'action',
            render: (value: any, record: DataType, index: number) => {
                // 加密选择行
                if (index === 0) {
                    // 正在修改
                    if (record.name === editingKey) {
                        return (
                            <Space size="middle">
                                <Popconfirm
                                    title="确认"
                                    description={`确认保存 ?`}
                                    onConfirm={onEditOk}
                                    okText="是"
                                    cancelText="否"
                                >
                                    <Button size="small">确认</Button>
                                </Popconfirm>
                                <Button size="small" onClick={onEditCancel}>
                                    取消
                                </Button>
                            </Space>
                        );
                    }
                    // 未修改
                    else {
                        return (
                            <Button size="small" onClick={onEdit(record)}>
                                修改
                            </Button>
                        );
                    }
                }
                // 数据展示行
                const { name, extension, encryption } = record;
                const originalName = `${name}.${extension}`;
                return (
                    <Space size="middle">
                        <Button
                            size="small"
                            onClick={dowloadCertificate(
                                index - 1,
                                originalName,
                                encryption,
                            )}
                        >
                            下载
                        </Button>
                        <Popconfirm
                            title="删除"
                            description={`确认删除证据 ${name} ?`}
                            onConfirm={deleteCertificate(index - 1)}
                            okText="是"
                            cancelText="否"
                        >
                            <Button size="small" danger>
                                删除
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const mergedColumns = columns?.map((col) => {
        const dataIndex = col.dataIndex as keyof DataType;
        return {
            render: renderContent(dataIndex)(format(dataIndex)),
            ...col,
            onCell: (record: DataType, index?: number) => ({
                record,
                dataIndex,
                title: dataIndex,
                index,
                editable: col.editable,
                editing: record.name === editingKey,
            }),
        };
    });

    return (
        <Form form={form}>
            <Table
                columns={mergedColumns}
                dataSource={data}
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
            />
        </Form>
    );
}

export default CertificateTable;
