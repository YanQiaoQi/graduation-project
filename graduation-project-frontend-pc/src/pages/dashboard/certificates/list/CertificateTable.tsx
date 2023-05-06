import { useState, useCallback } from 'react';
import { Space, Form, Button, Popconfirm } from 'antd';
import { downloadFileByBlob, showMessage } from '@/common/utils';
import { CERTIFICATE, URL, CertificateType } from '@/common/constant';
import request from '@/common/request';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import { DataType } from '.';
import Table from './EditableTable';

interface CertificateTableProps {
    data: DataType[];
    getData: Function;
    onChange: Function;
}

function CertificateTable({ data, getData, onChange }: CertificateTableProps) {
    const [editingKey, setEditingKey] = useState<string>('');

    const [form] = Form.useForm();

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
        (name: string, created: number) => () => {
            request
                .get(`${URL.CERTIFICATE}/${name}/${created}`, {
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

    const columns: ColumnsType<DataType> = [
        {
            title: '证据名称',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            // @ts-ignore
            editable: true,
        },
        {
            title: '证据类型',
            dataIndex: 'type',
            key: 'type',
            ellipsis: true,
            // @ts-ignore
            editable: true,
            render: (value: CertificateType) => CERTIFICATE.TYPE_TO_TEXT[value],
        },
        {
            title: '加密类型',
            dataIndex: 'encryption',
            key: 'encryption',
            ellipsis: true,
            // @ts-ignore
            editable: true,
        },
        {
            title: '证据格式',
            dataIndex: 'extension',
            key: 'extension',
            ellipsis: true,
            // @ts-ignore
            editable: true,
        },
        {
            title: '存储空间',
            dataIndex: 'size',
            key: 'size',
            ellipsis: true,
            // @ts-ignore
            editable: true,
            render: (value: string) => `${value}b`,
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            // ellipsis: true,
            // @ts-ignore
            editable: true,
            render: (value: string) =>
                dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '备注',
            dataIndex: 'description',
            key: 'description',
            // ellipsis: true,
            // @ts-ignore
            editable: true,
        },
        {
            title: '操作',
            key: 'action',
            render: (value, record, index) => {
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
                const { name, extension, created } = record;
                const originalName = `${name}.${extension}`;
                return (
                    <Space size="middle">
                        <Button
                            size="small"
                            onClick={dowloadCertificate(originalName, created)}
                        >
                            下载
                        </Button>
                        <Popconfirm
                            title="删除"
                            description={`确认删除证据 ${name} ?`}
                            onConfirm={deleteCertificate(index)}
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

    return (
        <Form form={form}>
            <Table
                keyProp="name"
                editingKey={editingKey}
                columns={columns}
                dataSource={data}
                columnEncryption={data[0]}
            />
        </Form>
    );
}

export default CertificateTable;
