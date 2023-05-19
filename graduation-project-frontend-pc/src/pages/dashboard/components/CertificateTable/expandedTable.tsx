import { useCallback, useMemo } from 'react';
import { Table as AntdTable } from 'antd';
import { TableProps } from 'antd/es/table';
import Table, {
    Action,
    GetClearFunc,
} from '../../components/CertificateTable/index';
import { getAllEvidencesResBody as Record } from '@/service/evidence';

interface AllPageProps extends TableProps<Record> {
    user?: string;
    data?: Record[];
    action: Action;
    getClear?: GetClearFunc;
}

function ExpandedCertificatesTable({
    data,
    loading,
    action,
    getClear,
}: AllPageProps) {
    const columns = useMemo(
        () => [{ title: '用户', dataIndex: 'creator' }],
        [],
    );

    const expandedRowRender = useCallback((record: Record) => {
        return (
            <Table
                getClear={getClear}
                data={record.evidences}
                columnEncryption={record.fieldEncryption}
                action={action}
            />
        );
    }, []);

    return (
        <AntdTable
            loading={loading}
            rowKey={'creator'}
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
