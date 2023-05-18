import { useCallback, useMemo } from 'react';
import { Button, Table as AntdTable, Tooltip } from 'antd';
import { TableProps } from 'antd/es/table';
import {
    Certificate,
    ColumnEncryption,
    Encryption,
    LedgerItem,
} from '@/common/type';
import Table, { Action } from '../../components/CertificateTable/index';
import { applyForDecrypt, applyForDownload } from '@/service/application';
import ExpandedTable from '../../components/CertificateTable/expandedTable';

interface AllPageProps extends TableProps<LedgerItem> {
    user?: string;
    data?: LedgerItem[];
}

function ExpandedCertificatesTable({ user, data, loading }: AllPageProps) {
    const dataSource = useMemo(
        () => data?.filter((item) => item.user !== user) ?? [],
        [data],
    );

    const onApplyForDecrypt = useCallback(
        (record: LedgerItem) =>
            (encryption: Encryption, value: string) =>
            () => {
                return applyForDecrypt(record.user, 0);
            },
        [],
    );

    const onApplyForDownload = useCallback(
        (email: string, index: number) => () => {
            applyForDownload(email, index);
        },
        [],
    );

    const action = (record: LedgerItem): Action => ({
        data: (value, r, index) => {
            return (
                <Tooltip title="申请下载该证据">
                    <Button
                        type="link"
                        size="small"
                        onClick={onApplyForDownload(record.user, index - 1)}
                    >
                        申请
                    </Button>
                </Tooltip>
            );
        },
    });

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
