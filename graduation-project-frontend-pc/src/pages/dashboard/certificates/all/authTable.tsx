import { useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import { TableProps } from 'antd/es/table';
import { Evidence } from '@/common/type';
import { Action } from '../../components/CertificateTable/index';
import ExpandedTable from '../../components/CertificateTable/expandedTable';
import { getAllEvidencesResBody as Record } from '@/service/evidence';

interface AllPageProps extends TableProps<Record> {
    user?: string;
    data?: Record[];
}

function ExpandedCertificatesTable({ user, data, loading }: AllPageProps) {
    const columns = useMemo(
        () => [{ title: '用户', dataIndex: 'creator' }],
        [],
    );

    const dataSource = useMemo(
        () => data?.filter((item) => item.creator !== user) ?? [],
        [data],
    );

    const action: Action<Evidence> = {
        data: (_, r) => {
            const { name, extension } = r;
            const originalName = `${name}.${extension}`;
            return (
                <Tooltip title="下载该证据">
                    <Button type="link" size="small">
                        下载
                    </Button>
                </Tooltip>
            );
        },
    };

    return (
        <ExpandedTable
            rowKey="creator"
            columns={columns}
            loading={loading}
            dataSource={dataSource}
            action={action}
        />
    );
}

export default ExpandedCertificatesTable;
