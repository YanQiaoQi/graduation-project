import { useState, useCallback } from 'react';
import { Space, Table, Form, Button, Card, DatePicker } from 'antd';
import { navigateTo } from '@/common/utils';
import FormItem from '@/components/FormItem';
import { CERTIFICATE } from '@/common/constant';

const { Column } = Table;

interface DataType {
    key: React.Key;
    name: string;
    type: string;
    time: number;
    size: number;
    format: string[];
}

const data: DataType[] = [
    {
        key: '1',
        name: 'John',
        type: 'Brown',
        time: 32,
        size: 32,
        format: ['nice', 'developer'],
    },
    {
        key: '2',
        name: 'Jim',
        type: 'Green',
        time: 42,
        size: 43,
        format: ['loser'],
    },
    {
        key: '3',
        name: 'Joe',
        type: 'Black',
        time: 32,
        size: 123,
        format: ['cool', 'teacher'],
    },
];

const CertificatesListPage: React.FC = () => {
    const [tableData, setTableData] = useState(data);
    const deleteCertificate = useCallback(() => {}, []);
    const updateCertificate = useCallback(() => {}, []);
    return (
        <Card
            title="存证列表"
            extra={
                <Button href="/dashboard/certificates/new">+ 新建存证</Button>
            }
        >
            <Form layout="inline" style={{ marginBottom: 24 }}>
                <FormItem.Select
                    label="存证类型"
                    name="type"
                    items={CERTIFICATE.ITEMS}
                />
                <FormItem label="时间">
                    <DatePicker.RangePicker
                        showTime
                        style={{ maxWidth: 340 }}
                    />
                </FormItem>
                <FormItem.Input label="存證名稱" name={'name'} />
            </Form>
            <Table dataSource={tableData}>
                <Column title="存证名称" dataIndex="name" key="name" />
                <Column title="存证类型" dataIndex="type" key="type" />
                <Column title="存证格式" dataIndex="format" key="format" />
                <Column title="存储空间" dataIndex="size" key="size" />
                <Column title="创建时间" dataIndex="time" key="time" />
                <Column title="备注" key="description" />
                <Column
                    title="操作"
                    key="action"
                    render={(_: any, record: DataType) => (
                        <Space size="middle">
                            <Button size="small" onClick={updateCertificate}>
                                修改
                            </Button>
                            <Button
                                size="small"
                                onClick={deleteCertificate}
                                danger
                            >
                                删除
                            </Button>
                        </Space>
                    )}
                />
            </Table>
        </Card>
    );
};

export default CertificatesListPage;
