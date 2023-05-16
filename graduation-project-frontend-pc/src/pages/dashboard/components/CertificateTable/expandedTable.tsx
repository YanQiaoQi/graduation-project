import { useCallback, useMemo } from 'react';
import { Table as AntdTable } from 'antd';
import { TableProps } from 'antd/es/table';
import { Encryption, LedgerItem } from '@/common/type';
import Table, { Action } from '../../components/CertificateTable/index';

interface AllPageProps extends TableProps<LedgerItem> {
    user?: string;
    data?: LedgerItem[];
    getClear: (
        record: LedgerItem,
    ) => (encryption: Encryption, value: string) => () => Promise<any>;
    action: (record: LedgerItem) => Action;
}

function ExpandedCertificatesTable({
    data,
    loading,
    action,
    getClear,
}: AllPageProps) {
    const columns = useMemo(() => [{ title: '用户', dataIndex: 'user' }], []);

    const expandedRowRender = useCallback((record: LedgerItem) => {
        return (
            <Table
                data={record.certificates}
                columnEncryption={record.columnEncryption}
                action={action(record)}
                getClear={getClear(record)}
            />
        );
    }, []);

    return (
        <AntdTable
            loading={loading}
            rowKey={'user'}
            dataSource={data}
            columns={columns}
            expandable={{
                expandedRowRender,
                // defaultExpandedRowKeys: [
                //     dataSource.length === 0 ? '' : dataSource[0]?.['user'],
                // ],
            }}
        />
    );
}

export default ExpandedCertificatesTable;
