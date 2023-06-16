import { useCallback, useMemo } from 'react';
import { Card, Space, Button, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import {
    getTransactorsApplications,
    processApplication,
} from '@/service/application';
import useRequest from '@ahooksjs/use-request';
import FormModal from '@/components/FormModal';
import FormItem from '@/components/FormItem';
import ExpandedTable from '../../components/CertificateTable/expandedTable';
import { RenderColumn } from '../../components/CertificateTable';
import { ApplyType } from '@/common/type';

function OthersApplications() {
    const { data, loading, run } = useRequest(getTransactorsApplications);

    const ConfirmModal = FormModal<{ expire: any }>(
        <FormItem label="过期时间" name="expire" required>
            <DatePicker showTime />
        </FormItem>,
    );

    const onConfirm = (id: number) => () => {
        ConfirmModal().then(({ expire }) => {
            if (expire < Date.now()) {
                message.error('过期时间小于现在时间');
                return;
            }
            processApplication(id, {
                code: 1,
                expire: dayjs(expire).valueOf(),
            }).then((res) => {
                run();
                console.log(res);
            });
        });
    };

    const onCancel = (id: number) => () => {
        processApplication(id, {
            code: 0,
        }).then((res) => {
            run();
            console.log(res);
        });
    };

    const renderAction: RenderColumn = (value, record, index) => {
        return (
            !record.done && (
                <Space size="middle">
                    <Button
                        type="link"
                        size="small"
                        onClick={onConfirm(record.id)}
                    >
                        同意
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        onClick={onCancel(record.id)}
                    >
                        拒绝
                    </Button>
                </Space>
            )
        );
    };

    const renderType = useCallback<RenderColumn<ApplyType>>((value) => {
        if (value === 'download') return '下载资源';
        else return `查看${value}`;
    }, []);

    const dataSource = useMemo(() => data?.filter((a) => !a.done), [data]);

    const columns = useMemo(
        () => [
            { title: '申请人', dataIndex: 'applicantId' },
            { title: '申请类型', dataIndex: 'type', render: renderType },
            { title: '创建时间', dataIndex: 'createTime' },
            {
                title: '操作',
                render: renderAction,
            },
        ],
        [],
    );

    return (
        <Card title="他人申请（待处理）">
            <ExpandedTable
                showColumnEncryption={false}
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                exclude={['isDelete', 'isPrivate', 'action']}
                pagination={false}
            />
        </Card>
    );
}

export default OthersApplications;
