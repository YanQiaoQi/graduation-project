import { useCallback, useMemo } from 'react';
import { Button, Table as AntdTable, Tooltip } from 'antd';
import { TableProps } from 'antd/es/table';
import {
    AuthCertificate,
    Certificate,
    ColumnEncryption,
    Encryption,
    LedgerItem,
} from '@/common/type';
import Table, { Action } from '../../components/CertificateTable/index';
import {
    applyForDecrypt,
    applyForDownload,
    download,
    DownloadArgus,
} from '@/service/application';
import ExpandedTable from '../../components/CertificateTable/expandedTable';
import { downloadFileByBlob } from '@/common/utils';

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

    const onDownload = useCallback(
        (name: string) => (argus: DownloadArgus) => () => {
            download(argus).then((res) => {
                downloadFileByBlob(res, name);
            });
        },
        [],
    );

    const action = (record: LedgerItem): Action => ({
        data: (_, r: AuthCertificate) => {
            const { auth, created, name, extension } = r;
            const originalName = `${name}.${extension}`;
            return (
                auth.type === 'download' && (
                    <Tooltip title="下载该证据">
                        <Button
                            type="link"
                            size="small"
                            onClick={onDownload(originalName)({
                                email: record.user,
                                created,
                                password: '',
                            })}
                        >
                            下载
                        </Button>
                    </Tooltip>
                )
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
