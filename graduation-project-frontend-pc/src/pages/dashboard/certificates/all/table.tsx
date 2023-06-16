import { useCallback, useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import { TableProps } from 'antd/es/table';
import { Evidence } from '@/common/type';
import {
    ApplicationResBody,
    applyForDecrypt,
    applyForDownload,
} from '@/service/application';
import ExpandedTable from '../../components/CertificateTable/expandedTable';
import { Action, GetClearFunc } from '../../components/CertificateTable';
import { getAllEvidencesResBody as Record } from '@/service/evidence';

interface AllPageProps extends TableProps<Record> {
    user?: string;
}

function ExpandedCertificatesTable({
    user,
    dataSource,
    loading,
}: AllPageProps) {
    const columns = useMemo(
        () => [{ title: '用户', dataIndex: 'creator' }],
        [],
    );
    const filteredDataSource = useMemo(
        () => dataSource?.filter((item) => item.creator !== user),
        [dataSource, user],
    );

    const onApplyForDecrypt = useCallback<GetClearFunc>(
        (id, field) => () => {
            console.log(id, field);
            return applyForDecrypt(id, field).then((res) => false);
        },
        [],
    );

    const onApplyForDownload = useCallback(
        (id: number) => () => {
            applyForDownload(id);
        },
        [],
    );

    const action = (record: ApplicationResBody): Action<Evidence> => ({
        data: (_, r) => {
            return (
                <Tooltip title="申请下载该证据">
                    <Button
                        type="link"
                        size="small"
                        onClick={onApplyForDownload(r.id)}
                    >
                        申请
                    </Button>
                </Tooltip>
            );
        },
    });

    return (
        <ExpandedTable
            apply
            rowKey="creator"
            showColumnEncryption={false}
            loading={loading}
            columns={columns}
            dataSource={filteredDataSource}
            action={action}
            getClear={onApplyForDecrypt}
        />
    );
}

export default ExpandedCertificatesTable;
