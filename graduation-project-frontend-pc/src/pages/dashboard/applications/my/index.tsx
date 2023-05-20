import { useMemo, useCallback, useState, useContext } from 'react';
import { Card, Button, TableColumnType, Empty } from 'antd';
import {
    getApplicantsApplications,
    ApplicationResBody as DataType,
    ApplicationResBody,
} from '@/service/application';
import useRequest from '@ahooksjs/use-request';
import ExpandedTable from '../../components/CertificateTable/expandedTable';
import FormModal from '@/components/FormModal';
import { decryptEvidence, downloadEvidence } from '@/service/evidence';
import { format } from '@/common/utils';
import {
    Action,
    ExcludeItem,
    GetClearFunc,
    RenderColumn,
} from '../../components/CertificateTable';
import { ApplyType, Evidence } from '@/common/type';
import { UserContext } from '@/common/contexts';

type ApplicationStatus = 'success' | 'pending' | 'fail';

function MyApplications() {
    const user = useContext(UserContext);

    const [activeTabKey, setActiveTabKey] =
        useState<ApplicationStatus>('success');

    const { data, loading } = useRequest(getApplicantsApplications);

    const authModal = FormModal();

    const tabList = useMemo(
        () => [
            {
                key: 'success',
                tab: '同意',
            },
            {
                key: 'pending',
                tab: '等待',
            },
            {
                key: 'fail',
                tab: '拒绝',
            },
        ],
        [],
    );

    const onTabChange = useCallback((key) => {
        setActiveTabKey(key);
    }, []);

    const onDecrypt = useCallback<GetClearFunc>(
        (id, field) => async () => {
            return authModal().then(() => decryptEvidence(id, field));
        },
        [],
    );

    const onDownload = useCallback(
        (id: number, name: string) => () => {
            authModal().then(() => downloadEvidence(id, name));
        },
        [],
    );

    const action = (record: ApplicationResBody): Action => ({
        data: (_: any, r: Evidence) => {
            const { name, extension, id } = r;
            return (
                record.access?.includes('download') && (
                    <Button
                        type="link"
                        size="small"
                        onClick={onDownload(id, `${name}.${extension}`)}
                    >
                        下载
                    </Button>
                )
            );
        },
    });

    const renderType = useCallback<RenderColumn<ApplyType>>((value) => {
        if (value === 'download') return '下载资源';
        else return `查看${value}`;
    }, []);

    const columnsMap = useMemo(
        () => ({
            success: [
                { title: '处理人', dataIndex: 'transactorId' },
                { title: '申请类型', dataIndex: 'type', render: renderType },
                {
                    title: '创建时间',
                    dataIndex: 'createTime',
                },
                {
                    title: '处理时间',
                    dataIndex: 'endTime',
                },
                {
                    title: '过期时间',
                    dataIndex: 'expire',
                },
            ],
            pending: [
                { title: '处理人', dataIndex: 'transactorId' },
                { title: '申请类型', dataIndex: 'type', render: renderType },
                {
                    title: '创建时间',
                    dataIndex: 'createTime',
                },
            ],
            fail: [
                { title: '处理人', dataIndex: 'transactorId' },
                { title: '申请类型', dataIndex: 'type', render: renderType },
                {
                    title: '创建时间',
                    dataIndex: 'createTime',
                },
                {
                    title: '处理时间',
                    dataIndex: 'endTime',
                },
            ],
        }),
        [],
    );

    const dataSource = useMemo(
        () => ({
            success: data?.filter((e) => e.code === 1),

            pending: data?.filter((e) => e.done === 0),

            fail: data?.filter((e) => e.done === 1 && e.code === 0),
        }),
        [activeTabKey, data],
    );

    const excludeMap = useMemo<Record<ApplicationStatus, ExcludeItem[]>>(
        () => ({
            success: ['isDelete', 'isPrivate'],
            pending: ['isDelete', 'isPrivate', 'action'],
            fail: ['isDelete', 'isPrivate', 'action'],
        }),
        [],
    );

    return (
        <Card
            title="我的申请"
            tabList={tabList}
            activeTabKey={activeTabKey}
            onTabChange={onTabChange}
        >
            <ExpandedTable
                key={activeTabKey}
                loading={loading}
                showColumnEncryption={false}
                pagination={false}
                columns={columnsMap[activeTabKey]}
                dataSource={dataSource[activeTabKey]}
                exclude={excludeMap[activeTabKey]}
                action={action}
                getClear={onDecrypt}
            />
        </Card>
    );
}

export default MyApplications;
