import { useState, useCallback, FC, useMemo } from 'react';
import { Space, Form, Button, Table, Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { downloadFileByBlob, formatByte } from '@/common/utils';
import {
    CERTIFICATE,
    URL,
    CertificateType,
    ENCRYPTION_ITEMS_MAP,
} from '@/common/constant';
import request from '@/common/request';
import dayjs from 'dayjs';
import { DataType } from '.';
import FormItem from '@/components/FormItem';
import Container from '@/components/Container';
import AuthModal from '../components/AuthModal';

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
        onClick().then(({ data }) => {
            setIsDecrypted(true);
            setContent(format(dataIndex)(data));
            setTimeout(() => {
                setIsDecrypted(false);
                setContent(cipher);
            }, timeout);
        });
    }, [onClick]);

    return (
        <Container align="space-between">
            <Tooltip title={isDecrypted ? content : children}>
                {content}
            </Tooltip>
            <Button
                size="small"
                type="link"
                icon={isDecrypted ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                disabled={isDecrypted}
                onClick={mergedOnClick}
            />
            {/* {isDecrypted ? (
                <EyeOutlined
                    color="grey"
                    disabled={isDecrypted}
                    onClick={mergedOnClick}
                />
            ) : (
                <EyeInvisibleOutlined
                    color="grey"
                    disabled={isDecrypted}
                    onClick={mergedOnClick}
                />
            )} */}
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
    columnEncryption: any;
    setColumnEncryption: any;
    data: DataType[];
    getData: Function;
    setData: Function;
}

function CertificateTable({
    columnEncryption,
    setColumnEncryption,
    data,
    getData,
    setData,
}: CertificateTableProps) {
    const [editingKey, setEditingKey] = useState<string>('');

    const [form] = Form.useForm();

    const authModal = AuthModal(...Form.useForm());

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
                    .get(`${URL.CERTIFICATE}/${index}`, {
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
        (record: Partial<DataType>) => () => {
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
        (dataIndex: keyof DataType, value: string) => () => {
            const encryption = columnEncryption[dataIndex];
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
                        timeout={5000}
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

    const pageSize = useMemo(() => 10, []);

    const columns = [
        {
            title: '证据名称',
            dataIndex: 'name',
            key: 'name',
            editable: true,
        },
        {
            title: '证据类型',
            dataIndex: 'type',
            key: 'type',
            editable: true,
        },
        {
            title: '加密类型',
            dataIndex: 'encryption',
            key: 'encryption',
            editable: true,
        },
        {
            title: '证据格式',
            dataIndex: 'extension',
            key: 'extension',
            editable: true,
        },
        {
            title: '存储空间',
            dataIndex: 'size',
            key: 'size',
            editable: true,
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            editable: true,
        },
        {
            title: '备注',
            dataIndex: 'description',
            key: 'description',
            editable: true,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (value: any, record: DataType, index: number) => {
                // 加密选择行
                if (index === 0) {
                    // 正在修改
                    if (record.name === editingKey) {
                        return (
                            <Space size="middle">
                                <Button size="small" onClick={onEditOk}>
                                    确认
                                </Button>
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
                            )}
                        >
                            下载
                        </Button>
                        <Button
                            size="small"
                            danger
                            onClick={deleteCertificate(index - 1)}
                        >
                            删除
                        </Button>
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

    const mergedData = useMemo(() => {
        const res: DataType[] = [columnEncryption];
        data.forEach((item) => {
            res.push(item);
            if (res.length % pageSize === 0) {
                res.push(columnEncryption);
            }
        });
        return res;
    }, [data, columnEncryption]);

    return (
        <Form form={form}>
            <Table
                loading={data.length === 0}
                columns={mergedColumns}
                dataSource={mergedData}
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                pagination={{ pageSize }}
            />
        </Form>
    );
}

export default CertificateTable;
