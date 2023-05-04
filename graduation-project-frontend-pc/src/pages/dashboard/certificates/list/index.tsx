import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Space,
    Table,
    Form,
    Button,
    Card,
    DatePicker,
    Popconfirm,
    Input,
    Select,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { downloadFileByBlob, showMessage } from '@/common/utils';
import { CERTIFICATE, URL, CertificateType } from '@/common/constant';
import request from '@/common/request';
import dayjs from 'dayjs';

const { Column } = Table;

interface DataType {
    key: React.Key;
    name: string;
    type: CertificateType;
    created: number;
    size: number;
    extension: string;
}

const CertificatesListPage: React.FC = () => {
    const [tableData, setTableData] = useState<DataType[]>([]);

    const [stamp, forceUpdate] = useState(Date.now());

    const allTableData = useRef<DataType[]>([]);

    const [form] = Form.useForm();

    useEffect(() => {
        request.get(URL.CERTIFICATE).then((res) => {
            allTableData.current = res.data;
            setTableData(res.data);
        });
    }, [stamp]);

    const deleteCertificate = useCallback(
        (index) => () => {
            request
                .delete(`${URL.CERTIFICATE}/${index}`)
                .then(showMessage)
                .then(({ code }) => {
                    if (code === 1) {
                        forceUpdate(Date.now());
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

    const onFilter = useCallback(({ name, type, dateRange }) => {
        if (name || type || dateRange)
            setTableData((prevState) => {
                return allTableData.current?.filter((file) => {
                    if (name && name !== file.name) return false;
                    else if (type && type !== '-1' && type !== file.type)
                        return false;
                    else if (
                        dateRange &&
                        (dayjs(dateRange[0]).isAfter(file.created) ||
                            dayjs(dateRange[1]).isBefore(file.created))
                    )
                        return false;
                    else return true;
                });
            });
        else setTableData(allTableData.current);
    }, []);

    const onReset = useCallback(() => {
        form.resetFields();
        setTableData(allTableData.current);
    }, []);

    return (
        <Card
            title="证据列表"
            extra={
                <Button href="/dashboard/certificates/new">+ 新建证据</Button>
            }
        >
            <Form
                form={form}
                layout="inline"
                style={{ marginBottom: 24 }}
                onFinish={onFilter}
            >
                <Form.Item label="证据类型" name="type" initialValue={'-1'}>
                    <Select
                        options={[
                            { label: '全部', value: '-1' },
                            ...CERTIFICATE.ITEMS,
                        ]}
                    ></Select>
                </Form.Item>
                <Form.Item label="时间" name="dateRange">
                    <DatePicker.RangePicker
                        showTime
                        style={{ maxWidth: 340 }}
                    />
                </Form.Item>
                <Form.Item label="证据名称" name="name">
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button onClick={onReset}>reset</Button>
                </Form.Item>
                <Form.Item>
                    <Button
                        icon={<SearchOutlined />}
                        type="primary"
                        htmlType="submit"
                    />
                </Form.Item>
            </Form>
            <Table dataSource={tableData}>
                <Column title="证据名称" dataIndex="name" key="name" />
                <Column
                    title="证据类型"
                    dataIndex="type"
                    key="type"
                    render={(value: CertificateType) =>
                        CERTIFICATE.TYPE_TO_TEXT[value]
                    }
                />
                <Column
                    title="证据格式"
                    dataIndex="extension"
                    key="extension"
                />
                <Column
                    title="存储空间"
                    dataIndex="size"
                    key="size"
                    render={(value: number) => `${value}b`}
                />
                <Column
                    title="创建时间"
                    dataIndex="created"
                    key="created"
                    render={(value: number) =>
                        dayjs(value).format('YYYY-MM-DD HH:mm:ss')
                    }
                />
                <Column
                    title="备注"
                    dataIndex="description"
                    key="description"
                />
                <Column
                    title="操作"
                    key="action"
                    render={(value, record: DataType, index) => {
                        const { name, extension, created } = record;
                        const originalName = `${name}.${extension}`;
                        return (
                            <Space size="middle">
                                <Button
                                    size="small"
                                    onClick={dowloadCertificate(
                                        originalName,
                                        created,
                                    )}
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
                    }}
                />
            </Table>
        </Card>
    );
};

export default CertificatesListPage;
