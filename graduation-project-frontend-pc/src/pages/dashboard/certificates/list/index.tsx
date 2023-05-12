import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card } from 'antd';
import { defaultColumnEncryption, URL } from '@/common/constant';
import request from '@/common/request';
import { Certificate, ColumnEncryption } from '@/common/type';
import TableFilter from './filter';
import Table from './table';

const CertificatesListPage: React.FC = () => {
    const [tableData, setTableData] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [columnEncryption, setColumnEncryption] = useState<ColumnEncryption>(
        defaultColumnEncryption,
    );

    const allTableData = useRef<Certificate[]>([]);

    const getData = useCallback(async () => {
        return request.get(URL.CERTIFICATE).then((res) => {
            allTableData.current = res.data.certificates;
            setTableData(res.data.certificates);
            setColumnEncryption(res.data.columnEncryption);
            return res;
        });
    }, []);

    useEffect(() => {
        getData().then(() => {
            setLoading(false);
        });
    }, []);

    return (
        <Card
            title="证据列表"
            extra={
                <Button href="/dashboard/certificates/new">+ 新建证据</Button>
            }
        >
            <TableFilter data={allTableData.current} setData={setTableData} />
            <Table
                loading={loading}
                columnEncryption={columnEncryption}
                setColumnEncryption={setColumnEncryption}
                data={tableData}
                setData={setTableData}
                getData={getData}
            />
        </Card>
    );
};

export default CertificatesListPage;
