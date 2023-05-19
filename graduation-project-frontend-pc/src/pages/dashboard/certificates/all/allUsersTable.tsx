import { useCallback, useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import { TableProps } from 'antd/es/table';
import { Evidence } from '@/common/type';
import { applyForDecrypt, applyForDownload } from '@/service/application';
import ExpandedTable from '../../components/CertificateTable/expandedTable';
import { Action, GetClearFunc } from '../../components/CertificateTable';
import { getAllEvidencesResBody as Record } from '@/service/evidence';

interface AllPageProps extends TableProps<Record> {
    user?: string;
    data?: Record[];
}

function ExpandedCertificatesTable({ user, data, loading }: AllPageProps) {
    const dataSource = useMemo(
        () => data?.filter((item) => item.creator !== user) ?? [],
        [data],
    );

    const onApplyForDecrypt = useCallback<GetClearFunc>(
        (id, field) => () => {
            console.log(id, field);
            return applyForDecrypt(id, field);
        },
        [],
    );

    const onApplyForDownload = useCallback(
        (id: number) => () => {
            console.log(id);
            applyForDownload(id);
        },
        [],
    );

    const action: Action<Evidence> = {
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
    };

    return (
        <ExpandedTable
            loading={loading}
            data={dataSource}
            action={action}
            getClear={onApplyForDecrypt}
        />
    );
}

export default ExpandedCertificatesTable;
