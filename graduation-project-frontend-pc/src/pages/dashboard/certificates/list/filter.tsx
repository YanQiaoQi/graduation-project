import { useCallback } from 'react';
import { Form, Button, DatePicker, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CERTIFICATE } from '@/common/constant';
import { Certificate } from '@/common/type';

interface CertificateFilterProps {
    data: Certificate[];
    setData: any;
}

function CertificateFilter({ data, setData }: CertificateFilterProps) {
    const [form] = Form.useForm();

    const onFilter = useCallback(
        ({ name, type, dateRange }) => {
            if (name || type || dateRange) {
                const newData = data?.filter((file) => {
                    // 名字不符合
                    if (name && name !== file.name) {
                        console.log(file, '名字不符合');

                        return false;
                    }
                    // 类型不符合
                    else if (type && type !== '-1' && type !== file.type) {
                        console.log(file, '类型不符合');
                        return false;
                    }
                    // 时间不符合
                    else if (
                        dateRange &&
                        (dayjs(dateRange[0]).isAfter(file.created) ||
                            dayjs(dateRange[1]).isBefore(file.created))
                    ) {
                        console.log(file, '时间不符合');
                        return false;
                    }
                    // 符合条件
                    else {
                        return true;
                    }
                });
                setData(newData);
            } else {
                setData(data);
            }
        },
        [data],
    );

    const onReset = useCallback(() => {
        form.resetFields();
        setData(data);
    }, [data]);

    return (
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
                <DatePicker.RangePicker showTime style={{ maxWidth: 340 }} />
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
    );
}

export default CertificateFilter;
