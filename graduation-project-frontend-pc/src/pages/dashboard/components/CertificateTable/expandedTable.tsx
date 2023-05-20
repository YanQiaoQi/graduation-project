import { useCallback, useMemo } from 'react';
import { Table as AntdTable } from 'antd';
import { TableProps } from 'antd/es/table';
import Table, {
    Action,
    ExcludeItem,
    GetClearFunc,
} from '../../components/CertificateTable/index';
import { format } from '@/common/utils';
import { Email, EvidenceFieldEncryptionMap } from '@/common/type';
import { ApplicationResBody } from '@/service/application';

interface AllPageProps<T = any> extends TableProps<T> {
    apply?: boolean;
    showColumnEncryption?: boolean;
    action?: (record: T) => Action;
    getClear?: GetClearFunc;
    exclude?: ExcludeItem[];
}

function ExpandedCertificatesTable({
    apply,
    showColumnEncryption,
    action,
    getClear,
    exclude = ['isDelete', 'isPrivate'],
    pagination,
    columns,
    ...restProps
}: AllPageProps) {
    const expandedRowRender = (record: ApplicationResBody) => {
        return (
            <Table
                getClear={getClear}
                showColumnEncryption={showColumnEncryption}
                columnEncryption={record.fieldEncryption}
                dataSource={record.evidences}
                action={action?.(record)}
                exclude={exclude}
                pagination={pagination}
                access={record.access}
                apply={apply}
            />
        );
    };

    const mergedColumns = columns?.map((col) => {
        //@ts-ignore
        const dataIndex = col.dataIndex;
        return {
            render: format(dataIndex),
            ...col,
        };
    });

    return (
        <AntdTable
            rowKey="id"
            columns={mergedColumns}
            expandable={{
                expandedRowRender,
                // defaultExpandedRowKeys: [
                //     dataSource.length === 0 ? '' : dataSource[0]?.['user'],
                // ],
            }}
            {...restProps}
        />
    );
}

export default ExpandedCertificatesTable;
