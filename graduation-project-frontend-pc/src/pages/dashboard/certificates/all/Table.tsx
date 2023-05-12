import { useCallback, useMemo } from 'react';
import { Button, Table as AntdTable, Tooltip } from 'antd';
import { TableProps } from 'antd/es/table';
import { Certificate, ColumnEncryption, Encryption } from '@/common/type';
import request from '@/common/request';
import { URL } from '@/common/constant';
import Table, { Action } from '../../components/CertificateTable/index';
import { applyForDecrypt, applyForDownload } from '@/service/certificate';

type Record = {
    user: string;
    certificates: Certificate[];
    columnEncryption: ColumnEncryption;
};

interface AllPageProps extends TableProps<Record> {
    user: string;
    data: Record[];
}

function ExpandedCertificatesTable({ user, data, loading }: AllPageProps) {
    const columns = useMemo(() => [{ title: '用户', dataIndex: 'user' }], []);

    const dataSource = useMemo(
        () => data?.filter((item) => item.user !== user) ?? [],
        [data],
    );

    const onApplyForDecrypt = useCallback(
        (email) => (encryption: Encryption, value: string) => () => {
            console.log(email, encryption, value);
            return applyForDecrypt(email, 0);
        },
        [],
    );

    const onApplyForDownload = useCallback(
        (email: string, index: number) => () => {
            console.log(email, index);

            applyForDownload(email, index);
        },
        [],
    );

    const expandedRowRender = useCallback((record: Record) => {
        const action: Action = {
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
        };
        return (
            <Table
                data={record.certificates}
                columnEncryption={record.columnEncryption}
                action={action}
                getClear={onApplyForDecrypt(record.user)}
            />
        );
    }, []);

    return (
        <AntdTable
            loading={loading}
            rowKey={'user'}
            dataSource={dataSource}
            columns={columns}
            expandable={{
                expandedRowRender,
                defaultExpandedRowKeys: [
                    dataSource.length === 0 ? '' : dataSource[0]?.['user'],
                ],
            }}
        />
    );
}

export default ExpandedCertificatesTable;
